/**
 * milestone-actions.ts
 * 里程碑 Server Actions - 提交验收、审批通过/驳回、查询
 * 修改日期: 2026-05-25
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getMilestonesByTask(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.milestone.findMany({
    where: { taskId },
    orderBy: { order: "asc" },
    include: {
      approvals: {
        orderBy: { createdAt: "desc" },
        include: {
          milestone: true,
          submittedBy: { select: { id: true, name: true, avatarUrl: true } },
          reviewedBy: { select: { id: true, name: true } },
          attachments: true,
        },
      },
    },
  });
}

export async function getPendingApproval(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.milestoneApproval.findFirst({
    where: {
      milestone: { taskId },
      status: "PENDING",
    },
    include: {
      milestone: true,
      submittedBy: { select: { id: true, name: true, avatarUrl: true } },
      attachments: true,
    },
  });
}

export async function submitMilestoneForApproval(
  milestoneId: string,
  description: string,
  attachmentUrls: { url: string; filename: string; originalName: string; fileSize: number; mimeType: string }[],
  conversationId?: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  // 获取里程碑和任务信息
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { task: true },
  });
  if (!milestone) throw new Error("里程碑不存在");

  const task = milestone.task;

  // 校验：任务状态必须是 IN_PROGRESS
  if (task.status !== "IN_PROGRESS") throw new Error("任务未在进行中，无法提交验收");

  // 校验：里程碑状态必须是 PENDING 或 REJECTED
  if (milestone.status !== "PENDING" && milestone.status !== "REJECTED") {
    throw new Error("该里程碑当前状态不可提交");
  }

  // 校验：提交人是该任务的已接受自由职业者
  const acceptedApp = await prisma.application.findFirst({
    where: { taskId: task.id, freelancerId: userId, status: "ACCEPTED" },
  });
  if (!acceptedApp) throw new Error("只有已被接受的自由职业者才能提交验收");

  // 校验：同一任务没有其他待审批的审批
  const pendingApproval = await prisma.milestoneApproval.findFirst({
    where: {
      milestone: { taskId: task.id },
      status: "PENDING",
    },
  });
  if (pendingApproval) throw new Error("该任务已有待审批的里程碑，请等待审批完成后再提交下一节点");

  // 事务：状态更新 + 审批创建 + 标记消息，失败全部回滚
  return prisma.$transaction(async (tx) => {
    const updated = await tx.milestone.updateMany({
      where: {
        id: milestoneId,
        status: milestone.status,
        version: milestone.version,
      },
      data: {
        status: "SUBMITTED",
        version: { increment: 1 },
      },
    });

    if (updated.count === 0) throw new Error("里程碑状态已变更，请刷新后重试");

    const approval = await tx.milestoneApproval.create({
      data: {
        milestoneId,
        submittedById: userId,
        description,
        status: "PENDING",
        attachments: {
          create: attachmentUrls.map((a) => ({
            filename: a.filename,
            originalName: a.originalName,
            fileSize: a.fileSize,
            mimeType: a.mimeType,
            url: a.url,
          })),
        },
      },
      include: {
        milestone: true,
        submittedBy: { select: { id: true, name: true, avatarUrl: true } },
        attachments: true,
      },
    });

    if (conversationId) {
      await tx.message.create({
        data: {
          content: `[里程碑审批:${approval.id}]`,
          senderId: userId,
          conversationId,
        },
      });
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
    }

    return approval;
  });
}

export async function approveMilestone(approvalId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  // 使用交互式事务 + 行级锁
  return prisma.$transaction(async (tx) => {
    // 1. 行级锁：锁定审批记录对应的里程碑
    const rows = await tx.$queryRawUnsafe<{ id: string; status: string; amount: number; taskId: string }[]>(
      `SELECT m.id, m.status, m.amount, m."taskId"
       FROM "Milestone" m
       INNER JOIN "MilestoneApproval" a ON a."milestoneId" = m.id
       WHERE a.id = $1
       FOR UPDATE OF m`,
      approvalId
    );
    if (rows.length === 0) throw new Error("审批记录不存在");
    const { id: milestoneId, status: msStatus, amount, taskId } = rows[0];
    if (msStatus !== "SUBMITTED") throw new Error("里程碑状态不正确");

    // 2. 行级锁：锁定审批记录本身
    const approvalRows = await tx.$queryRawUnsafe<{ id: string; status: string }[]>(
      `SELECT id, status FROM "MilestoneApproval" WHERE id = $1 FOR UPDATE`,
      approvalId
    );
    if (approvalRows.length === 0 || approvalRows[0].status !== "PENDING") {
      throw new Error("该审批已处理");
    }

    // 3. 锁定任务行
    const taskRows = await tx.$queryRawUnsafe<{ id: string; escrow: number; employerId: string; budget: number }[]>(
      `SELECT id, escrow, "employerId", budget FROM "Task" WHERE id = $1 FOR UPDATE`,
      taskId
    );
    if (taskRows.length === 0) throw new Error("任务不存在");
    const task = taskRows[0];

    // 4. 校验：调用人是任务雇主
    if (task.employerId !== userId) throw new Error("只有雇主才能审批");

    // 5. 计算金额
    const platformFee = Math.round(amount * 0.05 * 100) / 100;
    const freelancerAmount = Math.round((amount - platformFee) * 100) / 100;

    // 6. 校验托管余额
    if (task.escrow < amount) {
      await tx.transaction.create({
        data: {
          taskId, milestoneId,
          type: "FREELANCER_PAYMENT",
          amount,
          description: `付款失败：托管余额 ¥${task.escrow} 不足 ¥${amount}`,
          operatorId: userId,
        },
      });
      throw new Error(`托管余额不足：需要 ¥${amount}，当前托管余额 ¥${task.escrow}`);
    }

    // 7. 更新审批状态
    await tx.milestoneApproval.update({
      where: { id: approvalId },
      data: {
        status: "APPROVED",
        reviewedById: userId,
        reviewedAt: new Date(),
      },
    });

    // 8. 更新里程碑状态
    await tx.milestone.update({
      where: { id: milestoneId },
      data: { status: "APPROVED" },
    });

    // 9. 扣减托管金
    const escrowAfter = Math.round((task.escrow - amount) * 100) / 100;
    await tx.task.update({
      where: { id: taskId },
      data: { escrow: escrowAfter },
    });

    // 10. 获取提交人 ID
    const approval = await tx.milestoneApproval.findUnique({
      where: { id: approvalId },
      select: { submittedById: true },
    });

    // 11. 打款给自由职业者
    await tx.user.update({
      where: { id: approval!.submittedById },
      data: { balance: { increment: freelancerAmount } },
    });

    // 12. 记录交易日志
    await tx.transaction.createMany({
      data: [
        {
          taskId, milestoneId,
          type: "FREELANCER_PAYMENT",
          amount: freelancerAmount,
          payeeId: approval!.submittedById,
          escrowBefore: task.escrow,
          escrowAfter,
          operatorId: userId,
          description: `里程碑验收付款 ¥${freelancerAmount}（已扣除 5% 手续费）`,
        },
        {
          taskId, milestoneId,
          type: "PLATFORM_FEE",
          amount: platformFee,
          escrowBefore: task.escrow,
          escrowAfter,
          operatorId: userId,
          description: `平台手续费 5% = ¥${platformFee}`,
        },
      ],
    });

    // 13. 检查是否所有里程碑都已通过 → 自动完成任务
    const pendingCount = await tx.milestone.count({
      where: { taskId, status: { not: "APPROVED" } },
    });
    if (pendingCount === 0) {
      await tx.task.update({
        where: { id: taskId },
        data: { status: "COMPLETED" },
      });
      await tx.taskStatusLog.create({
        data: {
          taskId,
          fromStatus: "IN_PROGRESS",
          toStatus: "COMPLETED",
          event: "里程碑全部验收完成",
          operatorId: userId,
        },
      });
    }

    return { success: true };
  });
}

export async function rejectMilestone(approvalId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  // 校验审批状态和权限
  const approval = await prisma.milestoneApproval.findUnique({
    where: { id: approvalId },
    include: { milestone: { include: { task: { select: { employerId: true } } } } },
  });

  if (!approval) throw new Error("审批记录不存在");
  if (approval.status !== "PENDING") throw new Error("该审批已处理");
  if (approval.milestone.task.employerId !== userId) throw new Error("只有雇主才能审批");

  // 更新审批和里程碑状态
  await prisma.$transaction([
    prisma.milestoneApproval.update({
      where: { id: approvalId },
      data: {
        status: "REJECTED",
        reviewedById: userId,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    }),
    prisma.milestone.update({
      where: { id: approval.milestoneId },
      data: { status: "REJECTED" },
    }),
  ]);

  return { success: true };
}
