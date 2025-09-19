import { useChat } from "@/contexts/chat-context"

export function RoomMembersPanel() {
  const { roomMembers, activeRoomId } = useChat()
  

  if (!activeRoomId) {
    return (
      <div className="w-64 border-l border-gray-200 p-4 text-sm text-gray-500">
        방을 선택하세요
      </div>
    )
  }

  return (
    <div className="w-64 border-l border-gray-200 p-4">
      <h2 className="text-sm font-semibold mb-3">참여자 ({roomMembers.length})</h2>
      <ul className="space-y-2">
        {roomMembers.map((m) => (
          <li key={m.id} className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
              {m.avatar}
            </div>
            <span>{m.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
