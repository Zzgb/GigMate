/**
 * dashboard-actions.ts
 * 控制台 Server Actions - getDashboardData（角色感知双端数据）、completeTask、cancelTask、createReview
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getDashboardData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;
  const role = (session.user as any).role;

  if (role === "freelancer") {
    const activeTasks = await prisma.task.findMany({
      where: {
        status: "IN_PROGRESS",
        applications: { some: { freelancerId: userId, status: "ACCEPTED" } },
      },
      include: {
        employer: { select: { id: true, name: true, avatarUrl: true } },
        milestones: { orderBy: { order: "asc" } },
      },
    });
    const completedTasks = await prisma.task.findMany({
      where: {
        status: "COMPLETED",
        applications: { some: { freelancerId: userId, status: "ACCEPTED" } },
      },
      include: {
        employer: { select: { id: true, name: true } },
        reviews: { include: { reviewer: { select: { id: true, name: true } }, reviewee: { select: { id: true, name: true } } } },
        milestones: { orderBy: { order: "asc" } },
      },
    });
    const pendingApps = await prisma.application.findMany({
      where: { freelancerId: userId, status: "PENDING" },
      include: { task: { select: { id: true, title: true, budget: true, budgetMin: true, employer: { select: { id: true, name: true, avatarUrl: true } } } } },
    });

    return {
      role: "freelancer",
      activeTasks,
      completedTasks,
      pendingApps,
      stats: {
        active: activeTasks.length,
        completed: completedTasks.length,
        pending: pendingApps.length,
      },
    };
  }

  // Employer
  const activeTasks = await prisma.task.findMany({
    where: { employerId: userId, status: "IN_PROGRESS" },
    include: {
      applications: {
        where: { status: "ACCEPTED" },
        include: { freelancer: { select: { id: true, name: true, avatarUrl: true } } },
      },
      milestones: { orderBy: { order: "asc" } },
    },
  });
  const completedTasks = await prisma.task.findMany({
    where: { employerId: userId, status: "COMPLETED" },
    include: {
      applications: {
        where: { status: "ACCEPTED" },
        include: { freelancer: { select: { id: true, name: true, avatarUrl: true } } },
      },
      reviews: { include: { reviewer: { select: { id: true, name: true } }, reviewee: { select: { id: true, name: true } } } },
      milestones: { orderBy: { order: "asc" } },
    },
  });
  const openTasks = await prisma.task.findMany({
    where: { employerId: userId, status: "OPEN" },
    include: { _count: { select: { applications: true } } },
  });
  const pendingApps = await prisma.application.findMany({
    where: { task: { employerId: userId }, status: "PENDING" },
    include: {
      task: { select: { id: true, title: true } },
      freelancer: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return {
    role: "employer",
    activeTasks,
    completedTasks,
    openTasks,
    pendingApps,
    stats: {
      active: activeTasks.length,
      completed: completedTasks.length,
      applications: pendingApps.length,
    },
  };
}

export async function completeTask(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { status: true } });
  if (!task) throw new Error("任务不存在");

  const [updated] = await Promise.all([
    prisma.task.update({ where: { id: taskId }, data: { status: "COMPLETED" } }),
    prisma.taskStatusLog.create({
      data: {
        taskId,
        fromStatus: task.status,
        toStatus: "COMPLETED",
        event: "雇主完成任务",
        operatorId: session.user!.id,
      },
    }),
  ]);
  return updated;
}

export async function cancelTask(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { status: true } });
  if (!task) throw new Error("任务不存在");

  const [updated] = await Promise.all([
    prisma.task.update({ where: { id: taskId }, data: { status: "CANCELLED" } }),
    prisma.taskStatusLog.create({
      data: {
        taskId,
        fromStatus: task.status,
        toStatus: "CANCELLED",
        event: "雇主取消任务",
        operatorId: session.user!.id,
      },
    }),
  ]);
  return updated;
}

export async function createReview(data: {
  taskId: string;
  revieweeId: string;
  rating: number;
  comment?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  // 校验：任务已完成
  const task = await prisma.task.findUnique({ where: { id: data.taskId }, select: { status: true } });
  if (!task || task.status !== "COMPLETED") throw new Error("只能评价已完成的任务");

  // 校验：评价人是任务参与者
  const isEmployer = await prisma.task.findFirst({ where: { id: data.taskId, employerId: userId } });
  const isAcceptedFreelancer = await prisma.application.findFirst({
    where: { taskId: data.taskId, freelancerId: userId, status: "ACCEPTED" },
  });
  if (!isEmployer && !isAcceptedFreelancer) throw new Error("只有任务参与者才能评价");

  // 校验：每人每任务只能评价一次
  const existing = await prisma.review.findFirst({
    where: { taskId: data.taskId, reviewerId: userId },
  });
  if (existing) throw new Error("您已评价过该任务");

  return prisma.review.create({
    data: { ...data, reviewerId: userId },
    include: {
      reviewer: { select: { id: true, name: true } },
      reviewee: { select: { id: true, name: true } },
    },
  });
}
