"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGameStore } from "@/lib/store"
import { RevealModal } from "./reveal-modal"
import { VotingPhase } from "./voting-phase"
import { RotateCcw, Users } from "lucide-react"

export function GameView() {
  const players = useGameStore((state) => state.players)
  const gameStarted = useGameStore((state) => state.gameStarted)
  const gamePhase = useGameStore((state) => state.gamePhase)
  const currentRevealingPlayer = useGameStore((state) => state.currentRevealingPlayer)
  const revealedPlayers = useGameStore((state) => state.revealedPlayers)
  const resetGame = useGameStore((state) => state.resetGame)
  const [modalOpen, setModalOpen] = useState(false)

  if (!gameStarted) return null

  const currentPlayer = players.find((p) => p.id === currentRevealingPlayer)

  if (gamePhase === "voting" || gamePhase === "results") {
    return <VotingPhase />
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Reveal Phase
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {revealedPlayers.size} of {players.length} revealed
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={resetGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Currently Revealing:</p>
          <p className="text-2xl font-bold text-primary">{currentPlayer?.name || "Loading..."}</p>
        </div>

        {currentPlayer && (
          <div className="flex justify-center">
            <Button onClick={() => setModalOpen(true)} size="lg" className="px-8">
              {revealedPlayers.has(currentPlayer.id) ? "Role Already Revealed" : "Reveal My Role"}
            </Button>
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Progress:</p>
          <div className="space-y-2">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${revealedPlayers.has(player.id) ? "bg-cyan-400" : "bg-muted"}`}
                    style={{
                      width: revealedPlayers.has(player.id) ? "100%" : "0%",
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground min-w-20">{player.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <RevealModal open={modalOpen} onOpenChange={setModalOpen} player={currentPlayer} />
    </Card>
  )
}
