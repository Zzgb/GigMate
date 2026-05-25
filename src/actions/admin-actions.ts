/**
 * admin-actions.ts
 * 管理员 Server Actions - 任务管理页数据（分页/搜索/排序）+ 完整日志（状态+交易）
 * 修改日期: 2026-05-25
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

function requireAdmin(session: any) {
  const roles: string[] = session?.user?.roles || [];
  if (!roles.includes("gigmateadmin")) throw new Error("无权访问");
}

export async function isAdmin() {
  const session = await auth();
  const roles: string[] = (session?.user as any)?.roles || [];
  return roles.includes("gigmateadmin");
}

export async function getAdminTasks(params: {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  requireAdmin(session);

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const search = params.search?.trim();
  const sortBy = params.sortBy || "updatedAt";
  const sortDir = params.sortDir || "desc";

  // 构建 where
  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { id: { startsWith: search } },
    ];
  }

  // 构建 orderBy
  let orderBy: any = { updatedAt: "desc" };
  if (sortBy === "budget") orderBy = { budget: sortDir };
  else if (sortBy === "status") orderBy = { status: sortDir };
  else if (sortBy === "createdAt") orderBy = { createdAt: sortDir };
  else if (sortBy === "updatedAt") orderBy = { updatedAt: sortDir };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        employer: { select: { id: true, name: true } },
        milestones: { orderBy: { order: "asc" } },
        transactions: { orderBy: { createdAt: "desc" } },
        statusLogs: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.task.count({ where }),
  ]);

  const items = tasks.map((task) => {
    const totalMilestones = task.milestones.length;
    const approvedMilestones = task.milestones.filter((m) => m.status === "APPROVED").length;
    const approvedRatio =
      totalMilestones > 0
        ? Math.round(task.milestones.reduce((sum, m) => sum + (m.status === "APPROVED" ? m.ratio : 0), 0) * 100) / 100
        : 0;
    const remaining = Math.round(task.escrow * 100) / 100;

    const salaryStatus = computeSalaryStatus(task, approvedRatio);
    const lastStatusEvent = task.statusLogs[0]?.event || "";

    return {
      id: task.id,
      title: task.title,
      employerName: task.employer.name || "未知",
      budget: task.budget,
      budgetMin: task.budgetMin,
      status: task.status,
      totalMilestones,
      approvedMilestones,
      approvedRatio,
      remaining,
      salaryStatus,
      lastStatusEvent,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  });

  return { tasks: items, total, pages: Math.ceil(total / pageSize), page };
}

function computeSalaryStatus(task: any, approvedRatio: number): string {
  if (task.status === "CANCELLED") return "已关闭";

  const hasTransferOut = task.transactions?.some((t: any) => t.type === "TRANSFER_OUT");
  const hasRefund = task.transactions?.some((t: any) => t.type === "REFUND");

  if (task.status === "COMPLETED") {
    if (hasTransferOut) return "已完成并转移";
    if (approvedRatio < 100 && hasRefund) return "已完成并退款";
    if (approvedRatio >= 100) return "已完成";
    return "已完成";
  }

  if (approvedRatio === 0) return "运行中未付款";
  if (approvedRatio < 100) return "部分付款";
  return "完全付款";
}

export async function getTaskFullLog(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  requireAdmin(session);

  const [statusLogs, transactions] = await Promise.all([
    prisma.taskStatusLog.findMany({
      where: { taskId },
      include: { operator: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany({
      where: { taskId },
      include: {
        milestone: { select: { id: true, name: true } },
        payer: { select: { id: true, name: true } },
        payee: { select: { id: true, name: true } },
        operator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { statusLogs, transactions };
}
