/**
 * route.ts
 * 注册 API 端点 - 创建用户（bcrypt 密码哈希）+ 重复邮箱检测
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "请填写所有字段" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        roles: ["FREELANCER", "EMPLOYER"],
      },
    });

    return NextResponse.json({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
