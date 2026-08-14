import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Lock, FileText, Gavel, TrendingUp, Coins, ShieldCheck } from "lucide-react";
import heroImage from "@/assets/dossier-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Operation 1982 · The Dollar Trap" },
      {
        name: "description",
        content:
          "A live classroom investigation game on the 1982 Latin American Debt Crisis. Five shocks, fifty investigators, one winner.",
      },
      { property: "og:title", content: "Operation 1982 · The Dollar Trap" },
      {
        property: "og:description",
        content:
          "Five financial shocks. Fifty investigators. One winner. Enter the 1982 debt crisis case file.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const levels = [
  { n: "01", title: "Level 01", icon: Coins },
  { n: "02", title: "Level 02", icon: TrendingUp },
  { n: "03", title: "Level 03", icon: Gavel },
  { n: "04", title: "Level 04", icon: FileText },
  { n: "05", title: "Level 05", icon: ShieldCheck },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
});

function Index() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative isolate">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 filter grayscale contrast-125"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-24 pb-20 text-center sm:pt-32">
          <motion.div
            {...fade(0)}
            className="label-stencil text-muted-foreground tracking-[0.3em] uppercase"
          >
            — Case File · 1982 —
          </motion.div>

          <motion.h1
            {...fade(0.1)}
            className="mt-8 text-6xl leading-[0.95] font-black tracking-tight sm:text-8xl"
          >
            <span className="text-gold">THE DOLLAR TRAP</span>
          </motion.h1>

          <motion.p {...fade(0.2)} className="label-stencil mt-6 text-muted-foreground">
            Operation 1982 — The Latin American Debt Crisis Challenge
          </motion.p>

          <motion.p
            {...fade(0.3)}
            className="mt-10 max-w-xl font-mono text-sm leading-7 text-foreground/80"
          >
            One financial system.
            <br />
            Five shocks.
            <br />
            Fifty investigators.
            <br />
            <span className="text-primary">One winner.</span>
          </motion.p>

          <motion.div {...fade(0.45)} className="mt-12 flex flex-col items-center gap-4">
            <Link
              to="/join"
              className="group relative inline-flex items-center gap-3 rounded-sm border border-primary/40 bg-primary/10 px-10 py-4 font-mono text-sm tracking-[0.3em] text-primary uppercase transition-all hover:bg-primary hover:text-primary-foreground"
              style={{ boxShadow: "var(--shadow-gold)" }}
            >
              <Lock className="h-4 w-4" />
              Enter the Case
            </Link>
            <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
              One answer per level · Locked on first click
            </p>
          </motion.div>
        </div>

        <div className="absolute right-6 bottom-6 hidden rotate-[-8deg] border-2 border-destructive/70 px-4 py-2 font-mono text-xs tracking-[0.3em] text-destructive/80 uppercase sm:block">
          Confidential
        </div>
      </section>

      {/* DOSSIER STRIP */}
      <section className="border-y border-border/60 bg-card/40 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-border/60 sm:grid-cols-4">
          {[
            ["5", "Crisis Levels"],
            ["1", "Answer per Level"],
            ["Fastest", "Shown Live"],
            ["4/4", "To Qualify"],
          ].map(([v, l]) => (
            <div key={l} className="px-4 py-8 text-center">
              <div className="font-display text-3xl font-bold text-primary">{v}</div>
              <div className="label-stencil mt-2 text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LEVELS / SHOCKS LIST */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="flex items-end justify-between gap-6 border-b border-border/60 pb-4">
          <h2 className="text-3xl font-bold sm:text-4xl">The Five Shocks</h2>
          <span className="label-stencil hidden text-muted-foreground sm:block">
            Self-paced investigation docket
          </span>
        </div>

        <div className="mt-8 space-y-3">
          {levels.map((lv, i) => (
            <motion.div
              key={lv.n}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group flex items-center gap-6 border border-border/60 bg-card/50 px-6 py-6 transition-colors hover:border-primary/50 hover:bg-card"
            >
              <span className="font-mono text-sm text-primary/70">{lv.n}</span>
              <lv.icon className="h-5 w-5 text-accent" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{lv.title}</h3>
              </div>
              <Lock className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="border-t border-border/60 px-6 py-24 text-center">
        <h2 className="text-4xl font-bold sm:text-5xl">
          The investigation <span className="text-gold">begins now.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg font-mono text-xs leading-6 text-muted-foreground">
          Enter your real name to be recorded in the case ledger. Every second counts.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/join"
            className="group inline-flex items-center gap-3 rounded-sm bg-primary px-10 py-4 font-mono text-sm tracking-[0.3em] text-primary-foreground uppercase transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ boxShadow: "var(--shadow-gold)" }}
          >
            <Lock className="h-4 w-4" />
            Join the Case
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/60 bg-card/20 px-6 py-8 text-center">
        <p className="font-mono text-[11px] tracking-widest text-muted-foreground/60 uppercase">
          Operation 1982 · International Finance Courtroom Drama Challenge
        </p>
      </footer>
    </main>
  );
}
