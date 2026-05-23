/**
 * InlineChat.tsx
 * 内联聊天组件 - 控制台进行中任务铃铛展开的聊天窗口，实时收发消息 + 3 秒轮询 + 发送锁
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { getMessages, sendMessage, findOrCreateConversation, markAsRead } from "@/actions/message-actions";
import { useAuth } from "@/lib/auth-context";

interface InlineChatProps {
 otherUserId: string;
 otherUserName: string;
 taskTitle: string;
 taskId?: string;
 open: boolean;
 onClose: () => void;
}

export default function InlineChat({
 otherUserId,
 otherUserName,
 taskTitle,
 taskId,
 open,
 onClose,
}: InlineChatProps) {
 const { userId } = useAuth();
 const [conversationId, setConversationId] = useState<string | null>(null);
 const [messages, setMessages] = useState<
  { from: "other" | "me"; text: string; time: string }[]
 >([]);
 const [input, setInput] = useState("");
 const bottomRef = useRef<HTMLDivElement>(null);
 const pollRef = useRef<NodeJS.Timeout | null>(null);
 const sending = useRef(false);
 const initRef = useRef(false);

 useEffect(() => {
  if (!open || !otherUserId || initRef.current) return;
  initRef.current = true;
  findOrCreateConversation(otherUserId, taskId).then((c) => {
   setConversationId(c.id);
   loadMessages(c.id);
  }).catch(() => {});
  return () => {
   if (pollRef.current) clearInterval(pollRef.current);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [open, otherUserId, taskId]);

 useEffect(() => {
  if (!open) initRef.current = false;
 }, [open]);

 const loadMessages = async (convoId: string) => {
  markAsRead(convoId);
  const data = await getMessages(convoId);
  setMessages(
   data.map((m: any) => ({
    from: m.senderId === userId ? "me" : "other",
    text: m.content,
    time: `${new Date(m.createdAt).getHours().toString().padStart(2, "0")}:${new Date(m.createdAt).getMinutes().toString().padStart(2, "0")}`,
   }))
  );
 };

 // Poll
 useEffect(() => {
  if (!conversationId) return;
  pollRef.current = setInterval(() => {
   loadMessages(conversationId);
  }, 3000);
  return () => {
   if (pollRef.current) clearInterval(pollRef.current);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [conversationId]);

 useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages]);

 const handleSend = async () => {
  if (!input.trim() || !conversationId || sending.current) return;
  sending.current = true;
  try {
   const msg = await sendMessage(conversationId, input.trim());
   setMessages((prev) => [
    ...prev,
    {
     from: "me",
     text: msg.content,
     time: `${new Date(msg.createdAt).getHours().toString().padStart(2, "0")}:${new Date(msg.createdAt).getMinutes().toString().padStart(2, "0")}`,
    },
   ]);
   setInput("");
  } finally {
   sending.current = false;
  }
 };

 if (!open) return null;

 return (
  <div className="border-t border-[var(--g-border2)] bg-[var(--g-input)]">
   <div className="px-5 py-2.5 bg-[var(--g-card)] border-b border-[var(--g-border)]">
    <div className="flex items-center gap-2">
     <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6]" />
     <span className="text-xs font-semibold">{otherUserName}</span>
     {taskId ? (
      <a href={`/tasks/${taskId}?from=messages`} className="text-[10px] text-[#007aff] hover:underline">关于 · {taskTitle}</a>
     ) : (
      <span className="text-[10px] text-[#007aff]">关于 · {taskTitle}</span>
     )}
     <button onClick={onClose} className="ml-auto text-xs text-[var(--g-text2)] hover:text-[var(--g-text)] cursor-pointer">
      ✕
     </button>
    </div>
   </div>
   <div className="px-5 py-3 max-h-[240px] overflow-y-auto">
    {messages.length === 0 ? (
     <div className="text-[11px] text-[var(--g-text2)] text-center py-4">暂无消息</div>
    ) : (
     messages.map((m, i) => (
      <div
       key={i}
       className={`flex gap-2 mb-2 items-start ${m.from === "me" ? "flex-row-reverse" : ""}`}
      >
       <div
        className={`w-5 h-5 rounded-md flex-shrink-0 text-[9px] flex items-center justify-center ${m.from === "other" ? "bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6]" : "bg-[#1d1d1f] text-white"}`}
       />
       <div>
        <div
         className={`rounded-xl px-3 py-1.5 max-w-[320px] ${m.from === "other" ? "bg-[var(--g-card)] rounded-bl-sm" : "bg-[#1d1d1f] text-white rounded-br-sm"}`}
        >
         <p className="text-[11px] leading-relaxed">{m.text}</p>
        </div>
        <div
         className={`text-[9px] text-[var(--g-text2)] mt-0.5 ${m.from === "me" ? "text-right" : ""}`}
        >
         {m.time}
        </div>
       </div>
      </div>
     ))
    )}
    <div ref={bottomRef} />
   </div>
   <div className="px-5 py-2.5 border-t border-[var(--g-border)] flex gap-2 items-center bg-[var(--g-card)]">
    <label className="w-7 h-7 flex items-center justify-center cursor-pointer text-[var(--g-text2)] hover:text-[#007aff] rounded-lg">
     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
     <input type="file" className="hidden" onChange={async (e) => {
       const f = e.target.files?.[0]; if (!f) return;
       const fd = new FormData(); fd.append("file", f);
       const res = await fetch("/api/upload", { method: "POST", body: fd });
       const d = await res.json();
       if (d.url && conversationId) {
         const msg = await sendMessage(conversationId, `[文件] ${f.name}\n${d.url}`);
         setMessages((prev: any) => [...prev, { from: "me", text: msg.content, time: new Date(msg.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) }]);
       }
     }} />
    </label>
    <input
     type="text"
     value={input}
     onChange={(e) => setInput(e.target.value)}
     onKeyDown={(e) => e.key === "Enter" && handleSend()}
     placeholder="输入消息..."
     className="flex-1 bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-lg px-3 py-1.5 text-[11px] outline-none"
    />
    <button
     onClick={handleSend}
     className="bg-black text-white px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer"
     type="button"
    >
     发送
    </button>
   </div>
  </div>
 );
}
