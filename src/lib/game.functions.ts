import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createPlayer, recordAnswer, getAdminLeaderboard, resetAllGameData } from "./game.service";

export const joinGame = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ name: z.string().trim().min(2).max(60) }).parse(data))
  .handler(async ({ data }) => {
    return createPlayer(data.name);
  });

export const submitAnswer = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        playerId: z.string().uuid(),
        level: z.number().int().min(1).max(4),
        choice: z.enum(["A", "B", "C", "D"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const isCorrect = true; // Handled client side
    await recordAnswer(data.playerId, data.level, data.choice, isCorrect);
    return { locked: true, choice: data.choice, isCorrect };
  });

export const getMyProgress = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ playerId: z.string().uuid() }).parse(data))
  .handler(async () => {
    return [];
  });

export const setGameState = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        level: z.number().int().min(0).max(4),
        status: z.enum(["lobby", "open", "closed", "finished"]),
      })
      .parse(data),
  )
  .handler(async () => {
    return { ok: true };
  });

export const getHostBoard = createServerFn({ method: "GET" }).handler(async () => {
  return getAdminLeaderboard();
});

export const resetGameServer = createServerFn({ method: "POST" }).handler(async () => {
  return resetAllGameData();
});