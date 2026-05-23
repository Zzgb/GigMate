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
      include: { employer: { select: { id: true, name: true } } },
    });
    const completedTasks = await prisma.task.findMany({
      where: {
        status: "COMPLETED",
        applications: { some: { freelancerId: userId, status: "ACCEPTED" } },
      },
      include: {
        employer: { select: { id: true, name: true } },
        reviews: { select: { id: true, rating: true, comment: true, reviewerId: true, revieweeId: true } },
      },
    });
    const pendingApps = await prisma.application.findMany({
      where: { freelancerId: userId, status: "PENDING" },
      include: { task: { select: { id: true, title: true, budget: true } } },
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
        include: { freelancer: { select: { id: true, name: true } } },
      },
    },
  });
  const completedTasks = await prisma.task.findMany({
    where: { employerId: userId, status: "COMPLETED" },
    include: {
      applications: {
        where: { status: "ACCEPTED" },
        include: { freelancer: { select: { id: true, name: true } } },
      },
      reviews: { select: { id: true, rating: true, comment: true, reviewerId: true, revieweeId: true } },
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
      freelancer: { select: { id: true, name: true } },
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
  return prisma.task.update({
    where: { id: taskId },
    data: { status: "COMPLETED" },
  });
}

export async function cancelTask(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return prisma.task.update({
    where: { id: taskId },
    data: { status: "CANCELLED" },
  });
}

export async function createReview(data: {
  taskId: string;
  revieweeId: string;
  rating: number;
  comment?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return prisma.review.create({
    data: { ...data, reviewerId: session.user.id },
  });
}
