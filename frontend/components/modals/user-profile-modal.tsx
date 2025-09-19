"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Edit3,
  Save,
  X,
  Camera,
  Calendar,
  Clock,
  Mail,
  MessageCircle,
  Settings,
  Shield,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { User as UserType } from "@/types/chat"

interface UserProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserType
  isCurrentUser?: boolean
  onUpdateProfile?: (updates: Partial<UserType>) => Promise<void>
}

export function UserProfileModal({
  open,
  onOpenChange,
  user,
  isCurrentUser = false,
  onUpdateProfile,
}: UserProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editData, setEditData] = useState({
    name: user.name,
    statusMessage: user.statusMessage || "",
    status: user.status,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    if (!onUpdateProfile) return

    setIsLoading(true)
    try {
      await onUpdateProfile(editData)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      name: user.name,
      statusMessage: user.statusMessage || "",
      status: user.status,
    })
    setIsEditing(false)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // In a real app, you would upload the file to a server
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        if (onUpdateProfile) {
          onUpdateProfile({ profileImage: imageUrl })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const getStatusColor = (status: UserType["status"]) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: UserType["status"]) => {
    switch (status) {
      case "online":
        return "온라인"
      case "away":
        return "자리비움"
      case "offline":
        return "오프라인"
      default:
        return "알 수 없음"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isCurrentUser ? "내 프로필" : `${user.name}님의 프로필`}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">프로필</TabsTrigger>
            <TabsTrigger value="activity">활동</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      {user.profileImage ? (
                        <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                      ) : (
                        <AvatarFallback className={cn("text-2xl font-bold text-white", user.color)}>
                          {user.avatar}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {isCurrentUser && isEditing && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                    <div
                      className={cn(
                        "absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-background",
                        getStatusColor(user.status),
                      )}
                    />
                  </div>

                  <div className="flex-1 space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">이름</Label>
                          <Input
                            id="name"
                            value={editData.name}
                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">상태</Label>
                          <Select
                            value={editData.status}
                            onValueChange={(value: UserType["status"]) => setEditData({ ...editData, status: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="online">온라인</SelectItem>
                              <SelectItem value="away">자리비움</SelectItem>
                              <SelectItem value="offline">오프라인</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="statusMessage">상태 메시지</Label>
                          <Textarea
                            id="statusMessage"
                            value={editData.statusMessage}
                            onChange={(e) => setEditData({ ...editData, statusMessage: e.target.value })}
                            placeholder="상태 메시지를 입력하세요..."
                            className="mt-1 resize-none"
                            rows={2}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-2xl font-bold">{user.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <div className={cn("h-2 w-2 rounded-full", getStatusColor(user.status))} />
                              {getStatusText(user.status)}
                            </Badge>
                          </div>
                        </div>
                        {user.statusMessage && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-sm text-muted-foreground italic">"{user.statusMessage}"</p>
                          </div>
                        )}
                      </div>
                    )}

                    {isCurrentUser && (
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button onClick={handleSave} disabled={isLoading} size="sm">
                              <Save className="h-4 w-4 mr-2" />
                              저장
                            </Button>
                            <Button variant="outline" onClick={handleCancel} size="sm">
                              <X className="h-4 w-4 mr-2" />
                              취소
                            </Button>
                          </>
                        ) : (
                          <Button onClick={() => setIsEditing(true)} size="sm">
                            <Edit3 className="h-4 w-4 mr-2" />
                            편집
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  계정 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">이메일</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">가입일</p>
                      <p className="text-sm text-muted-foreground">{formatDate(user.joinDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">마지막 활동</p>
                      <p className="text-sm text-muted-foreground">{formatDateTime(user.lastActive)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">사용자 ID</p>
                      <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  활동 통계
                </CardTitle>
                <CardDescription>사용자의 채팅 활동 정보입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">총 메시지</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">활동 일수</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">0h</p>
                    <p className="text-sm text-muted-foreground">온라인 시간</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
                <CardDescription>최근 채팅 활동 내역입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>아직 활동 내역이 없습니다.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}
