"use client"

import { useEffect, useRef } from "react"
import type { Message, User } from "@/types/chat"

const mockMessages = [
  { userId: "1", content: "안녕하세요! 👋", roomId: "1" },
  { userId: "2", content: "새 프로젝트 작업 중이에요", roomId: "3" },
  { userId: "3", content: "오늘 날씨가 정말 좋네요!", roomId: "1" },
  { userId: "4", content: "React 18의 새로운 기능들 어떻게 생각하세요?", roomId: "3" },
  { userId: "1", content: "점심 뭐 드셨나요?", roomId: "2" },
  { userId: "2", content: "TypeScript 5.0 업데이트 소식 들으셨나요?", roomId: "3" },
  { userId: "3", content: "주말에 코딩 스터디 어떠세요?", roomId: "1" },
  { userId: "4", content: "새로운 디자인 시스템 적용해봤어요", roomId: "2" },
  { userId: "1", content: "Next.js 14 정말 빨라졌네요!", roomId: "3" },
  { userId: "2", content: "커피 한 잔 하실래요? ☕", roomId: "1" },
  { userId: "3", content: "버그 수정 완료했습니다!", roomId: "2" },
  { userId: "4", content: "새로운 라이브러리 추천해주세요", roomId: "3" },
  { userId: "1", content: "오늘 배포 예정입니다", roomId: "1" },
  { userId: "2", content: "코드 리뷰 부탁드려요", roomId: "2" },
  { userId: "3", content: "테스트 케이스 추가했어요", roomId: "3" },
]

interface UseRealTimeSimulationProps {
  addMessage: (message: Message) => void
  setTypingUsers: (users: User[]) => void
  onlineUsers: User[]
  currentUserId?: string
}

export function useRealTimeSimulation({
  addMessage,
  setTypingUsers,
  onlineUsers,
  currentUserId,
}: UseRealTimeSimulationProps) {
  const intervalRef = useRef<NodeJS.Timeout>()
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const simulateRealTimeActivity = () => {
      // Random interval between 3-8 seconds
      const randomDelay = Math.random() * 5000 + 3000

      intervalRef.current = setTimeout(() => {
        // Randomly choose between sending a message or showing typing
        const shouldSendMessage = Math.random() > 0.3

        if (shouldSendMessage) {
          // Send a random message
          const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)]
          const randomUser = onlineUsers.find((u) => u.id === randomMessage.userId)

          if (randomUser && randomUser.id !== currentUserId) {
            const newMessage: Message = {
              id: Date.now().toString() + Math.random(),
              userId: randomUser.id,
              roomId: randomMessage.roomId,
              content: randomMessage.content,
              timestamp: new Date(),
              reactions: [],
            }

            addMessage(newMessage)
          }
        } else {
          // Show typing indicator
          const randomUser = onlineUsers[Math.floor(Math.random() * onlineUsers.length)]
          if (randomUser && randomUser.id !== currentUserId) {
            setTypingUsers([randomUser])

            // Clear typing after 2-4 seconds
            typingTimeoutRef.current = setTimeout(
              () => {
                setTypingUsers([])
              },
              Math.random() * 2000 + 2000,
            )
          }
        }

        // Schedule next activity
        simulateRealTimeActivity()
      }, randomDelay)
    }

    // Start simulation
    simulateRealTimeActivity()

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current)
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [addMessage, setTypingUsers, onlineUsers, currentUserId])

  return null
}
