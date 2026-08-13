import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Trophy,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Gavel,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminLeaderboard, resetAllGameData, type AdminPlayerRow } from "@/lib/game.service";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console & Leaderboard · Operation 1982" },
      {
        name: "description",
        content:
          "Admin control panel to view all student answers, confirm the 1st place winner, and reset the game for a fresh start.",
      },
      { property: "og:title", content: "Admin Console & Leaderboard · Operation 1982" },
      {
        property: "og:description",
        content: "View live classroom results and reset the 1982 Debt Crisis trial.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [rows, setRows] = useState<AdminPlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminLeaderboard();
      setRows(data);
    } catch (err: any) {
      console.error(err);
      setMsg("Failed to load results from Supabase.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to realtime database changes for live classroom presentation!
    const channel = supabase
      .channel("admin-realtime-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "answers" }, loadData)
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const handleResetGame = async () => {
    const confirmed = window.confirm(
      "ARE YOU SURE YOU WANT TO RESET THE GAME?\n\nThis will permanently delete all student records and answers so you can start a fresh new trial in class.",
    );
    if (!confirmed) return;

    setResetting(true);
    setMsg(null);

    const ok = await resetAllGameData();
    if (ok) {
      setRows([]);
      setMsg("Game successfully reset! All old records have been deleted.");
      setTimeout(() => loadData(), 400);
    } else {
      setMsg("Failed to reset game data. Please run the SQL schema script in Supabase.");
    }
    setResetting(false);
  };

  const winners = rows.filter((r) => r.is_win);
  const topWinner = winners.length > 0 ? winners[0] : null;

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* TOP NAVBAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-gold/40 bg-gold/10 text-gold">
              <Gavel className="h-6 w-6" />
            </div>
            <div>
              <p className="label-stencil text-primary">Courtroom Admin Dashboard</p>
              <h1 className="text-3xl font-bold">
                1982 Debt Crisis <span className="text-gold">Trial Results</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-sm border border-border bg-card/50 px-4 py-2.5 font-mono text-xs tracking-wider uppercase hover:border-primary hover:text-primary transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={handleResetGame}
              disabled={resetting}
              className="inline-flex items-center gap-2 rounded-sm border border-destructive/60 bg-destructive/15 px-5 py-2.5 font-mono text-xs tracking-wider text-destructive uppercase hover:bg-destructive hover:text-destructive-foreground transition-all shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" /> Reset Game
            </button>
          </div>
        </div>

        {msg && (
          <div className="mt-4 border border-primary/40 bg-primary/10 px-4 py-3 font-mono text-xs text-primary">
            {msg}
          </div>
        )}

        {/* 1ST PLACE WINNER HIGHLIGHT BANNER */}
        {topWinner && (
          <section className="mt-8 rounded-sm border-2 border-gold bg-gradient-to-r from-gold/15 via-gold/5 to-transparent p-6 sm:p-8" style={{ boxShadow: "var(--shadow-gold)" }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold bg-gold/20 text-gold shadow-lg animate-bounce">
                  <Trophy className="h-8 w-8" />
                </div>
                <div>
                  <span className="label-stencil text-gold">Current 1st Place Winner</span>
                  <h2 className="text-3xl font-black text-gold">{topWinner.name}</h2>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    Score: 4/4 Correct · Hidden Word: <span className="text-gold font-bold">"{topWinner.hidden_word_guess}"</span> · Time: {(topWinner.total_ms / 1000).toFixed(2)}s
                  </p>
                </div>
              </div>
              <div className="rounded-sm border border-gold/40 bg-card/80 px-6 py-4 text-center">
                <span className="label-stencil text-muted-foreground">Winning Time</span>
                <p className="font-mono text-2xl font-black text-gold">
                  {(topWinner.total_ms / 1000).toFixed(2)}s
                </p>
              </div>
            </div>
          </section>
        )}

        {/* STATS OVERVIEW */}
        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="border border-border/60 bg-card/40 p-5 text-center">
            <span className="label-stencil text-muted-foreground">Total Players</span>
            <p className="mt-2 font-display text-3xl font-bold text-primary">{rows.length}</p>
          </div>
          <div className="border border-border/60 bg-card/40 p-5 text-center">
            <span className="label-stencil text-muted-foreground">Verified Winners</span>
            <p className="mt-2 font-display text-3xl font-bold text-gold">{winners.length}</p>
          </div>
          <div className="border border-border/60 bg-card/40 p-5 text-center">
            <span className="label-stencil text-muted-foreground">4/4 Score Rate</span>
            <p className="mt-2 font-display text-3xl font-bold text-success">
              {rows.filter((r) => r.score === 4).length}
            </p>
          </div>
          <div className="border border-border/60 bg-card/40 p-5 text-center">
            <span className="label-stencil text-muted-foreground">Fastest Record</span>
            <p className="mt-2 font-mono text-2xl font-bold text-primary">
              {topWinner ? `${(topWinner.total_ms / 1000).toFixed(2)}s` : "—"}
            </p>
          </div>
        </section>

        {/* RESULTS TABLE */}
        <section className="mt-10 overflow-hidden border border-border/70 bg-card/60" style={{ boxShadow: "var(--shadow-dossier)" }}>
          <div className="border-b border-border/60 px-6 py-4 flex items-center justify-between">
            <h3 className="font-mono text-xs tracking-widest text-primary uppercase flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Live Classroom Submissions (Ordered by 1st Place Speed)
            </h3>
            <span className="font-mono text-[11px] text-muted-foreground">
              Auto-updating via Supabase Realtime
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-card/80 font-mono text-[10px] tracking-widest text-muted-foreground uppercase border-b border-border/60">
                <tr>
                  <th className="px-4 py-4 text-center">Rank</th>
                  <th className="px-6 py-4">Investigator Name</th>
                  <th className="px-4 py-4 text-center">Score (04 Qs)</th>
                  <th className="px-4 py-4 text-center">Exhibits (Q1-Q4)</th>
                  <th className="px-4 py-4 text-center">Hidden Word Guess</th>
                  <th className="px-6 py-4 text-center">Verdict Outcome</th>
                  <th className="px-6 py-4 text-right">Completion Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono text-xs">
                {rows.map((row, index) => {
                  const is1st = index === 0 && row.is_win;

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors hover:bg-card/90 ${
                        is1st
                          ? "bg-gold/15"
                          : row.is_win
                            ? "bg-success/5"
                            : undefined
                      }`}
                    >
                      {/* RANK */}
                      <td className="px-4 py-4 text-center">
                        {is1st ? (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gold font-bold text-primary-foreground">
                            1
                          </span>
                        ) : (
                          <span className="text-muted-foreground">#{index + 1}</span>
                        )}
                      </td>

                      {/* NAME */}
                      <td className="px-6 py-4 font-sans text-base font-bold text-foreground">
                        {row.name}
                      </td>

                      {/* SCORE */}
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`font-mono text-sm font-bold ${
                            row.score === 4
                              ? "text-success"
                              : row.score >= 2
                                ? "text-amber-400"
                                : "text-destructive"
                          }`}
                        >
                          {row.score} / 4
                        </span>
                      </td>

                      {/* EXHIBIT BREAKDOWN (Q1-Q4) */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center gap-1.5">
                          {[1, 2, 3, 4].map((qNum) => {
                            const ans = row.answers.find((a) => a.question_num === qNum);
                            if (!ans) {
                              return (
                                <span
                                  key={qNum}
                                  title={`Q${qNum}: Unanswered`}
                                  className="h-5 w-5 rounded-xs border border-border/40 bg-background/50 text-[10px] flex items-center justify-center text-muted-foreground"
                                >
                                  -
                                </span>
                              );
                            }
                            return (
                              <span
                                key={qNum}
                                title={`Q${qNum}: Chosen ${ans.choice} (${ans.is_correct ? "Correct" : "Wrong"})`}
                                className={`h-5 w-5 rounded-xs border text-[10px] flex items-center justify-center font-bold ${
                                  ans.is_correct
                                    ? "border-success/60 bg-success/20 text-success"
                                    : "border-destructive/60 bg-destructive/20 text-destructive"
                                }`}
                              >
                                {ans.choice}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* HIDDEN WORD GUESS */}
                      <td className="px-4 py-4 text-center">
                        {row.hidden_word_guess ? (
                          <span
                            className={`px-2 py-1 rounded-xs font-mono font-bold text-xs uppercase ${
                              row.hidden_word_guess.toUpperCase() === "CONTAGION"
                                ? "bg-success/15 text-success border border-success/30"
                                : "bg-destructive/15 text-destructive border border-destructive/30"
                            }`}
                          >
                            {row.hidden_word_guess}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>

                      {/* VERDICT OUTCOME */}
                      <td className="px-6 py-4 text-center">
                        {row.is_win ? (
                          <span className="inline-flex items-center gap-1.5 rounded-sm border border-gold/50 bg-gold/20 px-3 py-1 text-[11px] font-bold text-gold uppercase shadow-xs">
                            <Trophy className="h-3.5 w-3.5" /> Verified Winner
                          </span>
                        ) : row.hidden_word_guess.toUpperCase() === "CONTAGION" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-sm border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-400 uppercase">
                            <AlertTriangle className="h-3.5 w-3.5" /> Word Correct (Score &lt; 4)
                          </span>
                        ) : row.score === 4 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-1 text-[11px] font-medium text-destructive uppercase">
                            <XCircle className="h-3.5 w-3.5" /> Wrong Word
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-1 text-[11px] text-muted-foreground uppercase">
                            Case Dismissed
                          </span>
                        )}
                      </td>

                      {/* COMPLETION TIME */}
                      <td className="px-6 py-4 text-right font-mono font-bold text-foreground">
                        {row.total_ms > 0 ? (
                          <span className="flex items-center justify-end gap-1.5">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {(row.total_ms / 1000).toFixed(2)}s
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-normal">In progress</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      <p className="font-mono text-sm uppercase">No courtroom responses recorded yet.</p>
                      <p className="mt-2 text-xs">
                        Students can open <Link to="/join" className="text-primary underline">/join</Link> on their phones/laptops to participate!
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* FOOTER ACTIONS */}
        <div className="mt-8 flex justify-between items-center font-mono text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            ← Back to Home
          </Link>
          <Link to="/play" className="hover:text-primary transition-colors">
            Open Student Console →
          </Link>
        </div>
      </div>
    </main>
  );
}
