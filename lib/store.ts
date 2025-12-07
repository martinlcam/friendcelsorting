import { create } from "zustand"

export interface Player {
  id: string
  name: string
  team: number
}

type GamePhase = "setup" | "reveal" | "voting" | "results"

interface GameState {
  players: Player[]
  imposters: string[]
  imposterCount: number
  teamCount: number
  revealedPlayers: Set<string>
  gameStarted: boolean
  gamePhase: GamePhase
  currentRevealingPlayer: string | null
  votes: Map<string, string>
  revealedVotes: boolean

  addPlayer: (name: string) => void
  renamePlayer: (id: string, name: string) => void
  removePlayer: (id: string) => void
  setImposterCount: (n: number) => void
  setTeamCount: (n: number) => void
  randomizeGame: () => void
  setCurrentRevealingPlayer: (playerId: string | null) => void
  markPlayerRevealed: (playerId: string) => void
  addVote: (voterId: string, voteFor: string) => void
  endVoting: () => void
  resetGame: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  players: [],
  imposters: [],
  imposterCount: 1,
  teamCount: 2,
  revealedPlayers: new Set(),
  gameStarted: false,
  gamePhase: "setup",
  currentRevealingPlayer: null,
  votes: new Map(),
  revealedVotes: false,

  addPlayer: (name: string) =>
    set((state) => ({
      players: [...state.players, { id: crypto.randomUUID(), name, team: 0 }],
    })),

  renamePlayer: (id: string, name: string) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === id ? { ...p, name } : p)),
    })),

  removePlayer: (id: string) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
    })),

  setImposterCount: (n: number) =>
    set(() => ({
      imposterCount: Math.max(0, Math.min(n, get().players.length)),
    })),

  setTeamCount: (n: number) =>
    set(() => ({
      teamCount: Math.max(2, Math.min(n, get().players.length)),
    })),

  randomizeGame: () => {
    const { players, imposterCount, teamCount } = get()
    const shuffled = shuffle([...players])

    const playersWithTeams = shuffled.map((p, idx) => ({
      ...p,
      team: idx % teamCount,
    }))

    const newImposters = shuffle(playersWithTeams)
      .slice(0, imposterCount)
      .map((p) => p.id)

    set(() => ({
      players: playersWithTeams,
      imposters: newImposters,
      revealedPlayers: new Set(),
      gameStarted: true,
      gamePhase: "reveal",
      currentRevealingPlayer: playersWithTeams[0].id,
      votes: new Map(),
      revealedVotes: false,
    }))
  },

  setCurrentRevealingPlayer: (playerId: string | null) =>
    set(() => ({
      currentRevealingPlayer: playerId,
    })),

  markPlayerRevealed: (playerId: string) =>
    set((state) => {
      const newRevealed = new Set(state.revealedPlayers)
      newRevealed.add(playerId)

      const unrevealedPlayers = state.players.filter((p) => !newRevealed.has(p.id))

      return {
        revealedPlayers: newRevealed,
        currentRevealingPlayer: unrevealedPlayers.length > 0 ? unrevealedPlayers[0].id : null,
        gamePhase: unrevealedPlayers.length === 0 ? "voting" : "reveal",
      }
    }),

  addVote: (voterId: string, voteFor: string) =>
    set((state) => {
      const newVotes = new Map(state.votes)
      newVotes.set(voterId, voteFor)
      return { votes: newVotes }
    }),

  endVoting: () =>
    set(() => ({
      gamePhase: "results",
      revealedVotes: true,
    })),

  resetGame: () =>
    set(() => ({
      imposters: [],
      revealedPlayers: new Set(),
      gameStarted: false,
      gamePhase: "setup",
      currentRevealingPlayer: null,
      votes: new Map(),
      revealedVotes: false,
    })),
}))

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
