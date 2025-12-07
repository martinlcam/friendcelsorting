"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGameStore } from "@/lib/store"
import { RotateCcw, CheckCircle2 } from "lucide-react"

export function VotingPhase() {
  const players = useGameStore((state) => state.players)
  const votes = useGameStore((state) => state.votes)
  const imposters = useGameStore((state) => state.imposters)
  const addVote = useGameStore((state) => state.addVote)
  const endVoting = useGameStore((state) => state.endVoting)
  const resetGame = useGameStore((state) => state.resetGame)
  const revealedVotes = useGameStore((state) => state.revealedVotes)
  const gamePhase = useGameStore((state) => state.gamePhase)

  const [currentVoterIndex, setCurrentVoterIndex] = useState(0)
  const currentVoter = players[currentVoterIndex]
  const hasVoted = votes.has(currentVoter?.id || "")

  const handleVote = (targetPlayerId: string) => {
    if (currentVoter) {
      addVote(currentVoter.id, targetPlayerId)
      // Move to next voter
      if (currentVoterIndex < players.length - 1) {
        setCurrentVoterIndex(currentVoterIndex + 1)
      }
    }
  }

  const getVoteCount = (playerId: string) => {
    let count = 0
    votes.forEach((targetId) => {
      if (targetId === playerId) count++
    })
    return count
  }

  const mostVotedPlayerId = players.reduce((max, player) => {
    const maxVotes = getVoteCount(max.id)
    const playerVotes = getVoteCount(player.id)
    return playerVotes > maxVotes ? player : max
  }).id

  return (
    <div className="space-y-6">
      {gamePhase === "voting" && !revealedVotes ? (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle>🗳️ Voting Phase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Current Voter:</p>
              <p className="text-2xl font-bold text-primary">{currentVoter?.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {currentVoterIndex + 1} of {players.length}
              </p>
            </div>

            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-3">Who do you think is the imposter?</p>
              <div className="grid grid-cols-2 gap-2">
                {players
                  .filter((p) => p.id !== currentVoter?.id)
                  .map((player) => (
                    <Button
                      key={player.id}
                      onClick={() => handleVote(player.id)}
                      disabled={hasVoted}
                      variant="outline"
                      className="justify-start"
                    >
                      {player.name}
                    </Button>
                  ))}
              </div>
            </div>

            {hasVoted && currentVoterIndex === players.length - 1 && (
              <Button onClick={endVoting} className="w-full" size="lg">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                End Voting & See Results
              </Button>
            )}

            {hasVoted && currentVoterIndex < players.length - 1 && (
              <div className="text-center text-sm text-muted-foreground">✓ Vote recorded. Next voter's turn...</div>
            )}
          </CardContent>
        </Card>
      ) : revealedVotes ? (
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle>📊 Voting Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {players.map((player) => {
                const voteCount = getVoteCount(player.id)
                const isImposter = imposters.includes(player.id)
                const isMostVoted = player.id === mostVotedPlayerId

                return (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg border-2 ${
                      isMostVoted ? "border-red-500 bg-red-500/10" : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">
                          {player.name}
                          {isImposter && " 🎭"}
                        </p>
                        <p className="text-sm text-muted-foreground">Team {player.team + 1}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{voteCount}</div>
                        <div className="text-xs text-muted-foreground">votes</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-4 border-t border-border">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-2">Most Voted:</p>
                <p className="text-xl font-bold">{players.find((p) => p.id === mostVotedPlayerId)?.name}</p>
              </div>

              <Button onClick={resetGame} className="w-full" size="lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                Start New Game
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
