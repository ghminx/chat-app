export const formatMessageTime = (timestamp: Date): string => {
  const now = new Date()
  const messageTime = new Date(timestamp)

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const isYesterday = (date1: Date, date2: Date) => {
    const yesterday = new Date(date1)
    yesterday.setDate(yesterday.getDate() - 1)
    return isSameDay(yesterday, date2)
  }

  const formatTime12Hour = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? "오후" : "오전"
    const displayHours = hours % 12 || 12
    return `${ampm} ${displayHours}:${minutes.toString().padStart(2, "0")}`
  }

  if (isSameDay(now, messageTime)) {
    return `오늘 ${formatTime12Hour(messageTime)}`
  } else if (isYesterday(now, messageTime)) {
    return `어제 ${formatTime12Hour(messageTime)}`
  } else {
    const month = messageTime.getMonth() + 1
    const day = messageTime.getDate()
    return `${month}월 ${day}일 ${formatTime12Hour(messageTime)}`
  }
}

export const formatMessageTimeShort = (timestamp: Date): string => {
  const now = new Date()
  const messageTime = new Date(timestamp)

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const formatTime12Hour = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? "오후" : "오전"
    const displayHours = hours % 12 || 12
    return `${ampm} ${displayHours}:${minutes.toString().padStart(2, "0")}`
  }

  if (isSameDay(now, messageTime)) {
    return formatTime12Hour(messageTime)
  } else {
    const month = messageTime.getMonth() + 1
    const day = messageTime.getDate()
    return `${month}/${day}`
  }
}
