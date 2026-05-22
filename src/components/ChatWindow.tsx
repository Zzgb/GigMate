const messages = [
  { from: "other", text: "您好，我对这个 UI 设计项目很感兴趣。我有 3 年经验，附上作品集供参考。", time: "10:32" },
  { from: "me", text: "你好！看了你的作品集，风格很符合我们的需求。方便聊聊具体的时间安排吗？", time: "10:45" },
  { from: "other", text: "好的，我明天可以开始工作，预计 2 周内完成。", time: "10:48" },
];

export default function ChatWindow() {
  return (
    <div className="flex-1 flex flex-col bg-white min-w-0">
      <div className="px-6 py-3 border-b border-[rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#e8e8ed] to-[#d1d1d6]" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">李明</div>
            <div className="text-[10px] text-[#007aff] truncate cursor-pointer">关于 · UI 设计稿更新 →</div>
          </div>
        </div>
      </div>
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        {messages.map((m, i) => (
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
      </div>
      <div className="px-6 py-3 border-t border-[rgba(0,0,0,0.05)] flex gap-3 items-center">
        <div className="flex-1 bg-[#f5f5f7] rounded-xl px-4 py-2 text-xs text-[#86868b]">输入消息...</div>
        <button className="bg-black text-white px-5 py-2 rounded-xl text-xs font-medium">发送</button>
      </div>
    </div>
  );
}
