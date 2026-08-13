export type GameState = {
  current_level: number;
  status: "lobby" | "open" | "closed" | "finished";
  opened_at: string | null;
};

export function useGameState(): GameState {
  return {
    current_level: 4,
    status: "open",
    opened_at: null,
  };
}