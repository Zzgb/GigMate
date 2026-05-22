import Nav from "@/components/Nav";
import ConversationList from "@/components/ConversationList";
import ChatWindow from "@/components/ChatWindow";

export default function MessagesPage() {
  return (
    <div className="flex flex-col flex-1">
      <Nav variant="dashboard" currentRole="employer" />
      <div className="flex flex-1 min-h-0">
        <ConversationList />
        <div className="w-[4px] bg-transparent cursor-col-resize flex-shrink-0" />
        <ChatWindow />
      </div>
    </div>
  );
}
