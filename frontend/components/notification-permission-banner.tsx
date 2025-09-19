"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, X } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"

export function NotificationPermissionBanner() {
  const { hasPermission, requestPermission } = useNotifications()
  const [dismissed, setDismissed] = useState(false)

  if (hasPermission || dismissed || !("Notification" in window)) {
    return null
  }

  const handleRequestPermission = async () => {
    const permission = await requestPermission()
    if (permission === "granted") {
      setDismissed(true)
    }
  }

  return (
    <Card className="m-4 border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">알림 권한 허용</p>
              <p className="text-sm text-muted-foreground">새 메시지 알림을 받으려면 브라우저 알림을 허용해주세요.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleRequestPermission} size="sm">
              허용
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
