"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useGameStore, type Player } from "@/lib/store"

interface RevealModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  player: Player | null
}

export function RevealModal({ open, onOpenChange, player }: RevealModalProps) {
  const [revealed, setRevealed] = useState(false)
  const imposters = useGameStore((state) => state.imposters)
  const players = useGameStore((state) => state.players)
  const markPlayerRevealed = useGameStore((state) => state.markPlayerRevealed)

  if (!player) return null

  const isImposter = imposters.includes(player.id)
  const teamNumber = player.team + 1
  const teamPlayers = players.filter((p) => p.team === player.team)

  const handleReveal = () => {
    setRevealed(true)
  }

  const handleClose = () => {
    setRevealed(false)
    markPlayerRevealed(player.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Role Reveal</DialogTitle>
          <DialogDescription>{player.name}, only you can see this. Click to reveal your role.</DialogDescription>
        </DialogHeader>
        <div className="py-6">
          {!revealed ? (
            <div className="text-center">
              <p className="text-lg font-semibold mb-4">Ready to see your role?</p>
              <Button onClick={handleReveal} variant="default" size="lg" className="w-full">
                Reveal My Role
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className={`text-6xl font-bold mb-4 ${isImposter ? "text-red-500" : "text-cyan-400"}`}>
                {isImposter ? "🎭" : "🔍"}
              </div>
              <div className={`text-3xl font-bold mb-2 ${isImposter ? "text-red-500" : "text-cyan-400"}`}>
                {isImposter ? "IMPOSTER" : "CREW"}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Your Team:</p>
                <div className="text-2xl font-bold text-primary">Team {teamNumber}</div>
                <div className="text-xs text-muted-foreground mt-2">{teamPlayers.length} members</div>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                {isImposter ? "Try to blend in with your team!" : "Work together to find the imposters!"}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleClose} variant="outline" className="w-full bg-transparent">
            {revealed ? "Done" : "Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
