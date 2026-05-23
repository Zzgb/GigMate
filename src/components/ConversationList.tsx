"use client";

interface Conversation {
  name: string;
  task: string;
  time: string;
  preview: string;
  unread: number;
  active: boolean;
  taskColor: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  onSelect: (index: number) => void;
}

export default function ConversationList({ conversations, onSelect }: ConversationListProps) {
  return (
    <div className="w-[280px] min-w-[200px] bg-white border-r border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)] flex flex-col">
      <div className="px-5 py-4 border-b border-[rgba(0,0,0,0.05)] dark:border-[rgba(255,255,255,0.08)]">
        <span className="text-base font-semibold">对话记录</span>
      </div>
      {conversations.map((c, i) => (
        <button
          key={c.name + c.task}
          onClick={() => onSelect(i)}
          type="button"
          className={`px-5 py-3 border-b border-[rgba(0,0,0,0.04)] dark:border-[rgba(255,255,255,0.06)] text-left cursor-pointer w-full ${c.active ? "bg-[#f5f5f7]" : ""}`}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />
            <span className="text-sm font-semibold flex-1">{c.name}</span>
            <span className="text-[10px] text-[#86868b] dark:text-[#98989d] dark:text-[#98989d]">{c.time}</span>
          </div>
          <div className={`text-xs mb-0.5 ml-9 truncate ${c.taskColor}`}>{c.task}</div>
          <div className="flex items-center ml-9">
            <span className="text-xs text-[#86868b] dark:text-[#98989d] truncate flex-1">{c.preview}</span>
            {c.unread > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#ff3b30] text-white text-[8px] flex items-center justify-center flex-shrink-0 ml-1.5">{c.unread}</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
