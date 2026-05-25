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

  const session = await auth();
  const userId = session?.user?.id;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        employer: { select: { id: true, name: true, avatarUrl: true } },
        applications: userId ? {
          where: { freelancerId: userId },
          select: { id: true, status: true },
        } : false,
      },
    }),
    prisma.task.count({ where }),
  ]);

  // Map application status for each task: null=none, "PENDING", "REJECTED"
  const tasksWithAppStatus = tasks.map((t) => {
    const apps = (t as any).applications || [];
    const pending = apps.find((a: any) => a.status === "PENDING");
    const rejected = apps.find((a: any) => a.status === "REJECTED");
    const { applications, ...rest } = t as any;
    return {
      ...rest,
      appStatus: pending ? "PENDING" : rejected ? "REJECTED" : (apps.length > 0 ? "ACCEPTED" : null),
    };
  });

  return { tasks: tasksWithAppStatus, total, pages: Math.ceil(total / pageSize), page };
}

export async function getTaskById(id: string) {
  const session = await auth();
  const userId = session?.user?.id;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      employer: { select: { id: true, name: true, avatarUrl: true } },
      applications: {
        include: { freelancer: { select: { id: true, name: true } } },
      },
      _count: { select: { applications: true } },
    },
  });

  if (!task) return null;

  const myApp = userId
    ? task.applications.find((a) => a.freelancerId === userId)
    : null;

  return { ...task, appStatus: myApp?.status || null };
}

export async function createTask(data: {
  title: string;
  description: string;
  budget: number;
  budgetMin?: number;
  category?: string;
  deadline?: Date;
  skills?: string[];
  milestones?: { name: string; criteria: string; ratio: number }[];
  paymentMethod?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const milestones = data.milestones || [];
  const paymentMethod = data.paymentMethod || "unknown";

  return prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        title: data.title,
        description: data.description,
        budget: data.budget,
        budgetMin: data.budgetMin || null,
        category: data.category,
        deadline: data.deadline,
        skills: data.skills || [],
        employerId: session.user!.id,
        status: "OPEN",
        escrow: data.budget, // 创建任务时雇主付款到平台托管
      },
    });

    if (milestones.length > 0) {
      await tx.milestone.createMany({
        data: milestones.map((m, i) => ({
          taskId: task.id,
          order: i + 1,
          name: m.name,
          criteria: m.criteria,
          ratio: m.ratio,
          amount: Math.round((m.ratio / 100) * data.budget * 100) / 100,
          status: "PENDING",
        })),
      });
    }

    // 状态日志
    await tx.taskStatusLog.create({
      data: {
        taskId: task.id,
        fromStatus: null,
        toStatus: "OPEN",
        event: "任务创建",
        operatorId: session.user!.id,
      },
    });

    // 托管金入账（雇主发布任务时付款）
    await tx.transaction.create({
      data: {
        taskId: task.id,
        type: "DEPOSIT",
        amount: data.budget,
        payerId: session.user!.id,
        escrowAfter: data.budget,
        operatorId: session.user!.id,
        description: `雇主通过 ${paymentMethod} 付款 ¥${data.budget}，托管至平台`,
      },
    });

    return task;
  });
}

