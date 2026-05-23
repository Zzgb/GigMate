/**
 * task-actions.ts
 * 任务 Server Actions - getTasks（筛选排序）、getTaskById、createTask、getEmployerTasks
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
}) {
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

  return prisma.task.findMany({
    where,
    orderBy,
    include: { employer: { select: { id: true, name: true } } },
  });
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      employer: { select: { id: true, name: true } },
      applications: {
        include: { freelancer: { select: { id: true, name: true } } },
      },
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
