"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import type { Message, User } from "@/types/chat"

interface NotificationSettings {
  soundEnabled: boolean
  desktopNotifications: boolean
  emailNotifications: boolean
  mentionNotifications: boolean
  soundVolume: number
  notificationSound: string
}

interface NotificationContextType {
  settings: NotificationSettings
  updateSettings: (updates: Partial<NotificationSettings>) => void
  showNotification: (title: string, body: string, options?: NotificationOptions) => void
  playNotificationSound: () => void
  requestPermission: () => Promise<NotificationPermission>
  hasPermission: boolean
  isDocumentVisible: boolean
  unreadCount: number
  setUnreadCount: (count: number) => void
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void
  notifyNewMessage: (message: Message, sender: User) => void
  notifyUserJoined: (user: User) => void
  notifyUserLeft: (user: User) => void
  notifyRoomCreated: (roomName: string) => void
  notifyMention: (message: Message, sender: User) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const DEFAULT_SETTINGS: NotificationSettings = {
  soundEnabled: true,
  desktopNotifications: true,
  emailNotifications: false,
  mentionNotifications: true,
  soundVolume: 0.5,
  notificationSound: "default",
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS)
  const [hasPermission, setHasPermission] = useState(false)
  const [isDocumentVisible, setIsDocumentVisible] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("chatApp_notificationSettings")
    if (savedSettings) {
      setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) })
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("chatApp_notificationSettings", JSON.stringify(settings))
  }, [settings])

  // Check notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setHasPermission(Notification.permission === "granted")
    }
  }, [])

  // Track document visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentVisible(!document.hidden)
      if (!document.hidden) {
        setUnreadCount(0)
        // Clear favicon badge
        updateFavicon(0)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  // Update page title with unread count
  useEffect(() => {
    const originalTitle = "채팅 앱"
    if (unreadCount > 0 && !isDocumentVisible) {
      document.title = `(${unreadCount}) ${originalTitle}`
    } else {
      document.title = originalTitle
    }
  }, [unreadCount, isDocumentVisible])

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/notification-sound.mp3")
    audioRef.current.volume = settings.soundVolume
  }, [settings.soundVolume])

  const updateFavicon = (count: number) => {
    const canvas = document.createElement("canvas")
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext("2d")

    if (ctx) {
      // Draw base favicon (simplified)
      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(0, 0, 32, 32)
      ctx.fillStyle = "#ffffff"
      ctx.font = "20px Arial"
      ctx.textAlign = "center"
      ctx.fillText("💬", 16, 22)

      // Draw badge if count > 0
      if (count > 0) {
        ctx.fillStyle = "#ef4444"
        ctx.beginPath()
        ctx.arc(24, 8, 8, 0, 2 * Math.PI)
        ctx.fill()

        ctx.fillStyle = "#ffffff"
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.fillText(count > 99 ? "99+" : count.toString(), 24, 12)
      }

      // Update favicon
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
      if (link) {
        link.href = canvas.toDataURL()
      }
    }
  }

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!("Notification" in window)) {
      return "denied"
    }

    const permission = await Notification.requestPermission()
    setHasPermission(permission === "granted")
    return permission
  }

  const showNotification = (title: string, body: string, options?: NotificationOptions) => {
    if (!settings.desktopNotifications || !hasPermission || isDocumentVisible) {
      return
    }

    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "chat-message",
      requireInteraction: false,
      ...options,
    })

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000)

    // Focus window when clicked
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }

  const playNotificationSound = () => {
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((error) => {
        console.warn("Could not play notification sound:", error)
      })
    }
  }

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    switch (type) {
      case "success":
        toast.success(message)
        break
      case "error":
        toast.error(message)
        break
      case "warning":
        toast.warning(message)
        break
      default:
        toast.info(message)
    }
  }

  const notifyNewMessage = (message: Message, sender: User) => {
    if (sender.id === user?.id) return // Don't notify for own messages

    if (!isDocumentVisible) {
      setUnreadCount((prev) => prev + 1)
      updateFavicon(unreadCount + 1)
    }

    playNotificationSound()

    showNotification(`${sender.name}님의 새 메시지`, message.content, {
      icon: sender.profileImage || undefined,
    })
  }

  const notifyMention = (message: Message, sender: User) => {
    if (!settings.mentionNotifications || sender.id === user?.id) return

    playNotificationSound()

    showNotification(`${sender.name}님이 당신을 언급했습니다`, message.content, {
      icon: sender.profileImage || undefined,
      requireInteraction: true,
    })

    showToast(`${sender.name}님이 당신을 언급했습니다`, "info")
  }

  const notifyUserJoined = (joinedUser: User) => {
    if (joinedUser.id === user?.id) return

    showToast(`${joinedUser.name}님이 채팅방에 참여했습니다`, "info")

    if (!isDocumentVisible) {
      showNotification("새 사용자 참여", `${joinedUser.name}님이 채팅방에 참여했습니다`)
    }
  }

  const notifyUserLeft = (leftUser: User) => {
    if (leftUser.id === user?.id) return

    showToast(`${leftUser.name}님이 채팅방을 나갔습니다`, "info")
  }

  const notifyRoomCreated = (roomName: string) => {
    showToast(`새 채팅방 "${roomName}"이 생성되었습니다`, "success")
  }

  return (
    <NotificationContext.Provider
      value={{
        settings,
        updateSettings,
        showNotification,
        playNotificationSound,
        requestPermission,
        hasPermission,
        isDocumentVisible,
        unreadCount,
        setUnreadCount,
        showToast,
        notifyNewMessage,
        notifyUserJoined,
        notifyUserLeft,
        notifyRoomCreated,
        notifyMention,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
