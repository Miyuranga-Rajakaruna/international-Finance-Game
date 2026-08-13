import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowLeft, Gavel, Loader2 } from "lucide-react";
import { createPlayer } from "@/lib/game.service";
import { getStoredPlayer, storePlayer } from "@/lib/player";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join the Courtroom Trial · Operation 1982" },
      {
        name: "description",
        content:
          "Register your name to enter the 1982 Latin American Debt Crisis courtroom trial investigation.",
      },
      { property: "og:title", content: "Join the Courtroom Trial · Operation 1982" },
      {
        property: "og:description",
        content: "Register as an investigator in the 1982 Latin American debt crisis courtroom drama.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Join,
});

function Join() {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If player is already stored, proceed straight to play
    if (getStoredPlayer()) {
      navigate({ to: "/play" });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (cleanName.length < 2 || busy) return;

    setBusy(true);
    setError(null);

    try {
      const dbPlayer = await createPlayer(cleanName);
      storePlayer({ id: dbPlayer.id, name: dbPlayer.name });
      // Save local start time for precise local timing fallback
      localStorage.setItem("op1982.startTime", String(Date.now()));
      navigate({ to: "/play" });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to register investigator. Please check your database connection.");
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md border border-border/70 bg-card/70 p-10 backdrop-blur"
        style={{ boxShadow: "var(--shadow-dossier)" }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted-foreground uppercase hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Courtroom File
        </Link>

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="flex items-center gap-3">
            <Gavel className="h-6 w-6 text-primary" />
            <span className="label-stencil text-primary">Courtroom Docket</span>
          </div>

          <h1 className="mt-4 text-3xl font-bold">
            Enter your <span className="text-gold">real name</span>
          </h1>
          <p className="mt-3 font-mono text-xs leading-6 tracking-wider text-muted-foreground">
            Your name will be registered in the official 1982 Debt Crisis trial ledger. Fast time & 100% correct answers qualify for 1st Place!
          </p>

          <label className="label-stencil mt-8 block text-muted-foreground" htmlFor="fullname">
            Investigator / Team Member Name
          </label>
          <input
            id="fullname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Counsel Kasun"
            autoComplete="name"
            required
            className="mt-3 w-full border-b border-input bg-transparent pb-3 font-display text-2xl text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-primary"
          />

          <button
            type="submit"
            className="mt-10 flex w-full items-center justify-center gap-2 rounded-sm bg-primary py-4 font-mono text-sm tracking-[0.3em] text-primary-foreground uppercase transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
            disabled={name.trim().length < 2 || busy}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Enter the Trial
          </button>
          
          {error && (
            <p className="mt-4 text-center font-mono text-xs text-destructive">{error}</p>
          )}
        </form>
      </motion.div>
    </main>
  );
}