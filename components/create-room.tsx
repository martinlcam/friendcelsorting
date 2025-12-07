"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createGameSession } from "@/lib/game-service"

interface CreateRoomProps {
  onRoomCreated: (roomCode: string) => void
}

export function CreateRoom({ onRoomCreated }: CreateRoomProps) {
  const [imposterCount, setImposterCount] = useState(1)
  const [teamCount, setTeamCount] = useState(2)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateRoom = async () => {
    setIsLoading(true)
    try {
      const session = await createGameSession(imposterCount, teamCount)
      onRoomCreated(session.room_code)
    } catch (error) {
      console.error("Failed to create room:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Game Room</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Number of Imposters</label>
          <Input
            type="number"
            min="1"
            value={imposterCount}
            onChange={(e) => setImposterCount(Math.max(1, Number.parseInt(e.target.value) || 1))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Number of Teams</label>
          <Input
            type="number"
            min="2"
            value={teamCount}
            onChange={(e) => setTeamCount(Math.max(2, Number.parseInt(e.target.value) || 2))}
          />
        </div>
        <Button onClick={handleCreateRoom} disabled={isLoading} className="w-full">
          {isLoading ? "Creating..." : "Create Room"}
        </Button>
      </CardContent>
    </Card>
  )
}
