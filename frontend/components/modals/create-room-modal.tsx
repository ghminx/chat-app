"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Hash, Lock } from "lucide-react"

interface CreateRoomModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateRoom: (name: string, description: string, type: "public" | "private") => Promise<void>
}

export function CreateRoomModal({ open, onOpenChange, onCreateRoom }: CreateRoomModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"public" | "private">("public")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("채팅방 이름을 입력해주세요")
      return
    }

    if (name.length > 50) {
      setError("채팅방 이름은 50자를 초과할 수 없습니다")
      return
    }

    setIsSubmitting(true)
    try {
      await onCreateRoom(name.trim(), description.trim(), type)
      setName("")
      setDescription("")
      setType("public")
      onOpenChange(false)
    } catch (error) {
      setError("채팅방 생성 중 오류가 발생했습니다")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(newOpen)
      if (!newOpen) {
        setName("")
        setDescription("")
        setType("public")
        setError("")
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 채팅방 만들기</DialogTitle>
          <DialogDescription>새로운 채팅방을 생성하여 대화를 시작하세요</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="room-name">채팅방 이름 *</Label>
            <Input
              id="room-name"
              placeholder="채팅방 이름을 입력하세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">{name.length}/50</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-description">설명 (선택사항)</Label>
            <Textarea
              id="room-description"
              placeholder="채팅방에 대한 간단한 설명을 입력하세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">{description.length}/200</p>
          </div>

          <div className="space-y-3">
            <Label>채팅방 유형</Label>
            <RadioGroup value={type} onValueChange={(value) => setType(value as "public" | "private")}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="public" id="public" disabled={isSubmitting} />
                <div className="flex items-center gap-2 flex-1">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="public" className="font-medium cursor-pointer">
                      공개방
                    </Label>
                    <p className="text-xs text-muted-foreground">누구나 참여할 수 있습니다</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="private" id="private" disabled={isSubmitting} />
                <div className="flex items-center gap-2 flex-1">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="private" className="font-medium cursor-pointer">
                      비공개방
                    </Label>
                    <p className="text-xs text-muted-foreground">초대받은 사람만 참여할 수 있습니다</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "생성 중..." : "채팅방 만들기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
