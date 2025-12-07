"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSessionPlayers, getSessionVotes } from "@/lib/game-service"

interface ResultsProps {
  sessionId: string
  onPlayAgain: () => void
}

export function Results({ sessionId, onPlayAgain }: ResultsProps) {
  const [players, setPlayers] = useState<any[]>([])
  const [votes, setVotes] = useState<any[]>([])
  const [voteCount, setVoteCount] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchResults()
  }, [sessionId])

  const fetchResults = async () => {
    try {
      const [playersList, votesList] = await Promise.all([getSessionPlayers(sessionId), getSessionVotes(sessionId)])

      setPlayers(playersList)
      setVotes(votesList)

      // Count votes
      const counts: Record<string, number> = {}
      votesList.forEach((vote) => {
        counts[vote.voted_for_id] = (counts[vote.voted_for_id] || 0) + 1
      })
      setVoteCount(counts)
    } catch (error) {
      console.error("Failed to fetch results:", error)
    }
  }

  const getMostVoted = () => {
    if (Object.keys(voteCount).length === 0) return null
    return Object.entries(voteCount).sort(([, a], [, b]) => b - a)[0][0]
  }

  const mostVoted = getMostVoted()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Game Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Actual Imposters */}
          <div>
            <h3 className="font-semibold mb-3 text-destructive">Actual Imposters</h3>
            <div className="space-y-2">
              {players
                .filter((p) => p.is_imposter)
                .map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-2 bg-destructive/10 rounded">
                    <span className="font-medium">{player.name}</span>
                    <Badge variant="destructive">Imposter</Badge>
                  </div>
                ))}
            </div>
          </div>

          {/* Most Voted */}
          <div>
            <h3 className="font-semibold mb-3">Voting Results</h3>
            <div className="space-y-2">
              {players.map((player) => {
                const votes = voteCount[player.id] || 0
                const isMostVoted = player.id === mostVoted

                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-2 rounded ${
                      isMostVoted ? "bg-primary/10 border border-primary" : "bg-muted"
                    }`}
                  >
                    <span className="font-medium">{player.name}</span>
                    <span className="text-sm font-semibold">{votes} votes</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Team Assignments */}
          <div>
            <h3 className="font-semibold mb-3">Teams</h3>
            <div className="space-y-2">
              {Array.from({ length: Math.max(...players.map((p) => p.team)) + 1 }).map((_, teamIdx) => (
                <div key={teamIdx}>
                  <p className="text-sm font-medium mb-1">Team {teamIdx + 1}</p>
                  <ul className="space-y-1 ml-4">
                    {players
                      .filter((p) => p.team === teamIdx)
                      .map((player) => (
                        <li key={player.id} className="text-sm flex items-center gap-2">
                          {player.name}
                          {player.is_imposter && (
                            <Badge variant="destructive" className="text-xs">
                              Imposter
                            </Badge>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onPlayAgain} className="w-full">
        Play Another Round
      </Button>
    </div>
  )
}
