"use client"

import { useState, useEffect } from "react"
import { CreateRoom } from "@/components/create-room"
import { JoinRoom } from "@/components/join-room"
import { Lobby } from "@/components/lobby"
import { RoleReveal } from "@/components/role-reveal"
import { Voting } from "@/components/voting"
import { Results } from "@/components/results"
import { getSessionByCode } from "@/lib/game-service"

type GamePhase = "home" | "lobby" | "reveal" | "voting" | "results"

export default function Home() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("home")
  const [roomCode, setRoomCode] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [deviceId] = useState(() => localStorage.getItem("deviceId") || crypto.randomUUID())

  useEffect(() => {
    localStorage.setItem("deviceId", deviceId)
  }, [deviceId])

  const handleRoomCreated = (code: string) => {
    setRoomCode(code)
    getSessionByCode(code).then((session) => {
      setSessionId(session.id)
      setGamePhase("lobby")
    })
  }

  const handleRoomJoined = (code: string) => {
    setRoomCode(code)
    getSessionByCode(code).then((session) => {
      setSessionId(session.id)
      setGamePhase("lobby")
    })
  }

  const handleGameStarted = () => {
    setGamePhase("reveal")
  }

  const handleRevealComplete = () => {
    setGamePhase("voting")
  }

  const handleResultsReady = () => {
    setGamePhase("results")
  }

  const handlePlayAgain = () => {
    setGamePhase("reveal")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-pretty">🎭 Hidden Imposters</h1>
          <p className="text-lg text-muted-foreground">Multiplayer Party Game</p>
        </div>

        {gamePhase === "home" && (
          <div className="space-y-4">
            <CreateRoom onRoomCreated={handleRoomCreated} />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <JoinRoom onRoomJoined={handleRoomJoined} />
          </div>
        )}

        {gamePhase === "lobby" && <Lobby roomCode={roomCode} sessionId={sessionId} onGameStarted={handleGameStarted} />}

        {gamePhase === "reveal" && (
          <RoleReveal sessionId={sessionId} deviceId={deviceId} onRevealsComplete={handleRevealComplete} />
        )}

        {gamePhase === "voting" && (
          <Voting sessionId={sessionId} deviceId={deviceId} onResultsReady={handleResultsReady} />
        )}

        {gamePhase === "results" && <Results sessionId={sessionId} onPlayAgain={handlePlayAgain} />}
      </div>
    </main>
  )
}