export async function republishTask(params: {
  parentTaskId: string;
  title: string;
  description: string;
  budget: number;
  category?: string;
  deadline?: Date;
  skills?: string[];
  milestones: { name: string; criteria: string; ratio: number }[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  return prisma.$transaction(async (tx) => {
    // 锁定父任务
    const rows = await tx.$queryRawUnsafe<{ id: string; escrow: number; employerId: string; status: string }[]>(
      `SELECT id, escrow, "employerId", status FROM "Task" WHERE id = $1 FOR UPDATE`,
      params.parentTaskId
    );
    if (rows.length === 0) throw new Error("原任务不存在");
    const parent = rows[0];
    if (parent.employerId !== userId) throw new Error("只有雇主才能重新发布");

    const remainingEscrow = parent.escrow;

    // 创建新任务
    const newTask = await tx.task.create({
      data: {
        title: params.title,
        description: params.description,
        budget: params.budget,
        category: params.category,
        deadline: params.deadline,
        skills: params.skills || [],
        employerId: userId,
        status: "OPEN",
        parentTaskId: params.parentTaskId,
      },
    });

    // 托管金转移
    const amountToTransfer = Math.min(remainingEscrow, params.budget);
    if (amountToTransfer > 0) {
      await tx.task.update({
        where: { id: params.parentTaskId },
        data: { escrow: remainingEscrow - amountToTransfer },
      });
      await tx.task.update({
        where: { id: newTask.id },
        data: { escrow: amountToTransfer },
      });

      await tx.transaction.create({
        data: {
          taskId: params.parentTaskId,
          type: "TRANSFER_OUT",
          amount: amountToTransfer,
          escrowBefore: remainingEscrow,
          escrowAfter: remainingEscrow - amountToTransfer,
          operatorId: userId,
          description: `薪酬转移至重新发布任务 ${newTask.id}`,
        },
      });
      await tx.transaction.create({
        data: {
          taskId: newTask.id,
          type: "TRANSFER_IN",
          amount: amountToTransfer,
          escrowBefore: 0,
          escrowAfter: amountToTransfer,
          operatorId: userId,
          description: `从原任务 ${params.parentTaskId} 转入薪酬`,
        },
      });
    }

    // 多退少补
    if (params.budget < remainingEscrow) {
      const excess = Math.round((remainingEscrow - params.budget) * 100) / 100;
      // 超额退款给雇主
      await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: excess } },
      });
      await tx.transaction.create({
        data: {
          taskId: params.parentTaskId,
          type: "REFUND",
          amount: excess,
          payeeId: userId,
          operatorId: userId,
          description: `新任务薪酬低于剩余托管金，退还差额 ¥${excess}`,
        },
      });
    } else if (params.budget > remainingEscrow) {
      const shortage = Math.round((params.budget - remainingEscrow) * 100) / 100;
      // 雇主补足差额
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: shortage } },
      });
      await tx.transaction.create({
        data: {
          taskId: newTask.id,
          type: "DEPOSIT",
          amount: shortage,
          payerId: userId,
          operatorId: userId,
          description: `新任务薪酬超出转移金额，雇主补足 ¥${shortage}`,
        },
      });
    }

    // 标记父任务完成
    const escrowAfter = Math.round((parent.escrow - amountToTransfer) * 100) / 100;
    await tx.task.update({
      where: { id: params.parentTaskId },
      data: { status: "COMPLETED", escrow: Math.max(0, escrowAfter) },
    });
    await tx.taskStatusLog.create({
      data: {
        taskId: params.parentTaskId,
        fromStatus: parent.status,
        toStatus: "COMPLETED",
        event: "重新发布后关闭旧任务",
        operatorId: userId,
      },
    });

    // 创建新里程碑
    if (params.milestones.length > 0) {
      await tx.milestone.createMany({
        data: params.milestones.map((m, i) => ({
          taskId: newTask.id,
          order: i + 1,
          name: m.name,
          criteria: m.criteria,
          ratio: m.ratio,
          amount: Math.round((m.ratio / 100) * params.budget * 100) / 100,
          status: "PENDING",
        })),
      });
    }

    return newTask;
  });
}

export async function endTaskWithBalanceHandling(taskId: string, action: "refund" | "transfer") {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRawUnsafe<{ id: string; escrow: number; employerId: string; status: string; budget: number }[]>(
      `SELECT id, escrow, "employerId", status, budget FROM "Task" WHERE id = $1 FOR UPDATE`,
      taskId
    );
    if (rows.length === 0) throw new Error("任务不存在");
    const task = rows[0];
    if (task.employerId !== userId) throw new Error("只有雇主才能结束任务");
    if (task.status !== "IN_PROGRESS") throw new Error("只能结束进行中的任务");

    // 检查是否有待审批的里程碑
    const pendingApproval = await tx.milestoneApproval.findFirst({
      where: { milestone: { taskId }, status: "PENDING" },
    });
    if (pendingApproval) throw new Error("存在待审批的里程碑，请先处理审批后再结束任务");

    if (action === "refund" && task.escrow > 0) {
      await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: task.escrow } },
      });
      await tx.task.update({
        where: { id: taskId },
        data: { status: "COMPLETED", escrow: 0 },
      });
      await tx.taskStatusLog.create({
        data: {
          taskId,
          fromStatus: task.status,
          toStatus: "COMPLETED",
          event: "雇主结束任务并退款",
          operatorId: userId,
        },
      });
      await tx.transaction.create({
        data: {
          taskId,
          type: "REFUND",
          amount: task.escrow,
          payeeId: userId,
          operatorId: userId,
          escrowBefore: task.escrow,
          escrowAfter: 0,
          description: `任务结束，剩余托管金退还给雇主`,
        },
      });
    } else {
      // 转移模式：不在此处完成，返回剩余金额供重新发布使用
      await tx.task.update({
        where: { id: taskId },
        data: { status: "COMPLETED" },
      });
      await tx.taskStatusLog.create({
        data: {
          taskId,
          fromStatus: task.status,
          toStatus: "COMPLETED",
          event: "雇主结束任务（待转移）",
          operatorId: userId,
        },
      });
    }

    return { success: true, remainingEscrow: task.escrow, parentTaskId: taskId };
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

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
    },
  });

  return { name: updated.name, avatarUrl: updated.avatarUrl };
}

export async function getEmployerCompletedReviews(employerId: string) {
  return prisma.task.findMany({
    where: { employerId, status: "COMPLETED" },
    include: {
      employer: { select: { id: true, name: true } },
      applications: {
        where: { status: "ACCEPTED" },
        include: { freelancer: { select: { id: true, name: true } } },
      },
      reviews: {
        include: {
          reviewer: { select: { id: true, name: true } },
          reviewee: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function recordDeposit(taskId: string, method: string, amount: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.transaction.create({
    data: {
      taskId,
      type: "DEPOSIT",
      amount,
      payerId: session.user.id,
      escrowAfter: amount,
      operatorId: session.user.id,
      description: `雇主通过 ${method} 付款 ¥${amount}，托管至平台`,
    },
  });
}
