"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { addPlayerToSession, getSessionPlayers, startRound } from "@/lib/game-service"
import { createClient } from "@/lib/supabase/client"

interface LobbyProps {
  roomCode: string
  sessionId: string
  onGameStarted: () => void
}

export function Lobby({ roomCode, sessionId, onGameStarted }: LobbyProps) {
  const [playerName, setPlayerName] = useState("")
  const [players, setPlayers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [deviceId] = useState(() => localStorage.getItem("deviceId") || crypto.randomUUID())

  useEffect(() => {
    localStorage.setItem("deviceId", deviceId)
  }, [deviceId])

  // Subscribe to real-time updates
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`game-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_players", filter: `session_id=eq.${sessionId}` },
        () => {
          fetchPlayers()
        },
      )
      .subscribe()

    fetchPlayers()

    return () => {
      channel.unsubscribe()
    }
  }, [sessionId])

  const fetchPlayers = async () => {
    try {
      const playersList = await getSessionPlayers(sessionId)
      setPlayers(playersList)
    } catch (error) {
      console.error("Failed to fetch players:", error)
    }
  }

  const handleAddPlayer = async () => {
    if (!playerName.trim()) return

    setIsLoading(true)
    try {
      await addPlayerToSession(sessionId, playerName, deviceId)
      setPlayerName("")
      await fetchPlayers()
    } catch (error) {
      console.error("Failed to add player:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartGame = async () => {
    setIsLoading(true)
    try {
      await startRound(sessionId)
      onGameStarted()
    } catch (error) {
      console.error("Failed to start game:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Room Code: {roomCode}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Share this code with other players to join</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Your Name</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddPlayer()}
          />
          <Button onClick={handleAddPlayer} disabled={isLoading || !playerName.trim()} className="w-full">
            Add Name
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Players ({players.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {players.length === 0 ? (
            <p className="text-sm text-muted-foreground">Waiting for players...</p>
          ) : (
            <ul className="space-y-2">
              {players.map((player) => (
                <li key={player.id} className="text-sm">
                  {player.name}
                </li>
              ))}
            </ul>
          )}
          <Button onClick={handleStartGame} disabled={players.length < 2 || isLoading} className="w-full mt-4">
            Start Game
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
