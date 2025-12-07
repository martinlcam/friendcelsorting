"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { submitVote, getSessionPlayers, showResults } from "@/lib/game-service"
import { createClient } from "@/lib/supabase/client"

interface VotingProps {
  sessionId: string
  deviceId: string
  onResultsReady: () => void
}

export function Voting({ sessionId, deviceId, onResultsReady }: VotingProps) {
  const [players, setPlayers] = useState<any[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<any>(null)
  const [selectedVote, setSelectedVote] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchGameState()
    const supabase = createClient()
    const channel = supabase
      .channel(`voting-${sessionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "game_players" }, () => {
        fetchGameState()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [sessionId])

  const fetchGameState = async () => {
    try {
      const playersList = await getSessionPlayers(sessionId)
      setPlayers(playersList)
      const currentDevicePlayer = playersList.find((p) => p.device_id === deviceId)
      setCurrentPlayer(currentDevicePlayer)
    } catch (error) {
      console.error("Failed to fetch players:", error)
    }
  }

  const handleVote = async () => {
    if (!selectedVote || !currentPlayer) return

    setIsLoading(true)
    try {
      await submitVote(sessionId, currentPlayer.id, selectedVote)
      setHasVoted(true)
    } catch (error) {
      console.error("Failed to vote:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShowResults = async () => {
    try {
      await showResults(sessionId)
      onResultsReady()
    } catch (error) {
      console.error("Failed to show results:", error)
    }
  }

  if (!currentPlayer) {
    return <div className="text-center text-muted-foreground">Loading...</div>
  }

  const otherPlayers = players.filter((p) => p.id !== currentPlayer.id)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Who is the Imposter?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasVoted ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                {otherPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedVote(player.id)}
                    className={`p-4 rounded-lg border-2 transition ${
                      selectedVote === player.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-semibold text-sm">{player.name}</p>
                    <p className="text-xs text-muted-foreground">Team {player.team + 1}</p>
                  </button>
                ))}
              </div>
              <Button onClick={handleVote} disabled={!selectedVote || isLoading} className="w-full">
                {isLoading ? "Voting..." : "Submit Vote"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-center text-sm text-muted-foreground">Vote submitted!</p>
              <Button onClick={handleShowResults} className="w-full bg-transparent" variant="outline">
                Show Results
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
