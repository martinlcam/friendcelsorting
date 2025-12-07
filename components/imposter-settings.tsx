"use client"

import { useGameStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

export function ImposterSettings() {
  const players = useGameStore((state) => state.players)
  const imposterCount = useGameStore((state) => state.imposterCount)
  const teamCount = useGameStore((state) => state.teamCount)
  const setImposterCount = useGameStore((state) => state.setImposterCount)
  const setTeamCount = useGameStore((state) => state.setTeamCount)

  const maxImposters = Math.max(0, players.length - 1)

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-4">Number of Teams</h3>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setTeamCount(teamCount - 1)} disabled={teamCount === 2}>
            <Minus className="w-4 h-4" />
          </Button>
          <div className="text-center min-w-24">
            <div className="text-2xl font-bold text-primary">{teamCount}</div>
            <div className="text-xs text-muted-foreground">teams</div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTeamCount(teamCount + 1)}
            disabled={teamCount >= players.length}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-4">Number of Imposters</h3>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setImposterCount(imposterCount - 1)}
            disabled={imposterCount === 0}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <div className="text-center min-w-24">
            <div className="text-2xl font-bold text-primary">{imposterCount}</div>
            <div className="text-xs text-muted-foreground">of {players.length}</div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setImposterCount(imposterCount + 1)}
            disabled={imposterCount >= maxImposters}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
