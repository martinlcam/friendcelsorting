"use client"

import { useGameStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Shuffle } from "lucide-react"

export function RandomizeButton() {
  const players = useGameStore((state) => state.players)
  const randomizeGame = useGameStore((state) => state.randomizeGame)
  const gameStarted = useGameStore((state) => state.gameStarted)

  const isDisabled = players.length === 0

  return (
    <Button onClick={randomizeGame} disabled={isDisabled} className="w-full" size="lg">
      <Shuffle className="w-4 h-4 mr-2" />
      {gameStarted ? "Randomize Again" : "Create Teams"}
    </Button>
  )
}
