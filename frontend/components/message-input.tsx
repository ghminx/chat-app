"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Smile, Paperclip, X, Reply } from "lucide-react"
import { useChat } from "@/contexts/chat-context"
import { cn } from "@/lib/utils"

export function MessageInput() {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { sendMessage, replyingTo, clearReply, onlineUsers } = useChat()

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message.trim())
      setMessage("")
      setIsTyping(false)
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    if (e.key === "Escape" && replyingTo) {
      clearReply()
    }
  }

  const handleInputChange = (value: string) => {
    setMessage(value)
    setIsTyping(value.length > 0)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const getReplyingToUser = () => {
    if (!replyingTo) return null
    return onlineUsers.find((u) => u.id === replyingTo.userId)
  }

  const replyingToUser = getReplyingToUser()

  return (
    <div className="border-t border-border bg-card">
      {replyingTo && (
        <div className="px-4 pt-3 pb-2 border-b border-border/50">
          <div className="flex items-center justify-between bg-accent/30 rounded-lg p-3">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <Reply className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {replyingToUser?.name || "알 수 없는 사용자"}님에게 답장
                </p>
                <p className="text-sm text-muted-foreground truncate">{replyingTo.content}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearReply} className="h-6 w-6 p-0 hover:bg-accent">
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <div className="p-5">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                replyingTo
                  ? "답장을 입력하세요... (ESC로 취소, Shift+Enter로 줄바꿈)"
                  : "메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
              }
              className={cn(
                "min-h-[44px] max-h-32 resize-none pr-20 focus:ring-2 focus:ring-primary/20 transition-all",
                replyingTo && "border-primary/50 focus:border-primary",
              )}
              rows={1}
            />
            <div className="absolute right-2 top-2 flex gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className={cn(
              "h-11 px-4 transition-all hover:scale-105 disabled:scale-100",
              replyingTo && "bg-primary hover:bg-primary/90",
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {isTyping && (
          <div className="mt-2 text-xs text-muted-foreground animate-fade-in">
            <span className="inline-flex items-center gap-1">
              입력 중
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
