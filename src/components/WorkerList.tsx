"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "./ConfirmModal";

const workers = [
  {
    name: "李明",
    task: "UI 设计稿更新",
    status: "进行中",
    startedAt: "2026-05-19",
    deadline: "2026-06-05",
    unread: true,
    taskId: "1",
  },
  {
    name: "王小红",
    task: "文案翻译",
    status: "进行中",
    startedAt: "2026-05-15",
    deadline: "2026-05-30",
    unread: false,
    taskId: "2",
  },
  {
    name: "赵六",
    task: "活动摄影跟拍",
    status: "进行中",
    startedAt: "2026-05-20",
    deadline: "2026-05-24",
    unread: true,
    taskId: "3",
  },
];

const mockMessages: Record<string, { from: "other" | "me"; text: string; time: string }[]> = {
  "李明": [
    { from: "other", text: "设计稿初版已完成，请查收附件", time: "05/20 10:30" },
    { from: "me", text: "好的，我看了下，整体风格不错。颜色需要再调整亮一点", time: "05/20 11:15" },
    { from: "other", text: "明白，预计本周五可以完成最终版", time: "05/20 14:00" },
  ],
  "王小红": [
    { from: "other", text: "您好，翻译进度 60%，有几个术语需要确认", time: "05/18 09:00" },
    { from: "me", text: "好的，请发过来我看看", time: "05/18 09:30" },
  ],
  "赵六": [
    { from: "other", text: "周六拍摄完成的，明天开始修图", time: "05/21 20:00" },
  ],
};

export default function WorkerList({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [completeOpen, setCompleteOpen] = useState(false);
  const [endStep1, setEndStep1] = useState(false);
  const [endStep2, setEndStep2] = useState(false);
  const [chatOpen, setChatOpen] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");

  const handleChatSend = () => {
    if (chatInput.trim()) {
      setChatInput("");
      // mock: 不实际发送，清空输入框即可
    }
  };

  return (
    <div>
      <button onClick={onBack} className="text-sm text-[#86868b] mb-4 hover:text-[#1d1d1f] cursor-pointer">← 返回概览</button>
      <h2 className="text-lg font-semibold mb-4">进行中的任务</h2>
      <div className="flex flex-col gap-3">
        {workers.map((w) => (
          <div key={w.name} className="bg-white rounded-2xl border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* 主行 */}
            <div className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm">{w.name}</span>
                  <span className="text-xs text-[#86868b]">{w.task}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-[#007aff1a] text-[#007aff] px-2 py-0.5 rounded-full font-medium">{w.status}</span>
                  <span className="text-xs text-[#86868b]">通过: {w.startedAt}</span>
                  <span className="text-xs text-[#86868b]">截止: {w.deadline}</span>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(chatOpen === w.name ? null : w.name)}
                className="w-8 h-8 flex items-center justify-center relative cursor-pointer"
                type="button"
              >
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none" stroke={chatOpen === w.name ? "#007aff" : "#86868b"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6V9.5C3.5 9.9 3.3 10.2 3.1 10.4L2 11.7C1.4 12.5 1 13.5 1 14.6C1 16 2.2 16.5 3.5 16.5H12.5C13.8 16.5 15 16 15 14.6C15 13.5 14.6 12.5 14 11.7L12.9 10.4C12.7 10.2 12.5 9.9 12.5 9.5V6C12.5 3.5 10.5 1.5 8 1.5Z" />
                  <path d="M10 16.5C10 17.1 9.5 17.5 9 17.5H7C6.5 17.5 6 17.1 6 16.5" strokeWidth="1.2" />
                </svg>
                {w.unread && chatOpen !== w.name && (
                  <span className="absolute top-1 right-1 w-[7px] h-[7px] bg-[#ff3b30] rounded-full" />
                )}
              </button>
              <div className="flex gap-2">
                <button onClick={() => setCompleteOpen(true)} className="bg-[#30d158] text-white px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer">
                  完成任务
                </button>
                <button onClick={() => setEndStep1(true)} className="bg-[#ff3b30] text-white px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer">
                  结束任务
                </button>
              </div>
            </div>

            {/* 内联聊天窗口 */}
            {chatOpen === w.name && (
              <div className="border-t border-[rgba(0,0,0,0.05)] bg-[#f5f5f7]">
                {/* 聊天头部 - 任务信息 */}
                <div className="px-5 py-2.5 bg-white border-b border-[rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6]" />
                    <span className="text-xs font-semibold">{w.name}</span>
                    <span className="text-[10px] text-[#007aff]">关于 · {w.task}</span>
                    <span className="text-[10px] text-[#86868b] ml-auto">通过: {w.startedAt} · 截止: {w.deadline}</span>
                  </div>
                </div>
                {/* 消息列表 */}
                <div className="px-5 py-3 max-h-[240px] overflow-y-auto">
                  {(mockMessages[w.name] || []).map((m, i) => (
                    <div key={i} className={`flex gap-2 mb-2 items-start ${m.from === "me" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-5 h-5 rounded-md flex-shrink-0 text-[9px] flex items-center justify-center ${m.from === "other" ? "bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6]" : "bg-[#1d1d1f] text-white"}`}>
                        {m.from === "me" ? "张" : ""}
                      </div>
                      <div>
                        <div className={`rounded-xl px-3 py-1.5 max-w-[320px] ${m.from === "other" ? "bg-white rounded-bl-sm" : "bg-[#1d1d1f] text-white rounded-br-sm"}`}>
                          <p className="text-[11px] leading-relaxed">{m.text}</p>
                        </div>
                        <div className={`text-[9px] text-[#86868b] mt-0.5 ${m.from === "me" ? "text-right" : ""}`}>{m.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* 输入框 */}
                <div className="px-5 py-2.5 border-t border-[rgba(0,0,0,0.04)] flex gap-2 items-center bg-white">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                    placeholder="输入消息..."
                    className="flex-1 bg-[#f5f5f7] rounded-lg px-3 py-1.5 text-[11px] outline-none"
                  />
                  <button
                    onClick={handleChatSend}
                    className="bg-black text-white px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer"
                    type="button"
                  >
                    发送
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmModal open={completeOpen} title="确认操作？" description="确定完成该任务并付款？"
        confirmLabel="确定" onConfirm={() => setCompleteOpen(false)} onCancel={() => setCompleteOpen(false)} />
      <ConfirmModal open={endStep1} title="确认操作？" description="确定要结束该任务？"
        confirmLabel="确定" onConfirm={() => { setEndStep1(false); setEndStep2(true); }} onCancel={() => setEndStep1(false)} />
      <ConfirmModal open={endStep2} title="是否重新发布此任务？" description="可将当前任务信息自动填入发布页面，方便快速重新发布。"
        confirmLabel="重新发布" confirmColor="blue" secondStep
        onConfirm={() => { setEndStep2(false); router.push("/tasks/new"); }}
        onCancel={() => setEndStep2(false)} />
    </div>
  );
}
