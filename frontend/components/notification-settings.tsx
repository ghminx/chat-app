"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Bell, Volume2, TestTube } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"

export function NotificationSettings() {
  const { settings, updateSettings, playNotificationSound, showToast, hasPermission, requestPermission } =
    useNotifications()

  const handleTestNotification = () => {
    showToast("테스트 알림입니다!", "info")
    playNotificationSound()
  }

  const handleRequestPermission = async () => {
    const permission = await requestPermission()
    if (permission === "granted") {
      showToast("알림 권한이 허용되었습니다", "success")
    } else {
      showToast("알림 권한이 거부되었습니다", "error")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          알림 설정
        </CardTitle>
        <CardDescription>알림 수신 방법을 설정합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <Label>브라우저 알림 권한</Label>
            <p className="text-sm text-muted-foreground">
              {hasPermission ? "허용됨" : "거부됨 - 데스크톱 알림을 받으려면 권한을 허용해주세요"}
            </p>
          </div>
          {!hasPermission && (
            <Button onClick={handleRequestPermission} size="sm">
              권한 요청
            </Button>
          )}
        </div>

        <Separator />

        {/* Sound Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>소리 알림</Label>
              <p className="text-sm text-muted-foreground">새 메시지가 도착할 때 소리로 알려줍니다.</p>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
            />
          </div>

          {settings.soundEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              <div>
                <Label>음량</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={[settings.soundVolume * 100]}
                    onValueChange={([value]) => updateSettings({ soundVolume: value / 100 })}
                    max={100}
                    step={10}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-12">{Math.round(settings.soundVolume * 100)}%</span>
                </div>
              </div>

              <div>
                <Label>알림음</Label>
                <Select
                  value={settings.notificationSound}
                  onValueChange={(value) => updateSettings({ notificationSound: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">기본음</SelectItem>
                    <SelectItem value="chime">차임</SelectItem>
                    <SelectItem value="ding">딩</SelectItem>
                    <SelectItem value="pop">팝</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Desktop Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <Label>데스크톱 알림</Label>
            <p className="text-sm text-muted-foreground">브라우저 알림을 통해 새 메시지를 알려줍니다.</p>
          </div>
          <Switch
            checked={settings.desktopNotifications && hasPermission}
            onCheckedChange={(checked) => updateSettings({ desktopNotifications: checked })}
            disabled={!hasPermission}
          />
        </div>

        <Separator />

        {/* Mention Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <Label>멘션 알림</Label>
            <p className="text-sm text-muted-foreground">나를 언급한 메시지에 대한 특별 알림을 받습니다.</p>
          </div>
          <Switch
            checked={settings.mentionNotifications}
            onCheckedChange={(checked) => updateSettings({ mentionNotifications: checked })}
          />
        </div>

        <Separator />

        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <Label>이메일 알림</Label>
            <p className="text-sm text-muted-foreground">중요한 알림을 이메일로 받습니다.</p>
          </div>
          <Switch
            checked={settings.emailNotifications}
            onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })}
          />
        </div>

        <Separator />

        {/* Test Button */}
        <div className="flex justify-center">
          <Button onClick={handleTestNotification} variant="outline" className="flex items-center gap-2 bg-transparent">
            <TestTube className="h-4 w-4" />
            알림 테스트
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
