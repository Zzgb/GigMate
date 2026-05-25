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

  const existing = await prisma.application.findFirst({
    where: { taskId, freelancerId: session.user.id, status: "PENDING" },
  });
  if (existing) throw new Error("您已申请过该任务，请等待雇主审核");

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

  return prisma.$transaction(async (tx) => {
    // 先查 application 获取确定的 taskId（避免 Prisma update+include 返回值中 taskId 可能为 undefined 导致 updateMany 过滤条件被静默丢弃）
    const application = await tx.application.findUnique({
      where: { id: applicationId },
      select: { id: true, taskId: true },
    });
    if (!application) throw new Error("申请不存在");
    const taskId = application.taskId;

    // 查任务信息
    const task = await tx.task.findUnique({
      where: { id: taskId },
      select: { id: true, budget: true },
    });
    if (!task) throw new Error("任务不存在");

    // 更新申请状态
    await tx.application.update({
      where: { id: applicationId },
      data: { status: "ACCEPTED" },
    });

    // 更新任务状态
    await tx.task.update({
      where: { id: taskId },
      data: { status: "IN_PROGRESS" },
    });

    // 拒绝同任务的其他待审批申请
    await tx.application.updateMany({
      where: { taskId, status: "PENDING" },
      data: { status: "REJECTED" },
    });

    // 状态日志
    await tx.taskStatusLog.create({
      data: {
        taskId,
        fromStatus: "OPEN",
        toStatus: "IN_PROGRESS",
        event: "通过申请",
        operatorId: session.user!.id,
      },
    });

    return { success: true, taskId };
  });
}

export async function rejectApplication(applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.application.update({
    where: { id: applicationId },
    data: { status: "REJECTED" },
  });
}
