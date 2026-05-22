const conversations = [
  { name: "李明", task: "UI 设计稿更新", time: "2分钟前", preview: "好的，我明天可以开始工作", unread: 2, active: true, taskColor: "text-[#007aff]" },
  { name: "王小红", task: "文案翻译 (中→英)", time: "1小时前", preview: "您好，我对这个项目很感兴趣", unread: 0, active: false, taskColor: "text-[#86868b]" },
  { name: "赵六", task: "活动摄影跟拍", time: "昨天", preview: "设计稿已更新，请查收", unread: 0, active: false, taskColor: "text-[#86868b]" },
];

export default function ConversationList() {
  return (
    <div className="w-[280px] min-w-[200px] bg-white border-r border-[rgba(0,0,0,0.06)] flex flex-col">
      <div className="px-5 py-4 border-b border-[rgba(0,0,0,0.05)]">
        <span className="text-base font-semibold">对话记录</span>
      </div>
      {conversations.map((c) => (
        <div key={c.name} className={`px-5 py-3 border-b border-[rgba(0,0,0,0.04)] cursor-pointer ${c.active ? "bg-[#f5f5f7]" : ""}`}>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6] flex-shrink-0" />
            <span className="text-sm font-semibold flex-1">{c.name}</span>
            <span className="text-[10px] text-[#86868b]">{c.time}</span>
          </div>
          <div className={`text-xs mb-0.5 ml-9 truncate ${c.taskColor}`}>{c.task}</div>
          <div className="flex items-center ml-9">
            <span className="text-xs text-[#86868b] truncate flex-1">{c.preview}</span>
            {c.unread > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#ff3b30] text-white text-[8px] flex items-center justify-center flex-shrink-0 ml-1.5">{c.unread}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
