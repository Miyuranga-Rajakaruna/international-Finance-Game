import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Gavel,
  Trophy,
  ArrowRight,
  Award,
  AlertTriangle,
} from "lucide-react";
import { QUESTIONS, SECRET_WORD, SECRET_WORD_LENGTH, type LevelQuestion } from "@/lib/levels";
import { getStoredPlayer, type StoredPlayer } from "@/lib/player";
import { recordAnswer, finishGame, getAdminLeaderboard, type AdminPlayerRow } from "@/lib/game.service";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Courtroom Investigation Console · Operation 1982" },
      {
        name: "description",
        content:
          "Self-paced Latin American Debt Crisis trial challenge. Solve 4 exhibits and crack the secret word.",
      },
      { property: "og:title", content: "Courtroom Investigation Console · Operation 1982" },
      {
        property: "og:description",
        content: "Solve 4 exhibits and unlock the final verdict in Operation 1982.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Play,
});

type QuestionState = {
  choice: "A" | "B" | "C" | "D" | null;
  isCorrect: boolean | null;
};

function Play() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState<StoredPlayer | null>(null);

  // Active step index: 0, 1, 2, 3 (exhibits), 4 (final lock), 5 (verdict outcome)
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Track answers for all 4 questions
  const [answers, setAnswers] = useState<Record<number, QuestionState>>({
    1: { choice: null, isCorrect: null },
    2: { choice: null, isCorrect: null },
    3: { choice: null, isCorrect: null },
    4: { choice: null, isCorrect: null },
  });

  // Feedback box visibility state (shows for 2 seconds after selecting answer)
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  // State for Hidden Word Page (Step 4)
  const [hiddenWordInput, setHiddenWordInput] = useState("");
  const [submittingVerdict, setSubmittingVerdict] = useState(false);

  // Final Result State (Step 5)
  const [finalResult, setFinalResult] = useState<{
    score: number;
    totalMs: number;
    hiddenWordGuess: string;
    isWin: boolean;
    verdictCategory: "WINNER" | "PARTIAL_MATCH" | "WRONG_WORD" | "DEFEATED";
  } | null>(null);

  // Live classroom standings table for final student view
  const [leaderboardRows, setLeaderboardRows] = useState<AdminPlayerRow[]>([]);

  const loadLeaderboard = useCallback(async () => {
    const rows = await getAdminLeaderboard();
    setLeaderboardRows(rows);
  }, []);

  useEffect(() => {
    const p = getStoredPlayer();
    if (!p) {
      navigate({ to: "/join" });
      return;
    }
    setPlayer(p);

    if (!localStorage.getItem("op1982.startTime")) {
      localStorage.setItem("op1982.startTime", String(Date.now()));
    }
  }, [navigate]);

  useEffect(() => {
    setShowFeedback(false);
  }, [currentStep]);

  // Subscribe to live database updates when student reaches final verdict screen
  useEffect(() => {
    if (currentStep !== 5) return;

    loadLeaderboard();
    const channel = supabase
      .channel("student-verdict-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "answers" }, loadLeaderboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "players" }, loadLeaderboard)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentStep, loadLeaderboard]);

  if (!player) return null;

  const currentQuestion = QUESTIONS[currentStep] as LevelQuestion | undefined;
  const currentAnswerState = answers[currentStep + 1];

  // Letters revealed array for the 9-letter secret word
  const revealedLetters = Array.from({ length: SECRET_WORD_LENGTH }).map((_, idx) => {
    if (idx < 4) {
      const qNum = idx + 1;
      const ans = answers[qNum];
      if (ans && ans.isCorrect) {
        return QUESTIONS[idx]?.revealedLetter || "?";
      }
    }
    return "?";
  });

  // Handle selecting an answer for the current question
  const handleSelectAnswer = async (choice: "A" | "B" | "C" | "D") => {
    if (!currentQuestion) return;
    const qNum = currentQuestion.n;
    if (answers[qNum]?.choice) return; // Answer locked on first click!

    const isCorrect = choice === currentQuestion.correctAnswer;

    setAnswers((prev) => ({
      ...prev,
      [qNum]: { choice, isCorrect },
    }));

    setShowFeedback(true);
    recordAnswer(player.id, qNum, choice, isCorrect);

    // Auto-disappear feedback banner after 1.0 second (1000 ms)
    setTimeout(() => {
      setShowFeedback(false);
    }, 1000);
  };

  // Handle submitting final verdict (Hidden Word guess)
  const handleUnlockVerdict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingVerdict) return;

    setSubmittingVerdict(true);

    const startTime = Number(localStorage.getItem("op1982.startTime") || Date.now());
    const totalMs = Math.max(1000, Date.now() - startTime);

    const correctCount = Object.values(answers).filter((a) => a.isCorrect === true).length;
    const cleanInput = hiddenWordInput.trim().toUpperCase();
    const isHiddenWordCorrect = cleanInput === SECRET_WORD;

    const isWin = correctCount === 4 && isHiddenWordCorrect;

    let verdictCategory: "WINNER" | "PARTIAL_MATCH" | "WRONG_WORD" | "DEFEATED" = "DEFEATED";

    if (correctCount === 4 && isHiddenWordCorrect) {
      verdictCategory = "WINNER";
    } else if (isHiddenWordCorrect && correctCount < 4) {
      verdictCategory = "PARTIAL_MATCH";
    } else if (correctCount === 4 && !isHiddenWordCorrect) {
      verdictCategory = "WRONG_WORD";
    } else {
      verdictCategory = "DEFEATED";
    }

    try {
      await finishGame(player.id, correctCount, totalMs, cleanInput, isWin);
    } catch (err) {
      console.error("Error submitting final verdict:", err);
    } finally {
      setFinalResult({
        score: correctCount,
        totalMs,
        hiddenWordGuess: cleanInput,
        isWin,
        verdictCategory,
      });
      setSubmittingVerdict(false);
      setCurrentStep(5);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      {/* HEADER BAR */}
      <header className="mx-auto flex max-w-4xl items-center justify-between border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary/40 bg-primary/10 text-primary">
            <Gavel className="h-5 w-5" />
          </div>
          <div>
            <p className="label-stencil text-primary">Investigator Counsel</p>
            <h1 className="text-xl font-bold">{player.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="label-stencil text-muted-foreground">Exhibit Progress</p>
            <p className="font-mono text-sm font-semibold text-primary">
              {Math.min(currentStep + 1, 4)} of 4 Exhibits
            </p>
          </div>
        </div>
      </header>

      {/* SECRET WORD LETTER UNLOCK PROGRESS BANNER */}
      <div className="mx-auto mt-6 max-w-4xl border border-border/70 bg-card/40 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <span className="label-stencil text-muted-foreground">Secret Keyword Decryption:</span>
          </div>
          <div className="flex gap-2">
            {revealedLetters.map((char, idx) => {
              const isRevealed = char !== "?";
              return (
                <div
                  key={idx}
                  className={`flex h-9 w-9 items-center justify-center border font-mono text-base font-bold transition-all ${
                    isRevealed
                      ? "border-primary bg-primary/20 text-gold shadow-sm"
                      : idx < 4
                        ? "border-border/60 bg-background/50 text-muted-foreground"
                        : "border-border/30 bg-background/20 text-muted-foreground/40"
                  }`}
                >
                  {char}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN STEP CONTENT AREA */}
      <div className="mx-auto mt-8 max-w-4xl">
        <AnimatePresence mode="wait">
          {/* STEPS 0 to 3: EXHIBIT QUESTIONS 1 TO 4 */}
          {currentStep < 4 && currentQuestion && (
            <motion.div
              key={`question-${currentStep}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="border border-border/70 bg-card/60 p-6 sm:p-10"
              style={{ boxShadow: "var(--shadow-dossier)" }}
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <span className="label-stencil text-primary">{currentQuestion.code}</span>
                <span className="label-stencil text-muted-foreground">
                  {currentQuestion.exhibitTitle}
                </span>
              </div>

              {/* IF NOT YET ANSWERED: SHOW QUESTION & OPTIONS */}
              {!currentAnswerState?.choice ? (
                <div className="mt-6">
                  <p className="border-l-2 border-primary/50 pl-4 font-mono text-xs leading-6 text-muted-foreground italic">
                    Courtroom Evidence Clue: {currentQuestion.clue}
                  </p>
                  <h2 className="mt-6 text-2xl font-bold leading-tight sm:text-3xl">
                    {currentQuestion.question}
                  </h2>

                  <div className="mt-8 space-y-4">
                    {currentQuestion.options.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectAnswer(opt.key)}
                        className="group flex w-full items-center gap-4 rounded-sm border border-border/70 bg-background/50 px-5 py-4 text-left transition-all hover:border-primary hover:bg-primary/10 active:scale-[0.99] cursor-pointer"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-primary/40 font-mono text-sm font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                          {opt.key}
                        </span>
                        <span className="flex-1 text-base font-medium text-foreground">
                          {opt.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* ONCE ANSWERED: SHOW FEEDBACK BANNER FOR 2 SECONDS, THEN SHOW ONLY UNLOCK BUTTON */
                <AnimatePresence mode="wait">
                  {showFeedback ? (
                    <motion.div
                      key="feedback-banner"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.35 }}
                      className="mt-6 py-4"
                    >
                      <div
                        className={`rounded-sm border p-6 sm:p-8 ${
                          currentAnswerState.isCorrect
                            ? "border-success/60 bg-success/10"
                            : "border-destructive/60 bg-destructive/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {currentAnswerState.isCorrect ? (
                            <CheckCircle2 className="h-8 w-8 text-success" />
                          ) : (
                            <XCircle className="h-8 w-8 text-destructive" />
                          )}
                          <div>
                            <h3 className="text-2xl font-bold tracking-tight">
                              {currentAnswerState.isCorrect
                                ? "YOUR ANSWER IS CORRECT!"
                                : "YOUR ANSWER IS INCORRECT!"}
                            </h3>
                            <p className="label-stencil mt-1 text-muted-foreground">
                              Answer Selected: {currentAnswerState.choice}
                            </p>
                          </div>
                        </div>

                        <p className="mt-5 font-mono text-sm leading-7 text-foreground/90">
                          {currentQuestion.explanation}
                        </p>

                        {currentAnswerState.isCorrect ? (
                          <div className="mt-5 inline-flex items-center gap-2 border border-success/40 bg-success/20 px-4 py-2 font-mono text-xs text-success uppercase">
                            <Unlock className="h-4 w-4" /> Letter Unlocked: #{currentQuestion.n} = [
                            {currentQuestion.revealedLetter}]
                          </div>
                        ) : (
                          <div className="mt-5 inline-flex items-center gap-2 border border-destructive/40 bg-destructive/20 px-4 py-2 font-mono text-xs text-destructive uppercase">
                            <Lock className="h-4 w-4" /> Letter #{currentQuestion.n} Remains Locked [?]
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="action-button-only"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="mt-8 flex flex-col items-center justify-center py-10 text-center"
                    >
                      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-6">
                        Exhibit #{currentQuestion.n} Response Recorded · Proceed to Next Exhibit
                      </p>

                      {currentStep < 3 ? (
                        <button
                          onClick={() => setCurrentStep((s) => s + 1)}
                          className="inline-flex items-center justify-center gap-3 rounded-sm bg-primary px-10 py-4 font-mono text-sm font-bold tracking-[0.2em] text-primary-foreground uppercase transition-all hover:opacity-90 active:scale-[0.98] shadow-md cursor-pointer"
                        >
                          UNLOCK NEXT EXHIBIT
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentStep(4)}
                          className="inline-flex items-center justify-center gap-3 rounded-sm bg-[#D4AF37] px-10 py-4 font-mono text-sm font-bold tracking-[0.2em] text-black uppercase transition-all hover:bg-[#F3E5AB] active:scale-[0.98] shadow-xl cursor-pointer"
                          style={{ boxShadow: "0 0 25px rgba(212, 175, 55, 0.6)" }}
                        >
                          <Unlock className="h-5 w-5 text-black" />
                          OPEN THE FINAL LOCK
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          )}

          {/* STEP 4: HIDDEN WORD FILL AREA (OPEN THE FINAL LOCK PAGE) */}
          {currentStep === 4 && (
            <motion.div
              key="step-final-lock"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="border border-border/70 bg-card/70 p-6 sm:p-10 text-center"
              style={{ boxShadow: "var(--shadow-dossier)" }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-primary">
                <Lock className="h-7 w-7" />
              </div>

              <span className="label-stencil mt-4 block text-primary">Final Stage · Trial Verdict</span>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                The Secret Keyword <span className="text-gold">Decryption</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl font-mono text-xs leading-6 text-muted-foreground">
                All 4 courtroom exhibits have been investigated. Enter the secret 9-letter crisis mechanism word below to unlock the official verdict.
              </p>

              {/* REVEALED LETTERS DISPLAY */}
              <div className="mt-8 flex justify-center gap-2">
                {revealedLetters.map((char, idx) => (
                  <div
                    key={idx}
                    className={`flex h-12 w-10 sm:h-14 sm:w-12 items-center justify-center border font-mono text-xl font-black ${
                      char !== "?"
                        ? "border-primary bg-primary/20 text-gold shadow-md"
                        : "border-border/60 bg-background/60 text-muted-foreground/40"
                    }`}
                  >
                    {char}
                  </div>
                ))}
              </div>

              {/* HIDDEN WORD INPUT FORM */}
              <form onSubmit={handleUnlockVerdict} className="mx-auto mt-10 max-w-md">
                <label className="label-stencil block text-left text-muted-foreground" htmlFor="secretword">
                  Type the Hidden Word (9 Letters)
                </label>
                <input
                  id="secretword"
                  value={hiddenWordInput}
                  onChange={(e) => setHiddenWordInput(e.target.value)}
                  placeholder="ENTER 9-LETTER WORD"
                  maxLength={9}
                  required
                  autoFocus
                  className="mt-3 w-full border-b-2 border-primary bg-transparent pb-3 font-mono text-2xl font-bold tracking-[0.3em] text-center uppercase outline-none focus:border-gold"
                />

                <button
                  type="submit"
                  disabled={hiddenWordInput.trim().length < 3 || submittingVerdict}
                  className="mt-8 flex w-full items-center justify-center gap-3 rounded-sm bg-[#D4AF37] py-4 font-mono text-sm font-bold tracking-[0.25em] text-black uppercase transition-all hover:bg-[#F3E5AB] active:scale-[0.98] disabled:opacity-40 cursor-pointer shadow-lg"
                  style={{ boxShadow: "0 0 25px rgba(212, 175, 55, 0.5)" }}
                >
                  <Gavel className="h-5 w-5 text-black" />
                  UNLOCK VERDICT
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 5: FINAL VERDICT RESULTS SCREEN */}
          {currentStep === 5 && finalResult && (
            <motion.div
              key="step-verdict-result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border/70 bg-card/80 p-6 sm:p-12 text-center"
              style={{ boxShadow: "var(--shadow-dossier)" }}
            >
              {/* OUTCOME CATEGORY A: VERIFIED WINNER */}
              {finalResult.verdictCategory === "WINNER" && (
                <div className="space-y-6">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-gold/15 text-gold shadow-lg animate-pulse">
                    <Trophy className="h-10 w-10" />
                  </div>
                  
                  <span className="label-stencil text-gold">Official Trial Decision</span>
                  <h2 className="text-4xl font-black text-gold sm:text-5xl">
                    🏆 VERIFIED WINNER!
                  </h2>

                  <div className="mx-auto max-w-xl rounded-sm border border-gold/40 bg-gold/10 p-6 text-center">
                    <p className="font-mono text-base font-semibold leading-7 text-foreground">
                      Congratulations {player.name}! You answered all 04 courtroom questions correctly (4/4) AND unlocked the secret keyword!
                    </p>
                    <p className="mt-3 font-mono text-xs text-muted-foreground">
                      Completion Time: {(finalResult.totalMs / 1000).toFixed(2)} seconds
                    </p>
                  </div>
                </div>
              )}

              {/* OUTCOME CATEGORY B: PARTIAL MATCH */}
              {finalResult.verdictCategory === "PARTIAL_MATCH" && (
                <div className="space-y-6">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-500/15 text-amber-500">
                    <AlertTriangle className="h-10 w-10" />
                  </div>

                  <span className="label-stencil text-amber-400">Trial Verdict Notice</span>
                  <h2 className="text-3xl font-bold text-amber-400 sm:text-4xl">
                    HIDDEN WORD CORRECT — NOT ELIGIBLE TO WIN
                  </h2>

                  <div className="mx-auto max-w-xl rounded-sm border border-amber-500/40 bg-amber-500/10 p-6 text-center">
                    <p className="font-mono text-base leading-7 text-foreground">
                      The hidden word is correct! However, because you missed exhibit question(s) during the courtroom trial (Score: {finalResult.score}/4), you are not eligible for 1st place victory.
                    </p>
                    <p className="mt-3 font-mono text-xs text-muted-foreground">
                      Completion Time: {(finalResult.totalMs / 1000).toFixed(2)}s
                    </p>
                  </div>
                </div>
              )}

              {/* OUTCOME CATEGORY C: WRONG WORD */}
              {finalResult.verdictCategory === "WRONG_WORD" && (
                <div className="space-y-6">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-destructive bg-destructive/15 text-destructive">
                    <XCircle className="h-10 w-10" />
                  </div>

                  <span className="label-stencil text-destructive">Trial Verdict Notice</span>
                  <h2 className="text-3xl font-bold text-destructive sm:text-4xl">
                    SECRET KEYWORD INCORRECT
                  </h2>

                  <div className="mx-auto max-w-xl rounded-sm border border-destructive/40 bg-destructive/10 p-6 text-center">
                    <p className="font-mono text-base leading-7 text-foreground">
                      All 04 courtroom questions were answered correctly (4/4), but you typed an incorrect secret keyword.
                    </p>
                  </div>
                </div>
              )}

              {/* OUTCOME CATEGORY D: DEFEATED */}
              {finalResult.verdictCategory === "DEFEATED" && (
                <div className="space-y-6">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-destructive bg-destructive/15 text-destructive">
                    <Gavel className="h-10 w-10" />
                  </div>

                  <span className="label-stencil text-destructive">Trial Verdict Notice</span>
                  <h2 className="text-3xl font-bold text-destructive sm:text-4xl">
                    VERDICT: CASE DISMISSED
                  </h2>

                  <div className="mx-auto max-w-xl rounded-sm border border-destructive/40 bg-destructive/10 p-6 text-center">
                    <p className="font-mono text-base leading-7 text-foreground">
                      Courtroom evidence rejected (Score: {finalResult.score}/4) and the hidden word typed was incorrect. You did not solve the 1982 Latin American Debt Crisis case.
                    </p>
                  </div>
                </div>
              )}

              {/* LIVE CLASSROOM STANDINGS TABLE (SHOWS ALL STUDENTS ORDERED BY 1ST PLACE TO LAST) */}
              <div className="mt-12 text-left border-t border-border/60 pt-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono text-xs tracking-widest text-gold uppercase flex items-center gap-2">
                    <Trophy className="h-4 w-4" /> Live Classroom Standings (Ranked #1 to Last)
                  </h3>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Auto-updating live
                  </span>
                </div>

                <div className="mt-4 overflow-hidden border border-border/60 bg-card/60 rounded-sm">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-card/80 text-muted-foreground uppercase border-b border-border/60">
                      <tr>
                        <th className="px-4 py-3 text-center">Rank</th>
                        <th className="px-4 py-3 font-sans">Investigator Name</th>
                        <th className="px-4 py-3 text-center">Score (04 Qs)</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Completion Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {leaderboardRows.map((r, i) => {
                        const isMe = r.id === player.id;
                        return (
                          <tr
                            key={r.id}
                            className={`transition-colors ${
                              isMe
                                ? "bg-gold/20 font-bold border-l-4 border-gold"
                                : r.is_win
                                  ? "bg-gold/10"
                                  : undefined
                            }`}
                          >
                            <td className="px-4 py-3 text-center text-gold font-bold">
                              #{i + 1}
                            </td>
                            <td className="px-4 py-3 font-sans font-semibold text-foreground">
                              {r.name} {isMe && <span className="text-gold">(You)</span>}
                            </td>
                            <td className="px-4 py-3 text-center font-bold">
                              {r.score}/4
                            </td>
                            <td className="px-4 py-3 text-center uppercase text-[10px]">
                              {r.is_win ? (
                                <span className="text-gold font-bold">🏆 Winner</span>
                              ) : r.status === "completed" ? (
                                <span className="text-muted-foreground">Completed</span>
                              ) : (
                                <span className="text-amber-400">In Progress</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-bold">
                              {r.total_ms > 0 ? (
                                `${(r.total_ms / 1000).toFixed(2)}s`
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {leaderboardRows.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground uppercase">
                            No recorded standings yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ACTION LINKS */}
              <div className="mt-8 flex justify-center">
                <Link
                  to="/board"
                  className="inline-flex items-center gap-2 rounded-sm border border-primary/50 bg-primary/10 px-8 py-3 font-mono text-xs tracking-[0.2em] text-primary uppercase hover:bg-primary hover:text-primary-foreground"
                >
                  <Award className="h-4 w-4" /> View Full Public Board
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}