import { createClient } from "@/lib/supabase/client"

export interface GameSession {
  id: string
  room_code: string
  status: "waiting" | "in_progress" | "voting" | "results"
  imposter_count: number
  team_count: number
  created_at: string
  started_at: string | null
  ended_at: string | null
}

export interface GamePlayer {
  id: string
  session_id: string
  name: string
  team: number
  is_imposter: boolean
  device_id: string
  created_at: string
}

export interface GameVote {
  id: string
  session_id: string
  voter_id: string
  voted_for_id: string
  created_at: string
}

// Generate a random 6-character room code
export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Create a new game session
export async function createGameSession(imposterCount: number, teamCount: number) {
  const supabase = createClient()
  const roomCode = generateRoomCode()

  const { data, error } = await supabase
    .from("game_sessions")
    .insert({
      room_code: roomCode,
      imposter_count: imposterCount,
      team_count: teamCount,
      status: "waiting",
    })
    .select()
    .single()

  if (error) throw error
  return data as GameSession
}

// Get session by room code
export async function getSessionByCode(roomCode: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("game_sessions").select("*").eq("room_code", roomCode).single()

  if (error) throw error
  return data as GameSession
}

// Add player to session
export async function addPlayerToSession(sessionId: string, playerName: string, deviceId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("game_players")
    .insert({
      session_id: sessionId,
      name: playerName,
      team: 0,
      is_imposter: false,
      device_id: deviceId,
    })
    .select()
    .single()

  if (error) throw error
  return data as GamePlayer
}

// Get all players in a session
export async function getSessionPlayers(sessionId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("game_players").select("*").eq("session_id", sessionId)

  if (error) throw error
  return data as GamePlayer[]
}

// Start the round - randomize teams and imposters
export async function startRound(sessionId: string) {
  const supabase = createClient()

  // Get session and players
  const sessionRes = await supabase.from("game_sessions").select("*").eq("id", sessionId).single()

  const playersRes = await supabase.from("game_players").select("*").eq("session_id", sessionId)

  if (sessionRes.error || playersRes.error) throw new Error("Failed to fetch data")

  const session = sessionRes.data as GameSession
  const players = playersRes.data as GamePlayer[]

  // Assign teams
  const playersWithTeams = players.map((p, idx) => ({
    ...p,
    team: idx % session.team_count,
  }))

  // Select imposters
  const shuffled = shuffleArray([...playersWithTeams])
  const imposterIds = shuffled.slice(0, session.imposter_count).map((p) => p.id)

  // Update players with teams and imposter status
  for (const player of playersWithTeams) {
    const isImposter = imposterIds.includes(player.id)
    await supabase.from("game_players").update({ team: player.team, is_imposter: isImposter }).eq("id", player.id)
  }

  // Update session status
  await supabase
    .from("game_sessions")
    .update({ status: "in_progress", started_at: new Date().toISOString() })
    .eq("id", sessionId)
}

// End round and move to voting
export async function endRound(sessionId: string) {
  const supabase = createClient()

  await supabase.from("game_sessions").update({ status: "voting" }).eq("id", sessionId)
}

// Submit a vote
export async function submitVote(sessionId: string, voterId: string, votedForId: string) {
  const supabase = createClient()

  // Check if vote already exists
  const { data: existing } = await supabase
    .from("game_votes")
    .select("*")
    .eq("session_id", sessionId)
    .eq("voter_id", voterId)
    .single()

  if (existing) {
    // Update existing vote
    await supabase
      .from("game_votes")
      .update({ voted_for_id: votedForId })
      .eq("voter_id", voterId)
      .eq("session_id", sessionId)
  } else {
    // Create new vote
    await supabase.from("game_votes").insert({
      session_id: sessionId,
      voter_id: voterId,
      voted_for_id: votedForId,
    })
  }
}

// Get all votes for a session
export async function getSessionVotes(sessionId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("game_votes").select("*").eq("session_id", sessionId)

  if (error) throw error
  return data as GameVote[]
}

// Show results
export async function showResults(sessionId: string) {
  const supabase = createClient()

  await supabase
    .from("game_sessions")
    .update({ status: "results", ended_at: new Date().toISOString() })
    .eq("id", sessionId)
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
