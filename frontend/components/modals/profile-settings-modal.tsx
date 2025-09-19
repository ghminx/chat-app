"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Settings, User, Bell, Shield, Palette, Save, Eye, EyeOff, Trash2, AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "next-themes"
import type { User as UserType } from "@/types/chat"

interface ProfileSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateProfile?: (updates: Partial<UserType>) => Promise<void>
  onDeleteAccount?: () => Promise<void>
}

export function ProfileSettingsModal({
  open,
  onOpenChange,
  onUpdateProfile,
  onDeleteAccount,
}: ProfileSettingsModalProps) {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [settings, setSettings] = useState({
    // Profile settings
    name: user?.name || "",
    statusMessage: user?.statusMessage || "",
    status: user?.status || "online",

    // Privacy settings
    showEmail: true,
    showLastActive: true,
    allowDirectMessages: true,

    // Notification settings
    soundEnabled: true,
    desktopNotifications: true,
    emailNotifications: false,
    mentionNotifications: true,

    // Appearance settings
    theme: theme || "system",
    fontSize: "medium",
    compactMode: false,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const handleSaveProfile = async () => {
    if (!onUpdateProfile) return

    setIsLoading(true)
    try {
      await onUpdateProfile({
        name: settings.name,
        statusMessage: settings.statusMessage,
        status: settings.status as UserType["status"],
      })
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.")
      return
    }

    setIsLoading(true)
    try {
      // In a real app, you would call an API to change the password
      console.log("Password change requested")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      alert("비밀번호가 변경되었습니다.")
    } catch (error) {
      console.error("Failed to change password:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!onDeleteAccount) return

    setIsLoading(true)
    try {
      await onDeleteAccount()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to delete account:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            설정
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">프로필</TabsTrigger>
            <TabsTrigger value="privacy">개인정보</TabsTrigger>
            <TabsTrigger value="notifications">알림</TabsTrigger>
            <TabsTrigger value="appearance">모양</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  프로필 정보
                </CardTitle>
                <CardDescription>기본 프로필 정보를 수정할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="profile-name">이름</Label>
                  <Input
                    id="profile-name"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-status">상태</Label>
                  <Select
                    value={settings.status}
                    onValueChange={(value) => setSettings({ ...settings, status: value })}
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
                  <Label htmlFor="profile-status-message">상태 메시지</Label>
                  <Textarea
                    id="profile-status-message"
                    value={settings.statusMessage}
                    onChange={(e) => setSettings({ ...settings, statusMessage: e.target.value })}
                    placeholder="상태 메시지를 입력하세요..."
                    className="mt-1 resize-none"
                    rows={2}
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  프로필 저장
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  비밀번호 변경
                </CardTitle>
                <CardDescription>계정 보안을 위해 정기적으로 비밀번호를 변경하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="current-password">현재 비밀번호</Label>
                  <div className="relative mt-1">
                    <Input
                      id="current-password"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="new-password">새 비밀번호</Label>
                  <div className="relative mt-1">
                    <Input
                      id="new-password"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirm-password"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={
                    isLoading ||
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword
                  }
                >
                  <Shield className="h-4 w-4 mr-2" />
                  비밀번호 변경
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>개인정보 설정</CardTitle>
                <CardDescription>다른 사용자에게 표시되는 정보를 관리합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>이메일 주소 표시</Label>
                    <p className="text-sm text-muted-foreground">다른 사용자가 내 이메일을 볼 수 있습니다.</p>
                  </div>
                  <Switch
                    checked={settings.showEmail}
                    onCheckedChange={(checked) => setSettings({ ...settings, showEmail: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>마지막 활동 시간 표시</Label>
                    <p className="text-sm text-muted-foreground">다른 사용자가 내 마지막 활동 시간을 볼 수 있습니다.</p>
                  </div>
                  <Switch
                    checked={settings.showLastActive}
                    onCheckedChange={(checked) => setSettings({ ...settings, showLastActive: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>직접 메시지 허용</Label>
                    <p className="text-sm text-muted-foreground">
                      다른 사용자가 나에게 직접 메시지를 보낼 수 있습니다.
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowDirectMessages}
                    onCheckedChange={(checked) => setSettings({ ...settings, allowDirectMessages: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  위험 구역
                </CardTitle>
                <CardDescription>이 작업들은 되돌릴 수 없습니다. 신중하게 진행하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                {!showDeleteConfirm ? (
                  <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    계정 삭제
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <p className="text-sm font-medium text-destructive mb-2">계정 삭제 확인</p>
                      <p className="text-sm text-muted-foreground">
                        계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다. 정말로 계정을
                        삭제하시겠습니까?
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        네, 삭제합니다
                      </Button>
                      <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                        취소
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  알림 설정
                </CardTitle>
                <CardDescription>알림 수신 방법을 설정합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>소리 알림</Label>
                    <p className="text-sm text-muted-foreground">새 메시지가 도착할 때 소리로 알려줍니다.</p>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>데스크톱 알림</Label>
                    <p className="text-sm text-muted-foreground">브라우저 알림을 통해 새 메시지를 알려줍니다.</p>
                  </div>
                  <Switch
                    checked={settings.desktopNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, desktopNotifications: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>이메일 알림</Label>
                    <p className="text-sm text-muted-foreground">중요한 알림을 이메일로 받습니다.</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>멘션 알림</Label>
                    <p className="text-sm text-muted-foreground">나를 언급한 메시지에 대한 특별 알림을 받습니다.</p>
                  </div>
                  <Switch
                    checked={settings.mentionNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, mentionNotifications: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  모양 설정
                </CardTitle>
                <CardDescription>채팅 앱의 모양과 느낌을 설정합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>테마</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value) => {
                      setSettings({ ...settings, theme: value })
                      setTheme(value)
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">라이트</SelectItem>
                      <SelectItem value="dark">다크</SelectItem>
                      <SelectItem value="system">시스템 설정</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>글꼴 크기</Label>
                  <Select
                    value={settings.fontSize}
                    onValueChange={(value) => setSettings({ ...settings, fontSize: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">작게</SelectItem>
                      <SelectItem value="medium">보통</SelectItem>
                      <SelectItem value="large">크게</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>컴팩트 모드</Label>
                    <p className="text-sm text-muted-foreground">메시지 간격을 줄여 더 많은 내용을 표시합니다.</p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, compactMode: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
