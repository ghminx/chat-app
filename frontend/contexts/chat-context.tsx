"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react"
import type { ChatRoom, Message, ChatState, User } from "@/types/chat"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"

interface ChatContextType extends ChatState {
  createRoom: (name: string, description: string, type: "public" | "private") => Promise<boolean>
  joinRoom: (roomId: string) => Promise<boolean>
  leaveRoom: (roomId: string) => Promise<boolean>
  deleteRoom: (roomId: string) => Promise<boolean>
  setActiveRoom: (roomId: string | null) => void
  sendMessage: (content: string) => Promise<boolean>
  loadRoomMembers: (roomId: string) => Promise<void>   // ✅ 추가
  roomMembers: User[]                                  // ✅ 추가
  loading: boolean
  error: string | null
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatState, setChatState] = useState<ChatState>({
    rooms: [],
    activeRoomId: null,
    messages: [],
    onlineUsers: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roomMembers, setRoomMembers] = useState<User[]>([])  

  const { user, isAuthenticated } = useAuth()
  const wsRef = useRef<WebSocket | null>(null)


  // === WebSocket 연결 ===
  useEffect(() => {
    if (isAuthenticated && user) {
      connectWebSocket()
      loadRooms()
      loadUsers()
    } else {
      disconnectWebSocket()
      setChatState({
        rooms: [],
        activeRoomId: null,
        messages: [],
        onlineUsers: [],
      })
    }

    return () => {
      disconnectWebSocket()
    }
  }, [isAuthenticated, user])

  const connectWebSocket = () => {
    if (!user) return
    const token = localStorage.getItem("access_token")
    if (!token) return

    const ws = new WebSocket(`ws://localhost:8000/ws?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log("✅ WebSocket connected")
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log("📩 WS Message:", data)

        // === 사용자 상태 업데이트 (presence 이벤트) ===
        if (data.type === "presence") {
          setChatState((prev) => {
            const updatedUsers = prev.onlineUsers.map((u) =>
              u.id === data.userId.toString()
                ? { ...u, status: data.status }
                : u
            )
            return { ...prev, onlineUsers: updatedUsers }
          })
        }

        // === 새 메시지 수신 ===
        if (data.type === "message") {
          setChatState((prev) => ({
            ...prev,
            messages: [...prev.messages, data],
          }))
        }

        // === 방 업데이트 ===
        if (data.type === "room_update") {
          loadRooms()
        }
      } catch (err) {
        console.error("WS parse error:", err)
      }
    }

    ws.onclose = () => {
      console.log("❌ WebSocket disconnected")
      wsRef.current = null
    }

    ws.onerror = (err) => {
      console.error("⚠️ WebSocket error:", err)
    }
  }

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }

  // === API 로드 ===
  const loadRooms = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiRooms = await apiClient.getRooms()
      const rooms: ChatRoom[] = apiRooms.map((room) => ({
        id: room.room_id.toString(),
        name: room.name,
        description: room.description || "",
        type: room.room_type as "public" | "private",
        creatorId: room.created_by.toString(),
        createdAt: room.created_at,
        unreadCount: 0,
        members: [],
        settings: { notifications: true, favorite: false },
      }))

      setChatState((prev) => ({ ...prev, rooms }))
    } catch (err: any) {
      console.error("Failed to load rooms:", err)
      setError(err.message || "채팅방 목록을 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const apiUsers = await apiClient.getUsers()
      const users: User[] = apiUsers.map((u) => ({
        id: u.user_id.toString(),
        name: u.name,
        email: u.email,
        avatar: u.name.charAt(0).toUpperCase(),
        status: u.status || "offline",   // ✅ DB 값 반영
        role: u.role as "user" | "admin",
        lastSeen: new Date(u.updated_at),
        color: "bg-blue-500",
      }))

      setChatState((prev) => ({ ...prev, onlineUsers: users }))
    } catch (err) {
      console.error("사용자 목록 로드 실패:", err)
    }
  }

  // === 방 관련 ===
  const createRoom = async (
    name: string,
    description: string,
    type: "public" | "private"
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const newApiRoom = await apiClient.createRoom({
        name,
        description,
        room_type: type,
      })

      const newRoom: ChatRoom = {
        id: newApiRoom.room_id.toString(),
        name: newApiRoom.name,
        description: newApiRoom.description || "",
        type: newApiRoom.room_type as "public" | "private",
        creatorId: newApiRoom.created_by.toString(),
        createdAt: newApiRoom.created_at,
        unreadCount: 0,
        members: [
          {
            userId: user?.id || "",
            role: "owner",
            joinedAt: new Date().toISOString(),
          },
        ],
        settings: { notifications: true, favorite: false },
      }

      setChatState((prev) => ({ ...prev, rooms: [...prev.rooms, newRoom] }))
      return true
    } catch (err: any) {
      console.error("Failed to create room:", err)
      setError(err.message || "채팅방 생성에 실패했습니다.")
      return false
    } finally {
      setLoading(false)
    }

  }

    const deleteRoom = async (roomId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await apiClient.deleteRoom(parseInt(roomId))
      setChatState((prev) => ({
        ...prev,
        rooms: prev.rooms.filter((room) => room.id !== roomId),
        activeRoomId: prev.activeRoomId === roomId ? null : prev.activeRoomId,
      }))
      return true
    } catch (err: any) {
      console.error("Failed to delete room:", err)
      setError(err.message || "채팅방 삭제에 실패했습니다.")
      return false
    } finally {
      setLoading(false)
    }
  }

  // === 방 멤버 로드 ===
  const loadRoomMembers = async (roomId: string) => {
    try {
      const res = await apiClient.getRoomMembers(parseInt(roomId))
      const members = res.members

      setRoomMembers(
        members.map((m: any) => ({
          id: m.user_id.toString(),
          name: m.name,
          email: m.email,
          avatar: m.name.charAt(0).toUpperCase(),
          status: "offline", // 기본값 (추후 presence로 덮어씌움)
          role: m.role,
          lastSeen: new Date(m.joined_at),
          color: "bg-blue-500",
        }))
      )
    } catch (err) {
      console.error("방 멤버 로드 실패:", err)
    }
  }

  const joinRoom = async (roomId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await apiClient.joinRoom(parseInt(roomId))
      await loadRooms()
      return true
    } catch (err: any) {
      console.error("Failed to join room:", err)
      setError(err.message || "채팅방 참여에 실패했습니다.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const leaveRoom = async (roomId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await apiClient.leaveRoom(parseInt(roomId))
      setChatState((prev) => ({
        ...prev,
        rooms: prev.rooms.filter((room) => room.id !== roomId),
        activeRoomId:
          prev.activeRoomId === roomId ? null : prev.activeRoomId,
      }))
      return true
    } catch (err: any) {
      console.error("Failed to leave room:", err)
      setError(err.message || "채팅방 나가기에 실패했습니다.")
      return false
    } finally {
      setLoading(false)
    }
  }

  const setActiveRoom = (roomId: string | null) => {
    setChatState((prev) => ({ ...prev, activeRoomId: roomId }))
    if (roomId) {
      loadMessages(roomId)
      loadRoomMembers(roomId)   // ✅ 참여자 목록 갱신
    } else {
      setRoomMembers([])        // 방 없을 땐 비우기
    }
  }

  const loadMessages = async (roomId: string) => {
    console.log("Loading messages for room:", roomId)
    // TODO: 메시지 API 붙이기
  }

  // === 메시지 전송 ===
  const sendMessage = async (content: string): Promise<boolean> => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WS not connected")
      return false
    }
    if (!chatState.activeRoomId || !user) return false

    const message = {
      type: "message",
      roomId: chatState.activeRoomId,
      content,
      sender: { id: user.id, name: user.name },
    }

    wsRef.current.send(JSON.stringify(message))
    return true
  }

    const currentRoom =
    chatState.rooms.find((room) => room.id === chatState.activeRoomId) || null
    
  return (
    <ChatContext.Provider
      value={{
        ...chatState,
        roomMembers,        // ✅ 별도로 관리된 상태를 제공
        currentRoom,
        loadRoomMembers,    // ✅ 컨텍스트에 제공
        createRoom,
        joinRoom,
        leaveRoom,
        deleteRoom,
        setActiveRoom,
        sendMessage,
        loading,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
