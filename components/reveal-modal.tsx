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
  const revealImposter = useGameStore((state) => state.revealImposter)
  const revealedImposters = useGameStore((state) => state.revealedImposters)

  if (!player) return null

  const isImposter = imposters.includes(player.id)
  const hasRevealed = revealedImposters.has(player.id)

  const handleReveal = () => {
    setRevealed(true)
    revealImposter(player.id)
  }

  const handleClose = () => {
    setRevealed(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Role Reveal</DialogTitle>
          <DialogDescription>{player.name}, click below to see your role</DialogDescription>
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
              <div className={`text-6xl font-bold mb-4 ${isImposter ? "text-destructive" : "text-green-500"}`}>
                {isImposter ? "🎭" : "✓"}
              </div>
              <div className={`text-3xl font-bold mb-2 ${isImposter ? "text-destructive" : "text-green-500"}`}>
                {isImposter ? "You are an Imposter" : "You are NOT an Imposter"}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {/*change this default ahh text*/}
                {isImposter ? "peepo smile" : "peepo hmmdge"}
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
