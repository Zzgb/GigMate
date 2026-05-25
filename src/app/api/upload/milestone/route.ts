/**
 * route.ts
 * 里程碑附件上传 API - UUID 重命名、类型/大小校验、权限检查
 * 修改日期: 2026-05-25
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/vnd.openxmlformats-officedocument.",
  "application/vnd.ms-",
  "text/",
];

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "未选择文件" }, { status: 400 });

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "文件大小超过 10MB 限制" }, { status: 400 });
    }

    const isAllowed = ALLOWED_TYPES.some((t) => file.type.startsWith(t));
    if (!isAllowed) {
      return NextResponse.json({ error: "不支持的文件类型" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "bin";
    const uuidName = `${uuidv4()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "milestone-attachments");
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(path.join(uploadDir, uuidName), buffer);

    const url = `/uploads/milestone-attachments/${uuidName}`;
    return NextResponse.json({
      url,
      filename: uuidName,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Milestone upload error:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
