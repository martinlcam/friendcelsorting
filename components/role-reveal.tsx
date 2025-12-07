"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface RoleRevealProps {
  sessionId: string
  deviceId: string
  onRevealsComplete: () => void
}

export function RoleReveal({ sessionId, deviceId, onRevealsComplete }: RoleRevealProps) {
  const [currentPlayer, setCurrentPlayer] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [team, setTeam] = useState<number | null>(null)
  const [hasRevealed, setHasRevealed] = useState(false)
  const [revealedCount, setRevealedCount] = useState(0)
  const [totalPlayers, setTotalPlayers] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`reveal-${sessionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "game_players" }, () => {
        fetchGameState()
      })
      .subscribe()

    fetchGameState()

    return () => {
      channel.unsubscribe()
    }
  }, [sessionId])

  const fetchGameState = async () => {
    const supabase = createClient()

    const { data: players } = await supabase.from("game_players").select("*").eq("session_id", sessionId)

    if (players) {
      setTotalPlayers(players.length)
      const currentDevicePlayer = players.find((p) => p.device_id === deviceId)
      if (currentDevicePlayer) {
        setCurrentPlayer(currentDevicePlayer)
      }
    }
  }

  const handleReveal = () => {
    if (currentPlayer) {
      setRole(currentPlayer.is_imposter ? "IMPOSTER" : "CREW")
      setTeam(currentPlayer.team)
      setHasRevealed(true)
    }
  }

  const handleContinue = async () => {
    const supabase = createClient()
    const { data: session } = await supabase.from("game_sessions").select("*").eq("id", sessionId).single()

    if (session?.status === "voting") {
      onRevealsComplete()
    }
  }

  if (!currentPlayer) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Private Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            This is only visible to you. Don't let others see!
          </p>

          {!hasRevealed ? (
            <button
              onClick={handleReveal}
              className="w-full h-24 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-lg hover:bg-primary/90 transition"
            >
              Tap to Reveal Your Role
            </button>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Your Role</p>
                <Badge variant={role === "IMPOSTER" ? "destructive" : "default"} className="text-lg py-2">
                  {role}
                </Badge>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Your Team</p>
                <Badge variant="outline" className="text-lg py-2">
                  Team {team + 1}
                </Badge>
              </div>
              <button
                onClick={handleContinue}
                className="w-full bg-secondary text-secondary-foreground rounded-lg py-2 font-semibold hover:bg-secondary/90 transition"
              >
                Continue
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-xs text-muted-foreground">
            {revealedCount + (hasRevealed ? 1 : 0)} of {totalPlayers} players revealed
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
