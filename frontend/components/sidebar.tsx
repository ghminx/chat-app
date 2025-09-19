"use client"

import type React from "react"
import { useState } from "react"
import { Hash, Users, Settings, Moon, Sun, LogOut, Plus, Lock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useChat } from "@/contexts/chat-context"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { CreateRoomModal } from "@/components/modals/create-room-modal"
import { ProfileSettingsModal } from "@/components/modals/profile-settings-modal"

// 상태 텍스트/색상 매핑 함수
const getStatusText = (status: string) => {
  switch (status) {
    case "online":
      return "온라인"
    case "away":
      return "자리비움"
    case "offline":
      return "오프라인"
    default:
      return "알수없음"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-500 animate-pulse"
    case "away":
      return "bg-yellow-500"
    case "offline":
      return "bg-gray-400"
    default:
      return "bg-gray-400"
  }
}

export function Sidebar() {
  const {
    rooms,
    activeRoomId,
    setActiveRoom,
    createRoom,
    deleteRoom,
    loading,
    error,
    onlineUsers = []
  } = useChat()

  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [createRoomOpen, setCreateRoomOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  const handleRoomClick = (room: typeof rooms[0]) => {
    setActiveRoom(room.id)
  }

  const handleCreateRoom = async (name: string, description: string, type: "public" | "private") => {
    const success = await createRoom(name, description, type)
    if (!success) {
      throw new Error("채팅방 생성에 실패했습니다.")
    }
  }

  return (
    <>
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-sidebar-foreground">채팅 앱</h1>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-8 w-8 p-0 hover:bg-sidebar-accent"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-sidebar-foreground" />
                ) : (
                  <Moon className="h-4 w-4 text-sidebar-foreground" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-sidebar-accent">
                    <Settings className="h-4 w-4 text-sidebar-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Chat Rooms */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-sidebar-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" />
                채팅방
                {loading && <span className="text-xs text-muted-foreground">(로딩중...)</span>}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCreateRoomOpen(true)}
                className="h-6 w-6 p-0 hover:bg-sidebar-accent"
                disabled={loading}
              >
                <Plus className="h-4 w-4 text-sidebar-foreground" />
              </Button>
            </div>

            {error && (
              <div className="mb-3 p-2 bg-destructive/10 text-destructive text-xs rounded">
                {error}
              </div>
            )}

            <div className="space-y-1">
            {rooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between">
                <button
                  onClick={() => handleRoomClick(room)}
                  className={cn(
                    "flex-1 px-3 py-2 text-left rounded-md",
                    activeRoomId === room.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50"
                  )}
                >
                  {room.name}
                </button>
                {room.creatorId === user?.id && ( // 방장만 보이게
                  <button
                    onClick={async () => {
                      const ok = await deleteRoom(room.id)
                      if (ok) console.log("삭제 완료")
                    }}
                    className="text-red-500 hover:text-red-700 px-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}



            </div>

            {rooms.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                채팅방이 없습니다.<br />
                새 채팅방을 만들어보세요!
              </div>
            )}
          </div>

          {/* Online Users 섹션 */}
          <div className="p-4 border-t border-sidebar-border">
            <h2 className="text-sm font-semibold text-sidebar-foreground mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              사용자 목록 ({onlineUsers.length})
            </h2>
            <div className="space-y-2">
              {onlineUsers.length > 0 ? (
                onlineUsers.map((onlineUser) => (
                  <div
                    key={onlineUser.id}
                    className="flex items-center gap-3 group hover:bg-sidebar-accent/30 p-2 rounded-md transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={cn("text-xs font-medium text-white", onlineUser.color)}>
                          {onlineUser.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar transition-all",
                          getStatusColor(onlineUser.status)
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sidebar-foreground truncate group-hover:text-sidebar-accent-foreground transition-colors">
                        {onlineUser.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getStatusText(onlineUser.status)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground text-center py-4">
                  사용자가 없습니다
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Current User */}
        {user && (
          <div
            className="p-4 border-t border-sidebar-border bg-sidebar-accent/20 cursor-pointer hover:bg-sidebar-accent/40 transition-colors"
            onClick={() => setProfileModalOpen(true)}  
          >
            <div className="w-full flex items-center gap-3 p-2">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm font-medium">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar",
                  getStatusColor(user.status || "offline")
                )} />
              </div>

              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">{getStatusText(user.status || "offline")}</p>
              </div>

              {/* 로그아웃 버튼 */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-destructive/20"
                onClick={(e) => {
                  e.stopPropagation()
                  logout()
                }}
              >
                <LogOut className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <CreateRoomModal 
        open={createRoomOpen} 
        onOpenChange={setCreateRoomOpen} 
        onCreateRoom={handleCreateRoom} 
      />

      <ProfileSettingsModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        onUpdateProfile={async (updates) => {
          console.log("프로필 업데이트 요청:", updates)
        }}
        onDeleteAccount={async () => {
          console.log("계정 삭제 요청")
        }}
      />
    </>
  )
}
