/**
 * route.ts
 * 注册 API - 首次创建或已有邮箱追加角色
 * 修改日期: 2026-05-25
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, name, password, role, avatarUrl } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: "请填写所有字段" }, { status: 400 });
    }

    const targetRole = role === "employer" ? "EMPLOYER" : "FREELANCER";
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      // 已有账号：校验密码 + 检查角色
      if (!existing.passwordHash) {
        return NextResponse.json({ error: "该邮箱通过 OAuth 注册，请使用 OAuth 登录后在设置中添加角色" }, { status: 409 });
      }

      const valid = await bcrypt.compare(password, existing.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "密码错误" }, { status: 401 });
      }

      if (existing.roles.includes(targetRole)) {
        return NextResponse.json({ error: "您已拥有该端权限，无需重复注册" }, { status: 409 });
      }

      if (existing.roles.includes("EMPLOYER") && existing.roles.includes("FREELANCER")) {
        return NextResponse.json({ error: "您已拥有双端权限，无需重复注册" }, { status: 409 });
      }

      // 追加角色
      const updated = await prisma.user.update({
        where: { email },
        data: {
          roles: { push: targetRole },
          passwordHash: await bcrypt.hash(password, 10), // 更新密码
        },
      });

      return NextResponse.json({ id: updated.id, email: updated.email, name: updated.name, roles: updated.roles });
    }

    // 首次注册
    if (!name) {
      return NextResponse.json({ error: "请填写昵称" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        roles: [targetRole],
        ...(avatarUrl ? { avatarUrl } : {}),
      },
    });

    return NextResponse.json({ id: user.id, email: user.email, name: user.name, roles: user.roles });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
