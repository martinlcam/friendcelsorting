"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useGameStore } from "@/lib/store"
import { Trash2, Edit2, Check, X } from "lucide-react"

export function PlayerList() {
  const players = useGameStore((state) => state.players)
  const renamePlayer = useGameStore((state) => state.renamePlayer)
  const removePlayer = useGameStore((state) => state.removePlayer)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const startEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditName(name)
  }

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      renamePlayer(id, editName.trim())
      setEditingId(null)
    }
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No players yet. Add your first player above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {players.map((player) => (
        <div key={player.id} className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
          {editingId === player.id ? (
            <>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1" autoFocus />
              <Button size="sm" variant="ghost" onClick={() => saveEdit(player.id)}>
                <Check className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <span className="flex-1 font-medium">{player.name}</span>
              <Button size="sm" variant="ghost" onClick={() => startEdit(player.id, player.name)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => removePlayer(player.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
