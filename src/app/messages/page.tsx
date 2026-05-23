"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import ConversationList from "@/components/ConversationList";
import ChatWindow from "@/components/ChatWindow";

const convoData = [
  {
    name: "李明",
    task: "UI 设计稿更新",
    time: "2分钟前",
    preview: "好的，我明天可以开始工作",
    unread: 2,
    taskColor: "text-[#007aff]",
    messages: [
      { from: "other" as const, text: "您好，我对这个 UI 设计项目很感兴趣。我有 3 年经验，附上作品集供参考。", time: "10:32" },
      { from: "me" as const, text: "你好！看了你的作品集，风格很符合我们的需求。方便聊聊具体的时间安排吗？", time: "10:45" },
      { from: "other" as const, text: "好的，我明天可以开始工作，预计 2 周内完成。", time: "10:48" },
    ],
  },
  {
    name: "王小红",
    task: "文案翻译 (中→英)",
    time: "1小时前",
    preview: "您好，我对这个项目很感兴趣",
    unread: 0,
    taskColor: "text-[#86868b]",
    messages: [
      { from: "other" as const, text: "您好，我对翻译项目很感兴趣，我有 5 年翻译经验。", time: "09:15" },
      { from: "me" as const, text: "好的，可以先看看你的翻译样本吗？", time: "09:20" },
    ],
  },
  {
    name: "赵六",
    task: "活动摄影跟拍",
    time: "昨天",
    preview: "周六拍摄完成，明天修图",
    unread: 0,
    taskColor: "text-[#86868b]",
    messages: [
      { from: "other" as const, text: "周六拍摄完成的，明天开始修图。", time: "昨天 20:00" },
    ],
  },
  {
    name: "科技公司A",
    task: "UI 设计稿更新",
    time: "刚刚",
    preview: "合作愉快！",
    unread: 0,
    taskColor: "text-[#007aff]",
    messages: [],
  },
];

function MessagesContent() {
  const searchParams = useSearchParams();
  const targetName = searchParams.get("with");
  const defaultIndex = targetName ? convoData.findIndex((c) => c.name === targetName) : 0;
  const [activeIdx, setActiveIdx] = useState(defaultIndex >= 0 ? defaultIndex : 0);

  const activeConvo = convoData[activeIdx];

  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" />
      <div className="flex flex-1 min-h-0">
        <ConversationList
          conversations={convoData.map((c, i) => ({ ...c, active: i === activeIdx }))}
          onSelect={setActiveIdx}
        />
        <ChatWindow
          name={activeConvo.name}
          task={activeConvo.task}
          messages={activeConvo.messages}
        />
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
