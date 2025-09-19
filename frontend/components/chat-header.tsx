"use client"

import { Hash, Users } from "lucide-react"
import { useChat } from "@/contexts/chat-context"

interface ChatHeaderProps {
  onToggleMembers?: () => void
}

export function ChatHeader({ onToggleMembers }: ChatHeaderProps) {
  const { currentRoom, onlineUsers } = useChat()

  if (!currentRoom) return null

  return (
    <div className="border-b border-border p-4 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold text-card-foreground">
            {currentRoom.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* 온라인 인원 수 */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{onlineUsers.filter((u) => u.status === "online").length}명 온라인</span>
          </div>

          {/* 👉 멤버 패널 토글 버튼 */}
          {onToggleMembers && (
            <button
              onClick={onToggleMembers}
              className="ml-2 p-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
              title="참여자 목록 열기/닫기"
            >
              <Users className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
