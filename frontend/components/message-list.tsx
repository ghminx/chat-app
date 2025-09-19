"use client"

import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useChat } from "@/contexts/chat-context"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { formatMessageTime } from "@/utils/time-formatting"
import { MoreHorizontal, Edit, Trash2, Reply, Pin, Search } from "lucide-react"
import { EditMessageModal } from "@/components/modals/edit-message-modal"
import { MessageSearchModal } from "@/components/modals/message-search-modal"
import { UserProfileModal } from "@/components/modals/user-profile-modal"
import type { Message, User } from "@/types/chat"

export function MessageList() {
  const { messages, onlineUsers, editMessage, deleteMessage, replyToMessage, pinMessage } = useChat()
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getUserById = (userId: string) => {
    return onlineUsers.find((u) => u.id === userId) || user
  }

  const groupMessages = () => {
    const grouped: Array<{
      user: any
      messages: typeof messages
      timestamp: Date
    }> = []

    messages.forEach((message) => {
      const messageUser = getUserById(message.userId)
      const lastGroup = grouped[grouped.length - 1]

      if (lastGroup && lastGroup.user?.id === message.userId) {
        // Check if messages are within 5 minutes of each other
        const timeDiff = message.timestamp.getTime() - lastGroup.timestamp.getTime()
        if (timeDiff < 5 * 60 * 1000) {
          lastGroup.messages.push(message)
          return
        }
      }

      grouped.push({
        user: messageUser,
        messages: [message],
        timestamp: message.timestamp,
      })
    })

    return grouped
  }

  const handleEditMessage = (messageId: string, newContent: string) => {
    editMessage(messageId, newContent)
    setEditingMessage(null)
  }

  const handleDeleteMessage = (messageId: string) => {
    if (confirmingDelete === messageId) {
      deleteMessage(messageId)
      setConfirmingDelete(null)
    } else {
      setConfirmingDelete(messageId)
      setTimeout(() => setConfirmingDelete(null), 3000)
    }
  }

  const handleReplyToMessage = (message: Message) => {
    replyToMessage(message.id)
  }

  const handlePinMessage = (messageId: string) => {
    pinMessage(messageId)
  }

  const handleMessageSelect = (message: Message) => {
    // Scroll to message (simplified implementation)
    const messageElement = document.getElementById(`message-${message.id}`)
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" })
      messageElement.classList.add("bg-accent/50")
      setTimeout(() => messageElement.classList.remove("bg-accent/50"), 2000)
    }
  }

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    setProfileModalOpen(true)
  }

  const messageGroups = groupMessages()

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4 animate-bounce">💬</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">대화를 시작해보세요!</h3>
          <p className="text-muted-foreground mb-4">첫 번째 메시지를 보내서 채팅을 시작하세요.</p>
          {/* <Button variant="outline" onClick={() => setSearchOpen(true)} className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            메시지 검색
          </Button> */}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
        {/* Search Button */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b p-2 z-10">
          <Button variant="outline" size="sm" onClick={() => setSearchOpen(true)} className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            메시지 검색
          </Button>
        </div>

        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            <div className="flex gap-3 animate-fade-in-up group hover:bg-muted/30 p-2 rounded-lg transition-all duration-200">
              <button
                onClick={() => group.user && handleUserClick(group.user)}
                className="hover:scale-105 transition-transform"
              >
                <Avatar className="h-10 w-10 mt-1 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                  <AvatarFallback className={cn("text-sm font-medium text-white", group.user?.color || "bg-gray-500")}>
                    {group.user?.avatar || "?"}
                  </AvatarFallback>
                </Avatar>
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {group.user?.name || "알 수 없는 사용자"}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatMessageTime(group.timestamp)}</span>
                </div>
                <div className="space-y-1">
                  {group.messages.map((message, index) => (
                    <div
                      key={message.id}
                      id={`message-${message.id}`}
                      className="group/message relative animate-fade-in transition-colors rounded p-1 -m-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Reply indicator */}
                      {message.replyToMessageId && (
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Reply className="h-3 w-3" />
                          답장
                        </div>
                      )}

                      <div className="flex items-start justify-between">
                        <div className="flex-1 text-foreground leading-relaxed">
                          {message.content}
                          {message.editedAt && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              수정됨
                            </Badge>
                          )}
                        </div>

                        {/* Message Actions */}
                        {user?.id === message.userId && (
                          <div className="opacity-0 group-hover/message:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingMessage(message)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  수정
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReplyToMessage(message)}>
                                  <Reply className="mr-2 h-4 w-4" />
                                  답장
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePinMessage(message.id)}>
                                  <Pin className="mr-2 h-4 w-4" />
                                  고정
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteMessage(message.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {confirmingDelete === message.id ? "정말 삭제하시겠습니까?" : "삭제"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <EditMessageModal
        open={!!editingMessage}
        onOpenChange={(open) => !open && setEditingMessage(null)}
        message={editingMessage}
        onEditMessage={handleEditMessage}
      />

      <MessageSearchModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        messages={messages}
        users={onlineUsers}
        onMessageSelect={handleMessageSelect}
      />

      {selectedUser && (
        <UserProfileModal
          open={profileModalOpen}
          onOpenChange={setProfileModalOpen}
          user={selectedUser}
          isCurrentUser={selectedUser.id === user?.id}
        />
      )}
    </>
  )
}
