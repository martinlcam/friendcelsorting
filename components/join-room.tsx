"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSessionByCode } from "@/lib/game-service"

interface JoinRoomProps {
  onRoomJoined: (roomCode: string) => void
}

export function JoinRoom({ onRoomJoined }: JoinRoomProps) {
  const [roomCode, setRoomCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleJoinRoom = async () => {
    setError("")
    setIsLoading(true)
    try {
      await getSessionByCode(roomCode.toUpperCase())
      onRoomJoined(roomCode.toUpperCase())
    } catch (error) {
      setError("Room not found. Check the code and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join a Game Room</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Room Code</label>
          <Input
            type="text"
            placeholder="e.g., ABC123"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button onClick={handleJoinRoom} disabled={isLoading || roomCode.length !== 6} className="w-full">
          {isLoading ? "Joining..." : "Join Room"}
        </Button>
      </CardContent>
    </Card>
  )
}
