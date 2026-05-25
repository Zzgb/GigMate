/**
 * InlineChat.tsx
 * 内联聊天 - 消息 + 里程碑审批卡片融入消息流 + 验收提交
 * 修改日期: 2026-05-25
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { getMessages, sendMessage, findOrCreateConversation, markAsRead } from "@/actions/message-actions";
import { getPendingApproval, getMilestonesByTask, submitMilestoneForApproval, approveMilestone, rejectMilestone } from "@/actions/milestone-actions";
import { useAuth } from "@/lib/auth-context";
import MilestoneApprovalCard from "@/components/MilestoneApprovalCard";
import FileDropZone, { type UploadedFile } from "@/components/FileDropZone";
import { ClipboardCheck } from "lucide-react";

interface InlineChatProps {
  otherUserId: string; otherUserName: string; taskTitle: string;
  taskId?: string; open: boolean; onClose: () => void; from?: string;
  otherAvatarUrl?: string | null; myAvatarUrl?: string | null;
  isFreelancer?: boolean; isEmployer?: boolean; taskStatus?: string;
}

export default function InlineChat({
  otherUserId, otherUserName, taskTitle, taskId, open, onClose,
  from = "messages", otherAvatarUrl, myAvatarUrl,
  isFreelancer, isEmployer, taskStatus,
}: InlineChatProps) {
  const { userId } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ from: "other" | "me"; text: string; time: string }[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const sending = useRef(false);
  const initRef = useRef(false);
  const prevLenRef = useRef(0);

  // 里程碑
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState("");
  const [approvalDesc, setApprovalDesc] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [submittingMilestone, setSubmittingMilestone] = useState(false);
  const [approvalMap, setApprovalMap] = useState<Record<string, any>>({});
  const [showFullChat, setShowFullChat] = useState(false);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    });
  };

  const loadApprovalMap = async (tId: string) => {
    try {
      const ms = await getMilestonesByTask(tId);
      const map: Record<string, any> = {};
      for (const m of ms) {
        for (const a of m.approvals || []) {
          map[a.id] = a;
        }
      }
      setApprovalMap(map);
      setMilestones(ms);
      // 数据加载后等 DOM 渲染完成再滚底
      scrollToBottom();
    } catch {}
  };

  useEffect(() => {
    if (!open || !otherUserId || initRef.current) return;
    initRef.current = true;
    findOrCreateConversation(otherUserId, taskId).then((c) => {
      setConversationId(c.id);
      loadMessages(c.id);
    }).catch(() => {});
    if (taskId) loadApprovalMap(taskId);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [open, otherUserId, taskId]);

  useEffect(() => {
    if (!open) { initRef.current = false; prevLenRef.current = 0; setShowMilestoneForm(false); }
  }, [open]);

  const loadMessages = async (convoId: string) => {
    markAsRead(convoId);
    const data = await getMessages(convoId);
    setMessages(data.map((m: any) => ({
      from: m.senderId === userId ? "me" : "other",
      text: m.content,
      time: `${new Date(m.createdAt).getHours().toString().padStart(2, "0")}:${new Date(m.createdAt).getMinutes().toString().padStart(2, "0")}`,
    })));
  };

  useEffect(() => {
    if (!conversationId) return;
    pollRef.current = setInterval(() => {
      loadMessages(conversationId);
      if (taskId) loadApprovalMap(taskId);
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [conversationId]);

  useEffect(() => {
    if (messages.length > 0 && messages.length !== prevLenRef.current) {
      scrollToBottom();
    }
    prevLenRef.current = messages.length;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversationId || sending.current) return;
    sending.current = true;
    try {
      const msg = await sendMessage(conversationId, input.trim());
      setMessages((prev) => [...prev, {
        from: "me", text: msg.content,
        time: `${new Date(msg.createdAt).getHours().toString().padStart(2, "0")}:${new Date(msg.createdAt).getMinutes().toString().padStart(2, "0")}`,
      }]);
      setInput("");
    } finally { sending.current = false; }
  };

  const handleSubmitMilestone = async () => {
    if (!selectedMilestoneId || !approvalDesc.trim() || submittingMilestone) return;
    setSubmittingMilestone(true);
    try {
      await submitMilestoneForApproval(selectedMilestoneId, approvalDesc.trim(), uploadedFiles, conversationId || undefined);
      setShowMilestoneForm(false);
      setApprovalDesc(""); setUploadedFiles([]); setSelectedMilestoneId("");
      if (taskId) loadApprovalMap(taskId);
    } catch (err: any) { alert(err.message || "提交失败"); }
    finally { setSubmittingMilestone(false); }
  };

  const handleApprove = async (approvalId: string) => {
    await approveMilestone(approvalId);
    if (taskId) loadApprovalMap(taskId);
  };
  const handleReject = async (approvalId: string, reason: string) => {
    await rejectMilestone(approvalId, reason);
    if (taskId) loadApprovalMap(taskId);
  };

  const submittableMilestones = milestones.filter((m: any) => m.status === "PENDING" || m.status === "REJECTED");
  if (!open) return null;

  return (
    <div className="border-t border-[var(--g-border2)] bg-[var(--g-input)]">
      <div className="px-5 py-2.5 bg-[var(--g-card)] border-b border-[var(--g-border)]">
        <div className="flex items-center gap-2">
          {otherAvatarUrl ? <img src={otherAvatarUrl} className="w-6 h-6 rounded-md object-cover flex-shrink-0" alt="" />
            : <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />}
          <span className="text-xs font-semibold">{otherUserName}</span>
          {taskId
            ? <a href={`/tasks/${taskId}?from=${from}`} className="text-[10px] text-[#007aff] hover:underline">关于 · {taskTitle}</a>
            : <span className="text-[10px] text-[#007aff]">关于 · {taskTitle}</span>}
          <button onClick={() => setShowFullChat(!showFullChat)}
            className="text-[10px] text-[var(--g-text2)] hover:text-[var(--g-text)] cursor-pointer ml-1">
            {showFullChat ? "收起" : "展开"}</button>
          <button onClick={onClose} className="ml-auto text-xs text-[var(--g-text2)] hover:text-[var(--g-text)] cursor-pointer">✕</button>
        </div>
      </div>

      <div className={`px-5 py-3 overflow-y-auto ${showFullChat ? "max-h-[400px]" : "max-h-[240px]"}`}>
        {messages.length === 0 ? (
          <div className="text-[11px] text-[var(--g-text2)] text-center py-4">暂无消息</div>
        ) : (
          messages.map((m, i) => {
            const approvalMatch = m.text.match(/^\[里程碑审批:(.+?)\]/);
            if (approvalMatch) {
              const approval = approvalMap[approvalMatch[1]];
              if (approval) {
                return (
                  <div key={i} className="my-2">
                    <MilestoneApprovalCard approval={approval} isEmployer={!!isEmployer}
                      onApprove={handleApprove} onReject={handleReject} />
                  </div>
                );
              }
              return (
                <div key={i} className="my-2 bg-[var(--g-input)] rounded-2xl p-4 text-xs text-[var(--g-text2)]">
                  里程碑审批加载中...
                </div>
              );
            }

            return (
              <div key={i} className={`flex gap-2 mb-2 items-start ${m.from === "me" ? "flex-row-reverse" : ""}`}>
                {m.from === "other"
                  ? (otherAvatarUrl ? <img src={otherAvatarUrl} className="w-5 h-5 rounded-md object-cover flex-shrink-0" alt="" />
                    : <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />)
                  : (myAvatarUrl ? <img src={myAvatarUrl} className="w-5 h-5 rounded-md object-cover flex-shrink-0" alt="" />
                    : <div className="w-5 h-5 rounded-md bg-[#1d1d1f] flex-shrink-0" />)}
                <div>
                  <div className={`rounded-xl px-3 py-1.5 max-w-[320px] ${m.from === "other" ? "bg-[var(--g-card)] rounded-bl-sm" : "bg-[#1d1d1f] text-white rounded-br-sm"}`}>
                    {m.text.startsWith("[文件] ") ? (() => {
                      const lines = m.text.split("\n");
                      const fname = lines[0].replace("[文件] ", "");
                      const url = lines[1] || "";
                      const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fname);
                      return (<div>
                        {isImage ? (<a href={url} target="_blank" rel="noopener noreferrer"><img src={url} alt={fname} className="max-w-[160px] max-h-[120px] rounded-lg object-cover mb-1" /></a>)
                          : (<span className="text-[10px]">{fname}</span>)}
                        <a href={url} target="_blank" rel="noopener noreferrer"
                          className={`block text-[9px] underline mt-0.5 ${m.from === "me" ? "text-white/70" : "text-[#007aff]"}`}>
                          {isImage ? "查看原图" : "下载文件"}</a>
                      </div>);
                    })() : (<p className="text-[11px] leading-relaxed">{m.text}</p>)}
                  </div>
                  <div className={`text-[9px] text-[var(--g-text2)] mt-0.5 ${m.from === "me" ? "text-right" : ""}`}>{m.time}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* 里程碑提交表单 */}
      {showMilestoneForm && (
        <div className="px-5 py-3 border-t border-[var(--g-border)] bg-[var(--g-card)]">
          <div className="text-xs font-medium mb-2">提交里程碑验收</div>
          <select value={selectedMilestoneId} onChange={(e) => setSelectedMilestoneId(e.target.value)}
            className="w-full bg-[var(--g-input)] rounded-lg px-3 py-1.5 text-xs outline-none mb-2">
            <option value="">选择验收节点</option>
            {submittableMilestones.map((m: any) => (
              <option key={m.id} value={m.id}>{m.name} ({m.ratio}% · ¥{m.amount?.toFixed(0)})</option>
            ))}
          </select>
          <textarea value={approvalDesc} onChange={(e) => setApprovalDesc(e.target.value)}
            placeholder="描述完成情况..." rows={2}
            className="w-full bg-[var(--g-input)] rounded-lg px-3 py-1.5 text-xs outline-none resize-none mb-2" />
          <FileDropZone onFilesChange={setUploadedFiles} maxFiles={3} />
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={() => { setShowMilestoneForm(false); setUploadedFiles([]); setApprovalDesc(""); }}
              className="text-xs text-[var(--g-text2)] hover:text-[var(--g-text)] cursor-pointer">取消</button>
            <button onClick={handleSubmitMilestone}
              disabled={submittingMilestone || !selectedMilestoneId || !approvalDesc.trim()}
              className="bg-black text-white px-4 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 cursor-pointer">
              {submittingMilestone ? "提交中..." : "提交验收"}</button>
          </div>
        </div>
      )}

      {/* 底部输入栏 */}
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
        {isFreelancer && taskStatus === "IN_PROGRESS" && submittableMilestones.length > 0 && (
          <button onClick={() => setShowMilestoneForm(!showMilestoneForm)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium cursor-pointer ${showMilestoneForm ? "bg-[#007aff] text-white" : "bg-[#007aff1a] text-[#007aff] hover:bg-[#007aff22]"}`}>
            <ClipboardCheck className="w-3 h-3" />验收</button>
        )}
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="输入消息..." className="flex-1 bg-[var(--g-input)] dark:bg-[#3a3a3c] rounded-lg px-3 py-1.5 text-[11px] outline-none" />
        <button onClick={handleSend}
          className="bg-black text-white px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer" type="button">发送</button>
      </div>
    </div>
  );
}
