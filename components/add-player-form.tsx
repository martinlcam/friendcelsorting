"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useGameStore } from "@/lib/store"
import { Plus } from "lucide-react"

export function AddPlayerForm() {
  const [name, setName] = useState("")
  const addPlayer = useGameStore((state) => state.addPlayer)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      addPlayer(name.trim())
      setName("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Enter player name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" size="icon" disabled={!name.trim()}>
        <Plus className="w-4 h-4" />
      </Button>
    </form>
  )
}
