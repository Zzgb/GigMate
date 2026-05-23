/**
 * ChatWindow.tsx
 * 聊天窗口组件 - 消息显示区域 + 输入框 + 发送按钮 + 自动滚动到底部 + 发送锁防止重复
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
 from: "other" | "me";
 text: string;
 time: string;
}

interface ChatWindowProps {
  name: string;
  task: string;
  taskId?: string;
  avatarUrl?: string | null;
  myAvatarUrl?: string | null;
  messages: Message[];
  onSend?: (text: string) => Promise<void>;
}

export default function ChatWindow({ name, task, taskId, avatarUrl, myAvatarUrl, messages, onSend }: ChatWindowProps) {
 const [input, setInput] = useState("");
 const bottomRef = useRef<HTMLDivElement>(null);
 const sending = useRef(false);

 useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages]);

 const handleSend = async () => {
  if (!input.trim() || sending.current) return;
  sending.current = true;
  try {
   if (onSend) {
    await onSend(input);
   }
   setInput("");
  } finally {
   sending.current = false;
  }
 };

 return (
  <div className="flex-1 flex flex-col bg-[var(--g-card)] min-w-0">
   <div className="px-6 py-3 border-b border-[var(--g-border2)]">
    <div className="flex items-center gap-3">
     {avatarUrl ? <img src={avatarUrl} className="w-8 h-8 rounded-xl object-cover" alt="" /> : <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6]" />}
     <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold">{name}</div>
      {taskId ? (
       <a href={`/tasks/${taskId}?from=messages`} className="text-[10px] text-[#007aff] truncate hover:underline">关于 · {task}</a>
      ) : (
       <div className="text-[10px] text-[#007aff] truncate">关于 · {task}</div>
      )}
     </div>
    </div>
   </div>
   <div className="flex-1 px-6 py-4 overflow-y-auto">
    {messages.map((m, i) => (
     <div key={i} className={`flex gap-3 mb-3 items-start ${m.from === "me" ? "flex-row-reverse" : ""}`}>
      {m.from === "other" ? (
        avatarUrl ? <img src={avatarUrl} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" alt="" />
        : <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />
      ) : (
        myAvatarUrl ? <img src={myAvatarUrl} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" alt="" />
        : <div className="w-7 h-7 rounded-lg bg-[#1d1d1f] flex-shrink-0" />
      )}
      <div>
       <div className={`rounded-2xl px-4 py-2.5 max-w-[400px] ${m.from === "other" ? "bg-[var(--g-input)] rounded-bl-md" : "bg-[#1d1d1f] rounded-br-md text-white"}`}>
        {m.text.startsWith("[文件] ") ? (() => {
          const lines = m.text.split("\n");
          const name = lines[0].replace("[文件] ", "");
          const url = lines[1] || "";
          const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
          return (
            <div>
              {isImage ? (
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <img src={url} alt={name} className="max-w-[200px] max-h-[150px] rounded-lg object-cover mb-1" />
                </a>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">📎</span>
                  <span className="text-[10px] truncate max-w-[160px]">{name}</span>
                </div>
              )}
              <a href={url} target="_blank" rel="noopener noreferrer"
                className={`text-[10px] underline ${m.from === "me" ? "text-white/70" : "text-[#007aff]"}`}>
                {isImage ? "查看原图" : "下载文件"}
              </a>
            </div>
          );
        })() : (
          <p className="text-xs leading-relaxed">{m.text}</p>
        )}
       </div>
       <div className={`text-[10px] text-[var(--g-text2)] mt-1 ${m.from === "me" ? "text-right" : ""}`}>{m.time}</div>
      </div>
     </div>
    ))}
    {messages.length === 0 && (
     <div className="flex items-center justify-center h-full text-xs text-[var(--g-text2)] dark:text-[#98989d]">
      还没有消息，发送第一条消息开始对话
     </div>
    )}
    <div ref={bottomRef} />
   </div>
   <div className="px-6 py-3 border-t border-[var(--g-border2)] flex gap-2 items-center">
    <label className="w-8 h-8 flex items-center justify-center cursor-pointer text-[var(--g-text2)] hover:text-[#007aff] rounded-lg hover:bg-[var(--g-hover)]">
     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
     <input type="file" className="hidden" onChange={async (e) => {
       const f = e.target.files?.[0]; if (!f || !onSend) return;
       const fd = new FormData(); fd.append("file", f);
       const res = await fetch("/api/upload", { method: "POST", body: fd });
       const d = await res.json();
       if (d.url) onSend(`[文件] ${f.name}\n${d.url}`);
     }} />
    </label>
    <input
     type="text"
     value={input}
     onChange={(e) => setInput(e.target.value)}
     onKeyDown={(e) => e.key === "Enter" && handleSend()}
     placeholder="输入消息..."
     className="flex-1 bg-[var(--g-input)] rounded-xl px-4 py-2 text-xs outline-none"
    />
    <button
     onClick={handleSend}
     className="bg-black text-white px-5 py-2 rounded-xl text-xs font-medium cursor-pointer"
     type="button"
    >
     发送
    </button>
   </div>
  </div>
 );
}
