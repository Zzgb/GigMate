/**
 * utils.ts
 * 工具函数 - classname 合并 cn()
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBudget(budget: number, budgetMin?: number | null): string {
  if (budgetMin && budgetMin > 0 && budgetMin < budget) return `¥${budgetMin}-${budget}`;
  return `¥${budget}`;
}
