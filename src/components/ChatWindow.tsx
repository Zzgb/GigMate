"use client";

import { useState } from "react";

interface Message {
  from: "other" | "me";
  text: string;
  time: string;
}

interface ChatWindowProps {
  name: string;
  task: string;
  messages: Message[];
}

export default function ChatWindow({ name, task, messages }: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setLocalMessages((prev) => [...prev, { from: "me", text: input, time }]);
    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0">
      <div className="px-6 py-3 border-b border-[rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6]" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">{name}</div>
            <div className="text-[10px] text-[#007aff] truncate">关于 · {task}</div>
          </div>
        </div>
      </div>
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        {localMessages.map((m, i) => (
          <div key={i} className={`flex gap-3 mb-3 items-start ${m.from === "me" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-lg flex-shrink-0 ${m.from === "other" ? "bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6]" : "bg-[#1d1d1f] flex items-center justify-center text-white text-[10px]"}`}>
              {m.from === "me" ? "张" : ""}
            </div>
            <div>
              <div className={`rounded-2xl px-4 py-2.5 max-w-[400px] ${m.from === "other" ? "bg-[#f5f5f7] rounded-bl-md" : "bg-[#1d1d1f] rounded-br-md text-white"}`}>
                <p className="text-xs leading-relaxed">{m.text}</p>
              </div>
              <div className={`text-[10px] text-[#86868b] mt-1 ${m.from === "me" ? "text-right" : ""}`}>{m.time}</div>
            </div>
          </div>
        ))}
        {localMessages.length === 0 && (
          <div className="flex items-center justify-center h-full text-xs text-[#86868b]">
            还没有消息，发送第一条消息开始对话
          </div>
        )}
      </div>
      <div className="px-6 py-3 border-t border-[rgba(0,0,0,0.05)] flex gap-3 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="输入消息..."
          className="flex-1 bg-[#f5f5f7] rounded-xl px-4 py-2 text-xs outline-none"
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
