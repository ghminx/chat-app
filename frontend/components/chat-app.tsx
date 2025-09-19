"use client"

import { useState } from "react"
import { ChatProvider } from "@/contexts/chat-context"
import { Sidebar } from "@/components/sidebar"
import { ChatHeader } from "@/components/chat-header"
import { MessageList } from "@/components/message-list"
import { MessageInput } from "@/components/message-input"
import { TypingIndicator } from "@/components/typing-indicator"
import { useChat } from "@/contexts/chat-context"
import { RoomMembersPanel } from "@/components/RoomMembersPanel"

function ChatContent({ onToggleMembers }: { onToggleMembers: () => void }) {
  const { typingUsers } = useChat()

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader onToggleMembers={onToggleMembers} /> {/* ✅ props 전달 */}
      <MessageList />
      <TypingIndicator users={typingUsers} />
      <MessageInput />
    </div>
  )
}

export function ChatApp() {
  const [showMembers, setShowMembers] = useState(true)

  return (
    <ChatProvider>
      <div className="h-screen bg-background flex">
        <Sidebar />
        <ChatContent onToggleMembers={() => setShowMembers((p) => !p)} /> {/* ✅ 전달 */}
        {showMembers && <RoomMembersPanel />}
      </div>
    </ChatProvider>
  )
}
