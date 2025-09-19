export interface User {
  id: string
  name: string
  email: string
  status: "online" | "away" | "offline"
  avatar: string
  color: string
  profileImage?: string
  joinDate: string
  lastActive: string
  statusMessage?: string
}

export interface ChatRoom {
  id: string
  name: string
  description?: string
  type: "public" | "private"
  creatorId: string
  createdAt: string
  unreadCount: number
  members: RoomMember[]
  settings: {
    notifications: boolean
    favorite: boolean
    pinnedMessageId?: string
  }
}

export interface RoomMember {
  userId: string
  role: "owner" | "admin" | "member"
  joinedAt: string
}

export interface Message {
  id: string
  userId: string
  roomId: string
  content: string
  type: "text" | "image" | "file" | "system"
  replyToMessageId?: string
  timestamp: Date
  editedAt?: Date
  deleted: boolean
  reactions: MessageReaction[]
}

export interface MessageReaction {
  userId: string
  emoji: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginData {
  email: string
  password: string
}
