"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddPlayerForm } from "@/components/add-player-form"
import { PlayerList } from "@/components/player-list"
import { ImposterSettings } from "@/components/imposter-settings"
import { RandomizeButton } from "@/components/randomize-button"
import { GameView } from "@/components/game-view"
import { useGameStore } from "@/lib/store"

export default function Home() {
  const players = useGameStore((state) => state.players)
  const gameStarted = useGameStore((state) => state.gameStarted)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-pretty">🎭 Hidden Imposters</h1>
          <p className="text-lg text-muted-foreground">Randomly assign roles for your party game</p>
        </div>

        {/* Game View */}
        <GameView />

        {/* Setup Section */}
        {players.length === 0 || !gameStarted ? (
          <Card>
            <CardHeader>
              <CardTitle>Add Players</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddPlayerForm />
              {players.length > 0 && (
                <>
                  <PlayerList />
                  <ImposterSettings />
                  <RandomizeButton />
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Setup Another Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">{players.length} players ready</div>
              <ImposterSettings />
              <RandomizeButton />
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        {players.length > 0 && (
          <div className="text-center text-sm text-muted-foreground py-4">
            💡 Tip: Each player reveals their role privately after randomizing
          </div>
        )}
      </div>
    </main>
  )
}
