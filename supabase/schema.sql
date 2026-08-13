-- Complete Supabase Schema & RLS Disable for Operation 1982 Courtroom Drama
-- Run this script in Supabase SQL Editor (SQL Editor -> New Query -> Run)

-- 1. Drop existing tables to start clean
DROP TABLE IF EXISTS public.answers CASCADE;
DROP TABLE IF EXISTS public.players CASCADE;
DROP TABLE IF EXISTS public.game_state CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- 2. Create players table
CREATE TABLE public.players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  score int NOT NULL DEFAULT 0,
  total_ms bigint NOT NULL DEFAULT 0,
  hidden_word_guess text DEFAULT '',
  is_win boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'in_progress',
  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

-- 3. Create answers table
CREATE TABLE public.answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  question_num int NOT NULL CHECK (question_num BETWEEN 1 AND 4),
  choice text NOT NULL CHECK (choice IN ('A', 'B', 'C', 'D')),
  is_correct boolean NOT NULL,
  answered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (player_id, question_num)
);

-- 4. Disable Row Level Security (RLS) so anonymous students can freely register, update, and reset
ALTER TABLE public.players DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers DISABLE ROW LEVEL SECURITY;

-- 5. Grant permissions to anon, authenticated, and service_role
GRANT ALL ON public.players TO anon, authenticated, service_role;
GRANT ALL ON public.answers TO anon, authenticated, service_role;

-- 6. Create reset_game stored function for 1-click admin reset
CREATE OR REPLACE FUNCTION reset_game() RETURNS void AS $$
BEGIN
  DELETE FROM public.answers;
  DELETE FROM public.players;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION reset_game() TO anon, authenticated, service_role;

-- 7. Enable realtime publications for live admin & board updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.answers;

-- 8. Refresh API schema cache
NOTIFY pgrst, 'reload schema';
