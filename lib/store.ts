import { create } from "zustand"

export interface Player {
  id: string
  name: string
}

interface GameState {
  players: Player[]
  imposters: string[]
  imposterCount: number
  revealedImposters: Set<string>
  gameStarted: boolean

  addPlayer: (name: string) => void
  renamePlayer: (id: string, name: string) => void
  removePlayer: (id: string) => void
  setImposterCount: (n: number) => void
  randomizeGame: () => void
  revealImposter: (playerId: string) => void
  resetGame: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  players: [],
  imposters: [],
  imposterCount: 1,
  revealedImposters: new Set(),
  gameStarted: false,

  addPlayer: (name: string) =>
    set((state) => ({
      players: [...state.players, { id: crypto.randomUUID(), name }],
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

  randomizeGame: () => {
    const { players, imposterCount } = get()
    const shuffled = shuffle([...players])
    const newImposters = shuffled.slice(0, imposterCount).map((p) => p.id)
    set(() => ({
      imposters: newImposters,
      revealedImposters: new Set(),
      gameStarted: true,
    }))
  },

  revealImposter: (playerId: string) =>
    set((state) => {
      const newRevealed = new Set(state.revealedImposters)
      newRevealed.add(playerId)
      return { revealedImposters: newRevealed }
    }),

  resetGame: () =>
    set(() => ({
      imposters: [],
      revealedImposters: new Set(),
      gameStarted: false,
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
