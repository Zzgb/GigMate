/**
 * route.ts
 * 文件上传 API - 支持头像和聊天文件上传，存储到 public/uploads/
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "未选择文件" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 按类型分目录
    const isImage = file.type.startsWith("image/");
    const subDir = isImage ? "avatars" : "files";
    const uploadDir = path.join(process.cwd(), "public", "uploads", subDir);
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() || "bin";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    const url = `/uploads/${subDir}/${filename}`;
    return NextResponse.json({ url, filename });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
