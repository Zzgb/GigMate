"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Nav from "@/components/Nav";
import ConversationList from "@/components/ConversationList";
import ChatWindow from "@/components/ChatWindow";
import { getConversations, getMessages, sendMessage } from "@/actions/message-actions";

function formatTime(date: Date | string): string {
  const d = new Date(date);
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  if (hours < 48) return "昨天";
  return d.toLocaleDateString("zh-CN");
}

function formatChatTime(date: Date | string): string {
  const d = new Date(date);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

interface ConvoItem {
  id: string;
  otherName: string;
  task: string;
  time: string;
  preview: string;
  unread: number;
  active: boolean;
  otherUserId: string;
}

interface ChatMessage {
  from: "other" | "me";
  text: string;
  time: string;
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const { isLoggedIn, mounted, name: myName, userId } = useAuth();
  const [conversations, setConversations] = useState<ConvoItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Initial load of conversations
  useEffect(() => {
    if (!mounted || !isLoggedIn) return;
    getConversations().then((data) => {
      const targetName = searchParams.get("with");
      const items: ConvoItem[] = data.map((c: any) => {
        const other = c.user1Id === userId ? c.user2 : c.user1;
        const lastMsg = c.messages?.[0];
        return {
          id: c.id,
          otherName: other?.name || "未知",
          otherUserId: other?.id || "",
          task: c.task?.title || "无关联任务",
          time: lastMsg ? formatTime(lastMsg.createdAt) : "",
          preview: lastMsg?.content?.slice(0, 30) || "",
          unread: 0,
          active: false,
        };
      });

      // If ?with= param, find matching conversation or create one
      let targetIdx = -1;
      if (targetName) {
        targetIdx = items.findIndex((c) => c.otherName === targetName);
      }

      setConversations(items.map((c, i) => ({ ...c, active: i === (targetIdx >= 0 ? targetIdx : 0) })));
      const active = items[targetIdx >= 0 ? targetIdx : 0];
      if (active) {
        setActiveId(active.id);
        loadMessages(active.id);
      }
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isLoggedIn]);

  const loadMessages = useCallback(async (convoId: string) => {
    const data = await getMessages(convoId);
    setMessages(data.map((m: any) => ({
      from: m.senderId === userId ? "me" : "other",
      text: m.content,
      time: formatChatTime(m.createdAt),
    })));
  }, [myName]);

  const handleSelect = useCallback((idx: number) => {
    const convo = conversations[idx];
    if (!convo) return;
    setConversations((prev) => prev.map((c, i) => ({ ...c, active: i === idx })));
    setActiveId(convo.id);
    loadMessages(convo.id);
  }, [conversations, loadMessages]);

  const handleSend = useCallback(async (text: string) => {
    if (!activeId || !text.trim()) return;
    const msg = await sendMessage(activeId, text.trim());
    setMessages((prev) => [...prev, {
      from: "me",
      text: msg.content,
      time: formatChatTime(msg.createdAt),
    }]);
    // Refresh conversation list to update preview/time
    getConversations().then((data) => {
      setConversations((prev) => prev.map((c) => {
        const updated = data.find((d: any) => d.id === c.id);
        if (!updated) return c;
        const lastMsg = updated.messages?.[0];
        return {
          ...c,
          time: lastMsg ? formatTime(lastMsg.createdAt) : c.time,
          preview: lastMsg?.content?.slice(0, 30) || "",
        };
      }));
    });
  }, [activeId]);

  // Poll for new messages every 3s
  useEffect(() => {
    if (!activeId) return;
    pollRef.current = setInterval(() => {
      loadMessages(activeId);
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeId, loadMessages]);

  if (!mounted || !isLoggedIn) return null;

  const activeConvo = conversations.find((c) => c.active);

  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" />
      <div className="flex flex-1 min-h-0">
        <ConversationList
          conversations={conversations.map((c) => ({
            name: c.otherName,
            task: c.task,
            time: c.time,
            preview: c.preview,
            unread: c.unread,
            taskColor: c.task !== "无关联任务" ? "text-[#007aff]" : "text-[#86868b]",
            active: c.active,
          }))}
          onSelect={handleSelect}
        />
        {activeConvo ? (
          <ChatWindow
            name={activeConvo.otherName}
            task={activeConvo.task}
            messages={messages}
            onSend={handleSend}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-[#86868b]">
            {loading ? "加载中..." : "暂无消息"}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1">
        <Nav variant="dashboard" />
        <div className="flex-1 flex items-center justify-center text-sm text-[#86868b]">加载中...</div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
