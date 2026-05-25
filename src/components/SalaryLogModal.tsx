/**
 * SalaryLogModal.tsx
 * 日志侧边栏 - 支持任务状态日志 + 薪酬交易日志
 * 修改日期: 2026-05-25
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight } from "lucide-react";
import { getTaskFullLog } from "@/actions/admin-actions";

interface SalaryLogModalProps {
  taskId: string;
  mode: "status" | "transaction";
  onClose: () => void;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  DEPOSIT: { label: "托管入账", color: "text-[#007aff] bg-[#007aff1a]" },
  PLATFORM_FEE: { label: "平台手续费", color: "text-[#86868b] bg-[#86868b1a]" },
  FREELANCER_PAYMENT: { label: "打款", color: "text-[#30d158] bg-[#30d1581a]" },
  REFUND: { label: "退款", color: "text-[#ff3b30] bg-[#ff3b301a]" },
  TRANSFER_OUT: { label: "转出", color: "text-[#ff9500] bg-[#ff95001a]" },
  TRANSFER_IN: { label: "转入", color: "text-[#ff9500] bg-[#ff95001a]" },
};

const statusLabelMap: Record<string, string> = {
  OPEN: "招募中",
  IN_PROGRESS: "进行中",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function SalaryLogModal({ taskId, mode, onClose }: SalaryLogModalProps) {
  const [statusLogs, setStatusLogs] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTaskFullLog(taskId).then((data) => {
      setStatusLogs(data.statusLogs);
      setTransactions(data.transactions);
      setLoading(false);
    });
  }, [taskId]);

  const title = mode === "status" ? "任务状态日志" : "薪酬交易日志";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/25 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[480px] max-w-[90vw] h-full bg-[var(--g-card)] shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[var(--g-card)] border-b border-[var(--g-border)] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-base font-semibold">{title}</h3>
            <div className="text-[10px] text-[var(--g-text2)] mt-0.5 font-mono">{taskId}</div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--g-hover)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {loading ? (
            <div className="text-sm text-[var(--g-text2)] text-center py-8">加载中...</div>
          ) : (
            <div className="flex flex-col gap-3">
              {mode === "status" ? (
                statusLogs.length === 0 ? (
                  <div className="text-sm text-[var(--g-text2)] text-center py-8">暂无状态变更记录</div>
                ) : (
                  statusLogs.map((log) => (
                    <div key={log.id} className="bg-[var(--g-input)] rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[var(--g-text)]">{log.event}</span>
                        <span className="text-[10px] text-[var(--g-text2)]">
                          {formatDateTime(log.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {log.fromStatus ? (
                          <>
                            <span className="px-1.5 py-0.5 rounded bg-[var(--g-card)] text-[var(--g-text2)]">
                              {statusLabelMap[log.fromStatus] || log.fromStatus}
                            </span>
                            <ArrowRight className="w-3 h-3 text-[var(--g-text2)]" />
                          </>
                        ) : (
                          <span className="text-[var(--g-text2)]">—</span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-[#007aff1a] text-[#007aff] font-medium">
                          {statusLabelMap[log.toStatus] || log.toStatus}
                        </span>
                      </div>
                      {log.operator && (
                        <div className="text-[10px] text-[var(--g-text2)] mt-2">
                          操作人：{log.operator.name || log.operator.id?.slice(0, 8)}
                        </div>
                      )}
                    </div>
                  ))
                )
              ) : (
                transactions.length === 0 ? (
                  <div className="text-sm text-[var(--g-text2)] text-center py-8">暂无交易记录</div>
                ) : (
                  transactions.map((log) => {
                    const t = typeLabels[log.type] || { label: log.type, color: "text-[var(--g-text2)] bg-[var(--g-input)]" };
                    return (
                      <div key={log.id} className="bg-[var(--g-input)] rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.color}`}>
                            {t.label}
                          </span>
                          <span className="text-[10px] text-[var(--g-text2)]">
                            {formatDateTime(log.createdAt)}
                          </span>
                        </div>
                        <div className="text-lg font-bold mb-2">
                          &yen;{log.amount.toFixed(2)}
                        </div>
                        <div className="flex flex-col gap-1 text-[10px] text-[var(--g-text2)]">
                          {log.milestone && (
                            <div>
                              <span className="text-[var(--g-text)]">里程碑：</span>
                              {log.milestone.name}
                            </div>
                          )}
                          {(log.payer || log.payee) && (
                            <div className="flex items-center gap-1">
                              <span>{log.payer?.name || "平台"}</span>
                              <ArrowRight className="w-3 h-3" />
                              <span>{log.payee?.name || "平台"}</span>
                            </div>
                          )}
                          {log.escrowBefore !== null && log.escrowAfter !== null && (
                            <div>
                              托管金：&yen;{log.escrowBefore?.toFixed(2)} → &yen;{log.escrowAfter?.toFixed(2)}
                            </div>
                          )}
                          {log.operator && (
                            <div>
                              <span className="text-[var(--g-text)]">操作人：</span>
                              {log.operator.name || log.operator.id?.slice(0, 8)}
                            </div>
                          )}
                          {log.description && (
                            <div className="mt-1 text-[var(--g-text)] bg-[var(--g-card)] rounded-lg p-2">
                              {log.description}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
