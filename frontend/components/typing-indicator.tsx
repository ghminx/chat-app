"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface TypingIndicatorProps {
  users: Array<{
    name: string
    avatar: string
    color: string
  }>
}

export function TypingIndicator({ users = [] }: TypingIndicatorProps) {
  if (users.length === 0) return null

  return (
    <div className="px-4 py-2 animate-fade-in">
      <div className="flex gap-3 items-center bg-muted/50 p-3 rounded-lg">
        <div className="flex -space-x-2">
          {users.slice(0, 3).map((user, index) => (
            <Avatar key={index} className="h-6 w-6 border-2 border-background animate-pulse">
              <AvatarFallback className={cn("text-xs font-medium text-white", user.color)}>
                {user.avatar}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          {users.length === 1 ? (
            <span>
              <strong className="text-foreground">{users[0].name}</strong>님이 입력 중
            </span>
          ) : users.length === 2 ? (
            <span>
              <strong className="text-foreground">{users[0].name}</strong>님과{" "}
              <strong className="text-foreground">{users[1].name}</strong>님이 입력 중
            </span>
          ) : (
            <span>
              <strong className="text-foreground">{users[0].name}</strong>님 외 {users.length - 1}명이 입력 중
            </span>
          )}
          <span className="inline-flex ml-1 gap-1">
            <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        </div>
      </div>
    </div>
  )
}
