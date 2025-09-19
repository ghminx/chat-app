"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Hash, Lock, Users, MoreVertical, UserMinus, Shield, User, Crown, Settings, LogOut } from "lucide-react"
import type { ChatRoom, User as UserType } from "@/types/chat"
import { cn } from "@/lib/utils"

interface RoomInfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: ChatRoom | null
  currentUser: UserType | null
  allUsers: UserType[]
  onKickMember: (userId: string) => void
  onUpdateMemberRole: (userId: string, role: "admin" | "member") => void
  onLeaveRoom: () => void
  onToggleNotifications: () => void
  onToggleFavorite: () => void
}

export function RoomInfoModal({
  open,
  onOpenChange,
  room,
  currentUser,
  allUsers,
  onKickMember,
  onUpdateMemberRole,
  onLeaveRoom,
  onToggleNotifications,
  onToggleFavorite,
}: RoomInfoModalProps) {
  const [confirmingAction, setConfirmingAction] = useState<string | null>(null)

  if (!room || !currentUser) return null

  const currentMember = room.members.find((m) => m.userId === currentUser.id)
  const isOwner = room.creatorId === currentUser.id
  const isAdmin = currentMember?.role === "admin"
  const canManageMembers = isOwner || isAdmin

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3 text-yellow-500" />
      case "admin":
        return <Shield className="h-3 w-3 text-blue-500" />
      default:
        return <User className="h-3 w-3 text-muted-foreground" />
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case "owner":
        return "방장"
      case "admin":
        return "관리자"
      default:
        return "멤버"
    }
  }

  const handleConfirmAction = (action: string, callback: () => void) => {
    if (confirmingAction === action) {
      callback()
      setConfirmingAction(null)
    } else {
      setConfirmingAction(action)
      setTimeout(() => setConfirmingAction(null), 3000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {room.type === "public" ? <Hash className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            {room.name}
          </DialogTitle>
          <DialogDescription>{room.description || "설명이 없습니다"}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Room Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              설정
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">알림</span>
                <Button
                  variant={room.settings.notifications ? "default" : "outline"}
                  size="sm"
                  onClick={onToggleNotifications}
                >
                  {room.settings.notifications ? "켜짐" : "꺼짐"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">즐겨찾기</span>
                <Button variant={room.settings.favorite ? "default" : "outline"} size="sm" onClick={onToggleFavorite}>
                  {room.settings.favorite ? "★" : "☆"}
                </Button>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              멤버 ({room.members.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {room.members.map((member) => {
                const user = allUsers.find((u) => u.id === member.userId)
                if (!user) return null

                const canKick = canManageMembers && member.userId !== currentUser.id && member.role !== "owner"
                const canChangeRole = isOwner && member.userId !== currentUser.id && member.role !== "owner"

                return (
                  <div key={member.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={cn("text-xs font-medium text-white", user.color)}>
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        {getRoleIcon(member.role)}
                        <Badge variant="outline" className="text-xs">
                          {getRoleText(member.role)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(member.joinedAt).toLocaleDateString("ko-KR")} 참여
                      </p>
                    </div>
                    {(canKick || canChangeRole) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canChangeRole && member.role === "member" && (
                            <DropdownMenuItem onClick={() => onUpdateMemberRole(member.userId, "admin")}>
                              <Shield className="mr-2 h-4 w-4" />
                              관리자로 승격
                            </DropdownMenuItem>
                          )}
                          {canChangeRole && member.role === "admin" && (
                            <DropdownMenuItem onClick={() => onUpdateMemberRole(member.userId, "member")}>
                              <User className="mr-2 h-4 w-4" />
                              멤버로 강등
                            </DropdownMenuItem>
                          )}
                          {canKick && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onKickMember(member.userId)}
                                className="text-destructive"
                              >
                                <UserMinus className="mr-2 h-4 w-4" />
                                강퇴하기
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          {!isOwner && (
            <div className="pt-4 border-t">
              <Button
                variant={confirmingAction === "leave" ? "destructive" : "outline"}
                onClick={() => handleConfirmAction("leave", onLeaveRoom)}
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {confirmingAction === "leave" ? "정말 나가시겠습니까?" : "채팅방 나가기"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
