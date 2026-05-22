"use client";

import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmColor?: "black" | "blue" | "red";
  secondStep?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open, title, description, confirmLabel = "确定",
  confirmColor = "black", secondStep, onConfirm, onCancel
}: ConfirmModalProps) {
  if (!open) return null;

  const confirmClass = confirmColor === "blue" ? "bg-[#007aff]" : confirmColor === "red" ? "bg-[#ff3b30]" : "bg-[#1d1d1f]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm">
      <div className="bg-white rounded-[20px] w-[360px] p-6 shadow-xl">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-[#86868b] mb-6 leading-relaxed">{description}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-[#ff3b30] bg-transparent rounded-xl hover:bg-[#f5f5f7] transition-colors">
            取消
          </button>
          <button onClick={onConfirm} className={`px-5 py-2 text-sm font-medium text-white rounded-xl ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
