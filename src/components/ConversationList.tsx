/**
 * ConversationList.tsx
 * 对话列表组件 - 消息页左侧显示所有对话（名称/关联任务/时间/预览/未读）+ 独立竖向滚动
 * 修改日期: 2026-05-23
 * 修改人: Claude Code + DeepSeek V4 Pro
 */

"use client";

interface Conversation {
 name: string;
 task: string;
 time: string;
 preview: string;
 unread: number;
 active: boolean;
 taskColor: string;
 avatarUrl?: string | null;
}

interface ConversationListProps {
 conversations: Conversation[];
 onSelect: (index: number) => void;
}

export default function ConversationList({ conversations, onSelect }: ConversationListProps) {
 return (
  <div className="w-[280px] min-w-[200px] min-h-0 bg-[var(--g-card)] border-r border-[var(--g-border3)] flex flex-col">
   <div className="px-5 py-4 border-b border-[var(--g-border2)]">
    <span className="text-base font-semibold">对话记录</span>
   </div>
   <div className="flex-1 overflow-y-auto">
   {conversations.map((c, i) => (
    <button
     key={c.name + c.task}
     onClick={() => onSelect(i)}
     type="button"
     className={`px-5 py-3 border-b border-[var(--g-border)] text-left cursor-pointer w-full ${c.active ? "bg-[var(--g-input)]" : ""}`}
    >
     <div className="flex items-center gap-2 mb-0.5">
      {c.avatarUrl ? <img src={c.avatarUrl} className="w-7 h-7 rounded-lg object-cover flex-shrink-0" alt="" /> : <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />}
      <span className="text-sm font-semibold flex-1">{c.name}</span>
      <span className="text-[10px] text-[var(--g-text2)] dark:text-[#98989d]">{c.time}</span>
     </div>
     <div className={`text-xs mb-0.5 ml-9 truncate ${c.taskColor}`}>{c.task}</div>
     <div className="flex items-center ml-9">
      <span className="text-xs text-[var(--g-text2)] truncate flex-1">{c.preview}</span>
      {c.unread > 0 && (
       <span className="w-4 h-4 rounded-full bg-[#ff3b30] text-white text-[8px] flex items-center justify-center flex-shrink-0 ml-1.5">{c.unread}</span>
      )}
     </div>
    </button>
   ))}
   </div>
  </div>
 );
}
