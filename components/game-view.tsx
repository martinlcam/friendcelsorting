"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useGameStore, type Player } from "@/lib/store"
import { RevealModal } from "./reveal-modal"
import { RotateCcw } from "lucide-react"

export function GameView() {
  const players = useGameStore((state) => state.players)
  const gameStarted = useGameStore((state) => state.gameStarted)
  const resetGame = useGameStore((state) => state.resetGame)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  if (!gameStarted) return null

  const openReveal = (player: Player) => {
    setSelectedPlayer(player)
    setModalOpen(true)
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>🎮 Game Started!</CardTitle>
          <Button variant="outline" size="sm" onClick={resetGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">Each player, take your turn to reveal your role privately:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {players.map((player) => (
            <Button key={player.id} onClick={() => openReveal(player)} variant="outline" className="justify-start">
              {player.name}
            </Button>
          ))}
        </div>
      </CardContent>

      <RevealModal open={modalOpen} onOpenChange={setModalOpen} player={selectedPlayer} />
    </Card>
  )
}
