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
 messages: Message[];
 onSend?: (text: string) => Promise<void>;
}

export default function ChatWindow({ name, task, taskId, messages, onSend }: ChatWindowProps) {
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
     <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6]" />
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
      <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-[10px] ${m.from === "other" ? "bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6]" : "bg-[#1d1d1f]"}`}>
       {m.from === "me" ? "" : ""}
      </div>
      <div>
       <div className={`rounded-2xl px-4 py-2.5 max-w-[400px] ${m.from === "other" ? "bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-bl-md" : "bg-[#1d1d1f] rounded-br-md text-white"}`}>
        <p className="text-xs leading-relaxed">{m.text}</p>
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
   <div className="px-6 py-3 border-t border-[var(--g-border2)] flex gap-3 items-center">
    <input
     type="text"
     value={input}
     onChange={(e) => setInput(e.target.value)}
     onKeyDown={(e) => e.key === "Enter" && handleSend()}
     placeholder="输入消息..."
     className="flex-1 bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-xl px-4 py-2 text-xs outline-none"
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
