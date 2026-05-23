/**
 * task-actions.ts
 * 任务 Server Actions - getTasks（分页+筛选排序）、getTaskById、createTask、getEmployerTasks、updateProfile
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getTasks(filters?: {
  search?: string;
  category?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 10;
  const where: Record<string, any> = { status: "OPEN" };

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters?.category) {
    where.category = filters.category;
  }

  let orderBy: Record<string, any> = { createdAt: "desc" };
  if (filters?.sort === "budget_asc") orderBy = { budget: "asc" };
  if (filters?.sort === "budget_desc") orderBy = { budget: "desc" };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { employer: { select: { id: true, name: true } } },
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, total, pages: Math.ceil(total / pageSize), page };
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      employer: { select: { id: true, name: true } },
      applications: {
        include: { freelancer: { select: { id: true, name: true } } },
      },
      _count: { select: { applications: true } },
    },
  });
}

export async function createTask(data: {
  title: string;
  description: string;
  budget: number;
  category?: string;
  deadline?: Date;
  skills?: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      budget: data.budget,
      category: data.category,
      deadline: data.deadline,
      skills: data.skills || [],
      employerId: session.user.id,
      status: "OPEN",
    },
  });
}

export async function getEmployerTasks() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.task.findMany({
    where: { employerId: session.user.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateProfile(data: { name?: string; avatarUrl?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(data.name ? { name: data.name } : {}),
    },
  });
}
