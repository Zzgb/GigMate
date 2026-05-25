/**
 * route.ts
 * 里程碑附件下载 API - 权限校验，防止直接执行
 * 修改日期: 2026-05-25
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("file");
    if (!filename) return NextResponse.json({ error: "缺少文件名" }, { status: 400 });

    // 防止路径穿越
    if (filename.includes("..") || filename.includes("/")) {
      return NextResponse.json({ error: "非法文件名" }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const attachment = await prisma.milestoneAttachment.findFirst({
      where: { filename },
      include: {
        approval: {
          include: {
            milestone: {
              include: { task: true },
            },
          },
        },
      },
    });

    if (!attachment) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    const task = attachment.approval.milestone.task;
    const isEmployer = task.employerId === session.user.id;
    const isAssignedFreelancer = !!(await prisma.application.findFirst({
      where: { taskId: task.id, freelancerId: session.user.id, status: "ACCEPTED" },
    }));

    if (!isEmployer && !isAssignedFreelancer) {
      return NextResponse.json({ error: "无权下载此文件" }, { status: 403 });
    }

    const filepath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "milestone-attachments",
      filename
    );
    const buffer = await readFile(filepath);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(attachment.originalName)}"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "下载失败" }, { status: 500 });
  }
}
