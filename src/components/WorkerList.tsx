"use client";

import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

const workers = [
  { name: "李明", task: "UI 设计稿更新", status: "进行中", unread: true },
  { name: "王小红", task: "文案翻译", status: "进行中", unread: false },
  { name: "赵六", task: "活动摄影跟拍", status: "进行中", unread: true },
];

export default function WorkerList({ onBack }: { onBack: () => void }) {
  const [completeOpen, setCompleteOpen] = useState(false);
  const [endStep1, setEndStep1] = useState(false);
  const [endStep2, setEndStep2] = useState(false);

  return (
    <div>
      <button onClick={onBack} className="text-sm text-[#86868b] mb-4 hover:text-[#1d1d1f]">← 返回概览</button>
      <h2 className="text-lg font-semibold mb-4">进行中的任务</h2>
      <div className="flex flex-col gap-3">
        {workers.map((w) => (
          <div key={w.name} className="bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm">{w.name}</span>
                  <span className="text-xs text-[#86868b]">{w.task}</span>
                </div>
                <span className="text-xs bg-[#007aff1a] text-[#007aff] px-2 py-0.5 rounded-full font-medium">{w.status}</span>
              </div>
              <button className="w-8 h-8 flex items-center justify-center relative">
                <svg width="14" height="18" viewBox="0 0 16 20" fill="none" stroke="#86868b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6V9.5C3.5 9.9 3.3 10.2 3.1 10.4L2 11.7C1.4 12.5 1 13.5 1 14.6C1 16 2.2 16.5 3.5 16.5H12.5C13.8 16.5 15 16 15 14.6C15 13.5 14.6 12.5 14 11.7L12.9 10.4C12.7 10.2 12.5 9.9 12.5 9.5V6C12.5 3.5 10.5 1.5 8 1.5Z" />
                  <path d="M10 16.5C10 17.1 9.5 17.5 9 17.5H7C6.5 17.5 6 17.1 6 16.5" strokeWidth="1.2" />
                </svg>
                {w.unread && <span className="absolute top-1 right-1 w-[6px] h-[6px] bg-[#ff3b30] rounded-full" />}
              </button>
              <div className="flex gap-2">
                <button onClick={() => setCompleteOpen(true)} className="bg-[#30d158] text-white px-3.5 py-1.5 rounded-full text-xs font-medium">
                  完成任务
                </button>
                <button onClick={() => setEndStep1(true)} className="bg-[#ff3b30] text-white px-3.5 py-1.5 rounded-full text-xs font-medium">
                  结束任务
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal open={completeOpen} title="确认操作？" description="确定完成该任务并付款？"
        confirmLabel="确定" onConfirm={() => setCompleteOpen(false)} onCancel={() => setCompleteOpen(false)} />
      <ConfirmModal open={endStep1} title="确认操作？" description="确定要结束该任务？"
        confirmLabel="确定" onConfirm={() => { setEndStep1(false); setEndStep2(true); }} onCancel={() => setEndStep1(false)} />
      <ConfirmModal open={endStep2} title="是否重新发布此任务？" description="可将当前任务信息自动填入发布页面，方便快速重新发布。"
        confirmLabel="重新发布" confirmColor="blue" secondStep
        onConfirm={() => { setEndStep2(false); /* TODO: navigate to /dashboard/tasks/new with prefill */ }}
        onCancel={() => setEndStep2(false)} />
    </div>
  );
}
