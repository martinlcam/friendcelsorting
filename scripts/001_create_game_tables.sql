-- Create game_sessions table
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, in_progress, voting, results
  imposter_count INT NOT NULL DEFAULT 1,
  team_count INT NOT NULL DEFAULT 2
);

-- Create game_players table
CREATE TABLE IF NOT EXISTS public.game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  team INT NOT NULL,
  is_imposter BOOLEAN NOT NULL DEFAULT FALSE,
  device_id TEXT NOT NULL, -- Client-side UUID to identify device
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_votes table
CREATE TABLE IF NOT EXISTS public.game_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.game_players(id) ON DELETE CASCADE,
  voted_for_id UUID NOT NULL REFERENCES public.game_players(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_sessions (anonymous access by room_code)
CREATE POLICY "Allow anyone to read sessions" ON public.game_sessions
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow anyone to insert sessions" ON public.game_sessions
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow anyone to update sessions" ON public.game_sessions
  FOR UPDATE USING (TRUE);

-- RLS Policies for game_players (anyone in a session can read)
CREATE POLICY "Allow anyone to read players" ON public.game_players
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow anyone to insert players" ON public.game_players
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Allow anyone to update players" ON public.game_players
  FOR UPDATE USING (TRUE);

-- RLS Policies for game_votes (anyone can read and insert)
CREATE POLICY "Allow anyone to read votes" ON public.game_votes
  FOR SELECT USING (TRUE);

CREATE POLICY "Allow anyone to insert votes" ON public.game_votes
  FOR INSERT WITH CHECK (TRUE);
