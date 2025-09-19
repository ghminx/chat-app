"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Calendar, User } from "lucide-react"
import type { Message, User as UserType } from "@/types/chat"
import { formatMessageTimeShort } from "@/utils/time-formatting"
import { cn } from "@/lib/utils"

interface MessageSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  messages: Message[]
  users: UserType[]
  onMessageSelect: (message: Message) => void
}

export function MessageSearchModal({ open, onOpenChange, messages, users, onMessageSelect }: MessageSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMessages([])
      return
    }

    let filtered = messages.filter(
      (message) => !message.deleted && message.content.toLowerCase().includes(searchQuery.toLowerCase().trim()),
    )

    if (selectedUser) {
      filtered = filtered.filter((message) => message.userId === selectedUser)
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Limit to 50 results
    setFilteredMessages(filtered.slice(0, 50))
  }, [searchQuery, messages, selectedUser])

  const getUserById = (userId: string) => {
    return users.find((u) => u.id === userId)
  }

  const handleMessageClick = (message: Message) => {
    onMessageSelect(message)
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen)
    if (!newOpen) {
      setSearchQuery("")
      setSelectedUser(null)
      setFilteredMessages([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            메시지 검색
          </DialogTitle>
          <DialogDescription>채팅방에서 메시지를 검색하세요</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="메시지 내용을 검색하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* User Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              사용자:
            </span>
            <Button
              variant={selectedUser === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedUser(null)}
            >
              전체
            </Button>
            {users.map((user) => (
              <Button
                key={user.id}
                variant={selectedUser === user.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedUser(user.id)}
                className="flex items-center gap-1"
              >
                <Avatar className="h-4 w-4">
                  <AvatarFallback className={cn("text-xs text-white", user.color)}>{user.avatar}</AvatarFallback>
                </Avatar>
                {user.name}
              </Button>
            ))}
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {searchQuery.trim() && filteredMessages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>검색 결과가 없습니다</p>
              </div>
            )}

            {filteredMessages.map((message) => {
              const user = getUserById(message.userId)
              return (
                <div
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={cn("text-xs text-white", user?.color || "bg-gray-500")}>
                        {user?.avatar || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{user?.name || "알 수 없는 사용자"}</span>
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatMessageTimeShort(message.timestamp)}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">{message.content}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
