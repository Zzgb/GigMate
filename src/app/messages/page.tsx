/**
 * page.tsx
 * 消息页 - 对话列表 + 聊天窗口 + 3 秒轮询 + 里程碑审批 + ?with= 自动定位
 * 修改日期: 2026-05-25
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Nav from "@/components/Nav";
import ConversationList from "@/components/ConversationList";
import ChatWindow from "@/components/ChatWindow";
import { getConversations, getMessages, sendMessage, markAsRead, createConversationByName } from "@/actions/message-actions";
import { getMilestonesByTask, submitMilestoneForApproval, approveMilestone, rejectMilestone } from "@/actions/milestone-actions";
import FileDropZone, { type UploadedFile } from "@/components/FileDropZone";

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
  taskId: string | null;
  time: string;
  preview: string;
  unread: number;
  active: boolean;
  otherUserId: string;
  otherAvatarUrl: string | null;
}

interface ChatMessage {
  from: "other" | "me";
  text: string;
  time: string;
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const { isLoggedIn, mounted, userId, avatarUrl: myAvatarUrl, role: myRole } = useAuth();
  const [conversations, setConversations] = useState<ConvoItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Record<string, ChatMessage[]>>({});

  // Milestone state
  const [milestones, setMilestones] = useState<any[]>([]);
  const [approvalMap, setApprovalMap] = useState<Record<string, any>>({});
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState("");
  const [approvalDesc, setApprovalDesc] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [submittingMilestone, setSubmittingMilestone] = useState(false);

  const isEmployer = myRole === "employer";
  const isFreelancer = myRole === "freelancer";

  // Initial load of conversations
  useEffect(() => {
    if (!mounted || !isLoggedIn) return;
    getConversations().then((data) => {
      const targetName = searchParams.get("with");
      const targetTaskId = searchParams.get("taskId");
      const items: ConvoItem[] = data.map((c: any) => {
        const other = c.user1Id === userId ? c.user2 : c.user1;
        const lastMsg = c.messages?.[0];
        return {
          id: c.id,
          otherName: other?.name || "未知",
          otherUserId: other?.id || "",
          otherAvatarUrl: other?.avatarUrl || null,
          task: c.task?.title || "无关联任务",
          taskId: c.task?.id || null,
          time: lastMsg ? formatTime(lastMsg.createdAt) : "",
          preview: lastMsg?.content?.slice(0, 30) || "",
          unread: c.unread || 0,
          active: false,
        };
      });

      let targetIdx = -1;
      if (targetName) {
        if (targetTaskId) {
          // 有 taskId：优先精确匹配，不 fallback 到无关对话
          targetIdx = items.findIndex((c) => c.otherName === targetName && c.taskId === targetTaskId);
        } else {
          // 无 taskId：先找无任务关联的，再找任意
          targetIdx = items.findIndex((c) => c.otherName === targetName && !c.taskId);
          if (targetIdx < 0) {
            targetIdx = items.findIndex((c) => c.otherName === targetName);
          }
        }
      }

      if (targetName && targetIdx < 0) {
        createConversationByName(targetName, targetTaskId || undefined).then(() => {
          getConversations().then((newData) => {
            const newItems = newData.map((c: any) => ({
              id: c.id,
              otherName: (c.user1Id === userId ? c.user2 : c.user1)?.name || "未知",
              otherUserId: (c.user1Id === userId ? c.user2 : c.user1)?.id || "",
              otherAvatarUrl: (c.user1Id === userId ? c.user2 : c.user1)?.avatarUrl || null,
              task: c.task?.title || "无关联任务",
              taskId: c.task?.id || null,
              time: c.messages?.[0] ? formatTime(c.messages[0].createdAt) : "",
              preview: c.messages?.[0]?.content?.slice(0, 30) || "",
              unread: c.unread || 0,
              active: false,
            }));
            const idx = newItems.findIndex((c: any) => c.otherName === targetName);
            setConversations(newItems.map((c: any, i: number) => ({ ...c, active: i === (idx >= 0 ? idx : 0) })));
            const act = newItems[idx >= 0 ? idx : 0];
            if (act) { setActiveId(act.id); loadMessages(act.id); }
          });
        });
      } else {
        const hasTarget = targetIdx >= 0;
        setConversations(items.map((c, i) => ({ ...c, active: hasTarget && i === targetIdx })));
        if (hasTarget) {
          const active = items[targetIdx];
          if (active) { setActiveId(active.id); loadMessages(active.id); }
        }
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isLoggedIn]);

  const loadMessages = useCallback(async (convoId: string) => {
    markAsRead(convoId);
    if (cacheRef.current[convoId]) {
      setMessages(cacheRef.current[convoId]);
    }
    const data = await getMessages(convoId);
    const msgs: ChatMessage[] = data.map((m: any) => ({
      from: (m.senderId === userId ? "me" : "other") as "me" | "other",
      text: m.content,
      time: formatChatTime(m.createdAt),
    }));
    cacheRef.current[convoId] = msgs;
    setMessages(msgs);
  }, [userId]);

  const loadMilestoneData = useCallback(async (taskId: string) => {
    try {
      const ms = await getMilestonesByTask(taskId);
      setMilestones(ms);
      const map: Record<string, any> = {};
      for (const m of ms) {
        for (const a of m.approvals || []) {
          map[a.id] = a;
        }
      }
      setApprovalMap(map);
    } catch {}
  }, []);

  const handleSelect = useCallback((idx: number) => {
    const convo = conversations[idx];
    if (!convo) return;
    setConversations((prev) => prev.map((c, i) => ({ ...c, active: i === idx })));
    setActiveId(convo.id);
    loadMessages(convo.id);
    if (convo.taskId) loadMilestoneData(convo.taskId);
    setShowMilestoneForm(false);
  }, [conversations, loadMessages, loadMilestoneData]);

  const handleSend = useCallback(async (text: string) => {
    if (!activeId || !text.trim()) return;
    const msg = await sendMessage(activeId, text.trim());
    setMessages((prev) => {
      const updated = [...prev, { from: "me" as const, text: msg.content, time: formatChatTime(msg.createdAt) }];
      cacheRef.current[activeId!] = updated;
      return updated;
    });
    getConversations().then((data) => {
      setConversations((prev) => prev.map((c) => {
        const updated = data.find((d: any) => d.id === c.id);
        if (!updated) return c;
        const lastMsg = updated.messages?.[0];
        return {
          ...c,
          time: lastMsg ? formatTime(lastMsg.createdAt) : c.time,
          preview: lastMsg?.content?.slice(0, 30) || "",
          unread: (updated as any).unread || 0,
        };
      }));
    });
  }, [activeId]);

  const handleApproveMilestone = async (approvalId: string) => {
    await approveMilestone(approvalId);
    const ac = conversations.find((c) => c.active);
    if (ac?.taskId) loadMilestoneData(ac.taskId);
  };

  const handleRejectMilestone = async (approvalId: string, reason: string) => {
    await rejectMilestone(approvalId, reason);
    const ac = conversations.find((c) => c.active);
    if (ac?.taskId) loadMilestoneData(ac.taskId);
  };

  const handleSubmitMilestone = async () => {
    if (!selectedMilestoneId || !approvalDesc.trim() || submittingMilestone) return;
    setSubmittingMilestone(true);
    try {
      await submitMilestoneForApproval(selectedMilestoneId, approvalDesc.trim(), uploadedFiles, activeId || undefined);
      setShowMilestoneForm(false);
      setApprovalDesc("");
      setUploadedFiles([]);
      setSelectedMilestoneId("");
      const ac = conversations.find((c) => c.active);
      if (ac?.taskId) loadMilestoneData(ac.taskId);
    } catch (err: any) {
      alert(err.message || "提交失败");
    } finally {
      setSubmittingMilestone(false);
    }
  };

  const submittableMilestones = milestones.filter(
    (m: any) => m.status === "PENDING" || m.status === "REJECTED"
  );

  // Poll for new messages and milestone data every 3s
  useEffect(() => {
    if (!activeId) return;
    const ac = conversations.find((c) => c.active);
    if (ac?.taskId) loadMilestoneData(ac.taskId);
    pollRef.current = setInterval(() => {
      loadMessages(activeId);
      const a = conversations.find((c) => c.active);
      if (a?.taskId) loadMilestoneData(a.taskId);
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, loadMessages]);

  // Poll conversation list to update unread/preview/time every 5s
  useEffect(() => {
    const id = setInterval(() => {
      getConversations().then((data) => {
        setConversations((prev) => prev.map((c) => {
          const updated = data.find((d: any) => d.id === c.id);
          if (!updated) return c;
          const lastMsg = updated.messages?.[0];
          return {
            ...c,
            time: lastMsg ? formatTime(lastMsg.createdAt) : c.time,
            preview: lastMsg?.content?.slice(0, 30) || "",
            unread: (updated as any).unread || 0,
          };
        }));
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  if (!mounted || !isLoggedIn) return null;

  const activeConvo = conversations.find((c) => c.active);

  return (
    <div className="flex flex-col h-screen">
      <Nav variant="dashboard" />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ConversationList
          conversations={conversations.map((c) => ({
            name: c.otherName,
            task: c.task,
            time: c.time,
            preview: c.preview,
            unread: c.unread,
            taskColor: c.task !== "无关联任务" ? "text-[#007aff]" : "text-[var(--g-text2)]",
            active: c.active,
            avatarUrl: c.otherAvatarUrl,
          }))}
          onSelect={handleSelect}
        />
        {activeConvo ? (
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <ChatWindow
              name={activeConvo.otherName}
              task={activeConvo.task}
              taskId={activeConvo.taskId || undefined}
              avatarUrl={activeConvo.otherAvatarUrl || undefined}
              myAvatarUrl={myAvatarUrl}
              messages={messages}
              onSend={handleSend}
              approvalMap={approvalMap}
              isEmployer={isEmployer}
              isFreelancer={isFreelancer}
              taskStatus="IN_PROGRESS"
              hasSubmittableMilestones={submittableMilestones.length > 0}
              onApproveMilestone={handleApproveMilestone}
              onRejectMilestone={handleRejectMilestone}
              onOpenMilestoneForm={() => setShowMilestoneForm(!showMilestoneForm)}
            />
            {/* Milestone submission form */}
            {showMilestoneForm && (
              <div className="border-t border-[var(--g-border)] bg-[var(--g-card)] px-6 py-4">
                <div className="text-sm font-semibold mb-3">提交里程碑验收</div>
                <select
                  value={selectedMilestoneId}
                  onChange={(e) => setSelectedMilestoneId(e.target.value)}
                  className="w-full bg-[var(--g-input)] rounded-xl px-4 py-2.5 text-sm outline-none mb-3"
                >
                  <option value="">选择验收节点</option>
                  {submittableMilestones.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.ratio}% · ¥{m.amount?.toFixed(0)})
                    </option>
                  ))}
                </select>
                <textarea
                  value={approvalDesc}
                  onChange={(e) => setApprovalDesc(e.target.value)}
                  placeholder="描述完成情况..."
                  rows={3}
                  className="w-full bg-[var(--g-input)] rounded-xl px-4 py-2.5 text-sm outline-none resize-none mb-3"
                />
                <FileDropZone onFilesChange={setUploadedFiles} maxFiles={3} />
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => {
                      setShowMilestoneForm(false);
                      setUploadedFiles([]);
                      setApprovalDesc("");
                    }}
                    className="text-sm text-[var(--g-text2)] hover:text-[var(--g-text)] cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmitMilestone}
                    disabled={submittingMilestone || !selectedMilestoneId || !approvalDesc.trim()}
                    className="bg-black text-white px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-50 cursor-pointer"
                  >
                    {submittingMilestone ? "提交中..." : "提交验收"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-[var(--g-text2)] dark:text-[#98989d]">
            {loading ? "加载中..." : conversations.length > 0 ? "请选择对话开始聊天" : "暂无消息"}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-screen">
        <Nav variant="dashboard" />
        <div className="flex-1 flex items-center justify-center text-sm text-[var(--g-text2)] dark:text-[#98989d]">加载中...</div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
