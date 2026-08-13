import { supabase } from "@/integrations/supabase/client";

export type DbPlayer = {
  id: string;
  name: string;
  score: number;
  total_ms: number;
  hidden_word_guess: string;
  is_win: boolean;
  status: string;
  created_at: string;
  finished_at?: string | null;
};

export type DbAnswer = {
  id: string;
  player_id: string;
  question_num: number;
  choice: string;
  is_correct: boolean;
  answered_at: string;
};

export type AdminPlayerRow = DbPlayer & {
  answers: DbAnswer[];
};

/**
 * Register a new investigator in Supabase
 */
export async function createPlayer(name: string): Promise<DbPlayer> {
  const cleanName = name.trim();
  try {
    const { data, error } = await supabase
      .from("players")
      .insert({ name: cleanName })
      .select("*")
      .single();

    if (error) {
      console.warn("Supabase insert warning:", error.message);
      return {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `player-${Date.now()}`,
        name: cleanName,
        score: 0,
        total_ms: 0,
        hidden_word_guess: "",
        is_win: false,
        status: "in_progress",
        created_at: new Date().toISOString(),
      };
    }

    return data as DbPlayer;
  } catch (err) {
    console.error("Error in createPlayer:", err);
    return {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `player-${Date.now()}`,
      name: cleanName,
      score: 0,
      total_ms: 0,
      hidden_word_guess: "",
      is_win: false,
      status: "in_progress",
      created_at: new Date().toISOString(),
    };
  }
}

/**
 * Record an answer for a specific question
 */
export async function recordAnswer(
  playerId: string,
  questionNum: number,
  choice: "A" | "B" | "C" | "D",
  isCorrect: boolean,
): Promise<void> {
  try {
    const { error } = await supabase.from("answers").insert({
      player_id: playerId,
      question_num: questionNum,
      choice,
      is_correct: isCorrect,
    });

    if (error) {
      console.warn("Supabase recordAnswer warning:", error.message);
    }
  } catch (err) {
    console.error("Failed to record answer:", err);
  }
}

/**
 * Complete the game and record final score, total duration, hidden word guess, and win status
 */
export async function finishGame(
  playerId: string,
  score: number,
  totalMs: number,
  hiddenWordGuess: string,
  isWin: boolean,
): Promise<DbPlayer | null> {
  try {
    const { data, error } = await supabase
      .from("players")
      .update({
        score,
        total_ms: totalMs,
        hidden_word_guess: hiddenWordGuess,
        is_win: isWin,
        status: "completed",
        finished_at: new Date().toISOString(),
      })
      .eq("id", playerId)
      .select("*")
      .single();

    if (error) {
      console.error("Error finishing game in Supabase:", error);
    }

    return data as DbPlayer | null;
  } catch (err) {
    console.error("Failed to finish game in Supabase:", err);
    return null;
  }
}

/**
 * Fetch all results for the Admin dashboard and public Leaderboard
 */
export async function getAdminLeaderboard(): Promise<AdminPlayerRow[]> {
  try {
    const [{ data: players, error: pErr }, { data: answers }] = await Promise.all([
      supabase.from("players").select("*"),
      supabase.from("answers").select("*"),
    ]);

    if (pErr) {
      console.error("Error fetching players:", pErr);
      return [];
    }

    const answersList = (answers as DbAnswer[]) || [];
    const playerList = (players as DbPlayer[]) || [];

    const rows: AdminPlayerRow[] = playerList.map((p) => ({
      ...p,
      score: p.score ?? 0,
      total_ms: p.total_ms ?? 0,
      hidden_word_guess: p.hidden_word_guess ?? "",
      is_win: p.is_win ?? false,
      answers: answersList.filter((a) => a.player_id === p.id),
    }));

    // Sort by:
    // 1. is_win DESC (Verified winners at top)
    // 2. score DESC (Highest score 4/4)
    // 3. total_ms ASC (Fastest completion time = 1st place!)
    return rows.sort((a, b) => {
      if (a.is_win !== b.is_win) return a.is_win ? -1 : 1;
      if (a.score !== b.score) return b.score - a.score;
      if (a.total_ms > 0 && b.total_ms > 0 && a.total_ms !== b.total_ms) {
        return a.total_ms - b.total_ms;
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  } catch (err) {
    console.error("Error in getAdminLeaderboard:", err);
    return [];
  }
}

/**
 * Delete all player records and answers to start a fresh game
 */
export async function resetAllGameData(): Promise<boolean> {
  try {
    // Try RPC procedure first
    const { error: rpcError } = await (supabase as any).rpc("reset_game");
    if (!rpcError) {
      return true;
    }

    // Direct deletion fallback
    const { error: err1 } = await supabase
      .from("answers")
      .delete()
      .gt("answered_at", "1970-01-01T00:00:00Z");

    if (err1) console.warn("Delete answers warning:", err1);

    const { error: err2 } = await supabase
      .from("players")
      .delete()
      .gt("created_at", "1970-01-01T00:00:00Z");

    if (err2) console.warn("Delete players warning:", err2);

    return true;
  } catch (e) {
    console.error("Error resetting game data:", e);
    return false;
  }
}
