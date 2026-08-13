import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Trophy, Clock, ShieldCheck, Gavel } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminLeaderboard, type AdminPlayerRow } from "@/lib/game.service";

export const Route = createFileRoute("/board")({
  head: () => ({
    meta: [
      { title: "Live Courtroom Leaderboard · Operation 1982" },
      {
        name: "description",
        content:
          "Live standings and 1st place leaderboard for the 1982 Latin American Debt Crisis courtroom trial.",
      },
      { property: "og:title", content: "Live Courtroom Leaderboard · Operation 1982" },
      {
        property: "og:description",
        content: "Fastest responders and standings for Operation 1982.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Board,
});

function Board() {
  const [rows, setRows] = useState<AdminPlayerRow[]>([]);

  const loadData = useCallback(async () => {
    const data = await getAdminLeaderboard();
    setRows(data);
  }, []);

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel("board-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "answers" }, loadData)
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const winners = rows.filter((r) => r.is_win);

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div>
            <p className="label-stencil text-primary">Case File 1982 · Public Board</p>
            <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
              Courtroom Trial <span className="text-gold">Standings</span>
            </h1>
          </div>
          <Link
            to="/"
            className="font-mono text-xs text-muted-foreground hover:text-primary uppercase"
          >
            ← Home
          </Link>
        </div>

        {/* VERIFIED WINNERS SECTION */}
        <section className="mt-10">
          <h2 className="label-stencil text-gold flex items-center gap-2">
            <Trophy className="h-4 w-4" /> Verified 1st Place Candidates (Fastest Times)
          </h2>
          <div className="mt-4 space-y-3">
            {winners.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center justify-between border px-6 py-4 ${
                  i === 0
                    ? "border-gold bg-gold/15 text-gold shadow-md"
                    : "border-success/40 bg-success/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-lg font-bold">#{i + 1}</span>
                  <div>
                    <h3 className="font-display text-xl font-bold">{r.name}</h3>
                    <p className="font-mono text-xs opacity-80">
                      Score: 4/4 &bull; Hidden Word: "{r.hidden_word_guess}"
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg font-black">
                    {(r.total_ms / 1000).toFixed(2)}s
                  </span>
                </div>
              </motion.div>
            ))}

            {winners.length === 0 && (
              <div className="border border-border/60 bg-card/40 p-6 text-center font-mono text-xs text-muted-foreground uppercase">
                No verified winners yet. Answer all 4 exhibit questions correctly and crack the secret word to claim 1st place!
              </div>
            )}
          </div>
        </section>

        {/* ALL PARTICIPANTS TABLE */}
        <section className="mt-12">
          <h2 className="label-stencil text-muted-foreground">All Courtroom Submissions</h2>
          <div className="mt-4 overflow-hidden border border-border/60 bg-card/50">
            <div className="divide-y divide-border/60">
              {rows.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-semibold text-base">{s.name}</span>
                    {s.is_win && (
                      <span className="label-stencil text-gold text-[10px]">🏆 Winner</span>
                    )}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    Score: {s.score}/4 &bull; {(s.total_ms / 1000).toFixed(2)}s
                  </div>
                </div>
              ))}

              {rows.length === 0 && (
                <div className="px-5 py-8 font-mono text-xs text-center text-muted-foreground uppercase">
                  Awaiting trial submissions...
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}