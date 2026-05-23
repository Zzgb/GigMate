/**
 * application-actions.ts
 * 申请 Server Actions - applyForTask、getApplicationsForTask、acceptApplication（通过+拒绝其余）、rejectApplication
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function applyForTask(taskId: string, message: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.application.create({
    data: {
      taskId,
      message,
      freelancerId: session.user.id,
      status: "PENDING",
    },
  });
}

export async function getApplicationsForTask(taskId: string) {
  return prisma.application.findMany({
    where: { taskId },
    include: { freelancer: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function acceptApplication(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const app = await prisma.application.update({
    where: { id: applicationId },
    data: { status: "ACCEPTED" },
    include: { task: true },
  });

  await prisma.task.update({
    where: { id: app.taskId },
    data: { status: "IN_PROGRESS" },
  });

  await prisma.application.updateMany({
    where: { taskId: app.taskId, status: "PENDING" },
    data: { status: "REJECTED" },
  });

  return app;
}

export async function rejectApplication(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.application.update({
    where: { id: applicationId },
    data: { status: "REJECTED" },
  });
}
