"use client"

import { useAuth } from "@/contexts/auth-context"
import { AuthScreen } from "@/components/auth/auth-screen"
import { ChatApp } from "@/components/chat-app"
import { AuthProvider } from "@/contexts/auth-context"

function AppContent() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthScreen />
  }

  return <ChatApp />
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
