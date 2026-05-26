/**
 * MilestoneApprovalCard.tsx
 * 审批卡片 - 聊天中显示里程碑审批，支持通过/驳回操作及附件下载
 * 修改日期: 2026-05-25
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState } from "react";
import { formatSize } from "@/lib/utils";
import { Check, X, Download, FileText, Clock, User } from "lucide-react";

interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

interface ApprovalData {
  id: string;
  status: string; // PENDING | APPROVED | REJECTED
  description?: string | null;
  createdAt: string;
  milestone: {
    id: string;
    name: string;
    criteria: string;
    ratio: number;
    amount: number;
  };
  submittedBy: {
    id: string;
    name: string | null;
    avatarUrl?: string | null;
  };
  reviewedBy?: { id: string; name: string | null } | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  attachments: Attachment[];
}

interface MilestoneApprovalCardProps {
  approval: ApprovalData;
  isEmployer: boolean;
  onApprove?: (approvalId: string) => Promise<void>;
  onReject?: (approvalId: string, reason: string) => Promise<void>;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MilestoneApprovalCard({
  approval,
  isEmployer,
  onApprove,
  onReject,
}: MilestoneApprovalCardProps) {
  const [processing, setProcessing] = useState(false);
  const [localStatus, setLocalStatus] = useState(approval.status);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const isPending = localStatus === "PENDING";

  const handleApprove = async () => {
    if (!onApprove) return;
    setProcessing(true);
    try {
      await onApprove(approval.id);
      setLocalStatus("APPROVED");
    } catch (err: any) {
      alert(err.message || "操作失败");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!onReject || !rejectReason.trim()) return;
    setProcessing(true);
    try {
      await onReject(approval.id, rejectReason.trim());
      setLocalStatus("REJECTED");
      setShowRejectInput(false);
    } catch (err: any) {
      alert(err.message || "操作失败");
    } finally {
      setProcessing(false);
    }
  };

  const statusBadge = {
    PENDING: { label: "待审批", color: "text-[#f59e0b] bg-[#f59e0b1a]" },
    APPROVED: { label: "已通过", color: "text-[#30d158] bg-[#30d1581a]" },
    REJECTED: { label: "已驳回", color: "text-[#ff3b30] bg-[#ff3b301a]" },
  }[localStatus] || { label: localStatus, color: "text-[var(--g-text2)] bg-[var(--g-input)]" };

  return (
    <div className="bg-[var(--g-card)] border border-[var(--g-border)] rounded-2xl p-4 my-2 mx-2 shadow-sm">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{approval.milestone.name}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusBadge.color}`}>
            {statusBadge.label}
          </span>
        </div>
        <span className="text-[10px] text-[var(--g-text2)] flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTime(approval.createdAt)}
        </span>
      </div>

      {/* 验收条件 */}
      <div className="text-xs text-[var(--g-text2)] mb-2">
        <span className="font-medium text-[var(--g-text)]">验收条件：</span>
        {approval.milestone.criteria}
      </div>

      {/* 比例和金额 */}
      <div className="text-xs text-[var(--g-text2)] mb-2">
        比例：{approval.milestone.ratio}% / 金额：&yen;{approval.milestone.amount.toFixed(0)}
      </div>

      {/* 提交人 */}
      <div className="flex items-center gap-1.5 mb-2 text-xs text-[var(--g-text2)]">
        <User className="w-3 h-3" />
        提交人：{approval.submittedBy.name || "未知用户"}
      </div>

      {/* 描述 */}
      {approval.description && (
        <div className="text-xs text-[var(--g-text)] bg-[var(--g-input)] rounded-lg p-2 mb-2 whitespace-pre-wrap">
          {approval.description}
        </div>
      )}

      {/* 附件 */}
      {approval.attachments.length > 0 && (
        <div className="flex flex-col gap-1 mb-3">
          {approval.attachments.map((att) => (
            <a
              key={att.id}
              href={`/api/download/milestone?file=${encodeURIComponent(att.filename)}`}
              className="flex items-center gap-1.5 text-xs text-[#007aff] hover:opacity-80"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="flex-1 min-w-0 truncate">{att.originalName}</span>
              <span className="text-[var(--g-text2)]">{formatSize(att.fileSize)}</span>
              <Download className="w-3.5 h-3.5" />
            </a>
          ))}
        </div>
      )}

      {/* 驳回原因 */}
      {localStatus === "REJECTED" && approval.rejectionReason && (
        <div className="text-xs text-[#ff3b30] bg-[#ff3b301a] rounded-lg p-2 mb-2">
          驳回原因：{approval.rejectionReason}
        </div>
      )}

      {/* 审批结果信息 */}
      {localStatus === "APPROVED" && approval.reviewedAt && (
        <div className="text-[10px] text-[#30d158] mt-1">
          审批通过 · {formatTime(approval.reviewedAt)}
        </div>
      )}
      {localStatus === "REJECTED" && approval.reviewedAt && (
        <div className="text-[10px] text-[#ff3b30] mt-1">
          审批驳回 · {formatTime(approval.reviewedAt)}
        </div>
      )}

      {/* 操作按钮（仅雇主可见） */}
      {isEmployer && (
        <div className="flex gap-2 mt-2">
          {isPending ? (
            !showRejectInput ? (
              <>
                <button onClick={handleApprove} disabled={processing}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-medium bg-[#30d158] text-white hover:opacity-80 disabled:opacity-50 cursor-pointer">
                  <Check className="w-3.5 h-3.5" />通过
                </button>
                <button onClick={() => setShowRejectInput(true)} disabled={processing}
                  className="flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-medium bg-[#ff3b30] text-white hover:opacity-80 disabled:opacity-50 cursor-pointer">
                  <X className="w-3.5 h-3.5" />驳回
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <input type="text" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="请输入驳回原因"
                  className="flex-1 bg-[var(--g-input)] rounded-lg px-3 py-1.5 text-xs outline-none" />
                <button onClick={handleReject} disabled={processing || !rejectReason.trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#ff3b30] text-white hover:opacity-80 disabled:opacity-50 cursor-pointer">确认</button>
                <button onClick={() => setShowRejectInput(false)}
                  className="text-xs text-[var(--g-text2)] hover:text-[var(--g-text)] cursor-pointer">取消</button>
              </div>
            )
          ) : (
            <div className="flex gap-2">
              <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-[var(--g-input)] text-[var(--g-text2)] cursor-not-allowed">已处理</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
