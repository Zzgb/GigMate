"use client";

import { useState, useEffect, useRef } from "react";
import { getMessages, sendMessage, findOrCreateConversation } from "@/actions/message-actions";
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

  useEffect(() => {
    if (!open || !otherUserId) return;
    findOrCreateConversation(otherUserId, taskId).then((c) => {
      setConversationId(c.id);
      loadMessages(c.id);
    });
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, otherUserId, taskId]);

  const loadMessages = async (convoId: string) => {
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
    if (!input.trim() || !conversationId) return;
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
  };

  if (!open) return null;

  return (
    <div className="border-t border-[rgba(0,0,0,0.05)] bg-[#f5f5f7]">
      <div className="px-5 py-2.5 bg-white border-b border-[rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6]" />
          <span className="text-xs font-semibold">{otherUserName}</span>
          <span className="text-[10px] text-[#007aff]">关于 · {taskTitle}</span>
          <button onClick={onClose} className="ml-auto text-xs text-[#86868b] hover:text-[#1d1d1f] cursor-pointer">
            ✕
          </button>
        </div>
      </div>
      <div className="px-5 py-3 max-h-[240px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-[11px] text-[#86868b] text-center py-4">暂无消息</div>
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
                  className={`rounded-xl px-3 py-1.5 max-w-[320px] ${m.from === "other" ? "bg-white rounded-bl-sm" : "bg-[#1d1d1f] text-white rounded-br-sm"}`}
                >
                  <p className="text-[11px] leading-relaxed">{m.text}</p>
                </div>
                <div
                  className={`text-[9px] text-[#86868b] mt-0.5 ${m.from === "me" ? "text-right" : ""}`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div className="px-5 py-2.5 border-t border-[rgba(0,0,0,0.04)] flex gap-2 items-center bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="输入消息..."
          className="flex-1 bg-[#f5f5f7] rounded-lg px-3 py-1.5 text-[11px] outline-none"
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
