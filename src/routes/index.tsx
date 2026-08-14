import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Lock, FileText, Gavel, TrendingUp, Coins, ShieldCheck, Unlock } from "lucide-react";
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
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
});

function Index() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative isolate">
        {/* Animated background image with slow breathe zoom effect */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-25 filter grayscale contrast-125"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-24 pb-20 text-center sm:pt-32">
          {/* Top header tag */}
          <motion.div
            {...fade(0)}
            className="label-stencil text-muted-foreground tracking-[0.35em] uppercase"
          >
            — Case File · 1982 —
          </motion.div>

          {/* Hero title with subtle gold shimmer */}
          <motion.h1
            {...fade(0.12)}
            className="mt-8 text-6xl leading-[0.95] font-black tracking-tight sm:text-8xl"
          >
            <span className="text-gold bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] bg-clip-text text-transparent animate-pulse">
              THE DOLLAR TRAP
            </span>
          </motion.h1>

          <motion.p {...fade(0.22)} className="label-stencil mt-6 text-muted-foreground tracking-widest">
            Operation 1982 — The Latin American Debt Crisis Challenge
          </motion.p>

          <motion.p
            {...fade(0.32)}
            className="mt-10 max-w-xl font-mono text-sm leading-7 text-foreground/80"
          >
            One financial system.
            <br />
            Five shocks.
            <br />
            Fifty investigators.
            <br />
            <span className="text-primary font-bold">One winner.</span>
          </motion.p>

          {/* Hero CTA Button with pulsing gold glow */}
          <motion.div {...fade(0.45)} className="mt-12 flex flex-col items-center gap-4">
            <Link to="/join">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                animate={{
                  boxShadow: [
                    "0 0 15px rgba(212,175,55,0.3)",
                    "0 0 35px rgba(212,175,55,0.75)",
                    "0 0 15px rgba(212,175,55,0.3)",
                  ],
                }}
                transition={{
                  boxShadow: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 0.2 },
                }}
                className="group relative inline-flex items-center gap-3 rounded-sm border border-primary/60 bg-primary/20 px-10 py-4 font-mono text-sm font-bold tracking-[0.3em] text-primary uppercase cursor-pointer backdrop-blur hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Lock className="h-4 w-4 transition-transform group-hover:rotate-12" />
                Enter the Case
              </motion.div>
            </Link>

            <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
              One answer per level · Locked on first click
            </p>
          </motion.div>
        </div>

        {/* Confidential Stamp with spring entrance animation */}
        <motion.div
          initial={{ scale: 2.2, opacity: 0, rotate: -25 }}
          animate={{ scale: 1, opacity: 1, rotate: -8 }}
          transition={{ duration: 0.7, delay: 0.6, type: "spring", stiffness: 120 }}
          className="absolute right-8 bottom-8 hidden border-2 border-destructive/70 px-5 py-2 font-mono text-xs font-bold tracking-[0.3em] text-destructive/90 uppercase sm:block shadow-lg"
        >
          Confidential
        </motion.div>
      </section>

      {/* DOSSIER STRIP WITH HOVER MOTION */}
      <section className="border-y border-border/60 bg-card/40 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-border/60 sm:grid-cols-4">
          {[
            ["5", "Crisis Levels"],
            ["1", "Answer per Level"],
            ["Fastest", "Shown Live"],
            ["4/4", "To Qualify"],
          ].map(([v, l], idx) => (
            <motion.div
              key={l}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -4, backgroundColor: "rgba(212, 175, 55, 0.05)" }}
              className="px-4 py-8 text-center transition-colors"
            >
              <div className="font-display text-3xl font-bold text-primary">{v}</div>
              <div className="label-stencil mt-2 text-muted-foreground">{l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* LEVELS / SHOCKS LIST WITH DYNAMIC SLIDE & GLOW */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="flex items-end justify-between gap-6 border-b border-border/60 pb-4">
          <h2 className="text-3xl font-bold sm:text-4xl">The Five Shocks</h2>
          <span className="label-stencil hidden text-muted-foreground sm:block">
            Self-paced investigation docket
          </span>
        </div>

        <div className="mt-8 space-y-3.5">
          {levels.map((lv, i) => (
            <motion.div
              key={lv.n}
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{
                x: 10,
                borderColor: "rgba(212, 175, 55, 0.7)",
                backgroundColor: "rgba(212, 175, 55, 0.06)",
              }}
              className="group flex items-center gap-6 border border-border/60 bg-card/50 px-6 py-6 transition-all rounded-sm cursor-pointer shadow-sm"
            >
              <span className="font-mono text-sm font-bold text-primary/80 group-hover:text-gold transition-colors">
                {lv.n}
              </span>
              <motion.div whileHover={{ rotate: 15, scale: 1.2 }}>
                <lv.icon className="h-6 w-6 text-accent group-hover:text-gold transition-colors" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-xl font-bold group-hover:text-gold transition-colors">
                  {lv.title}
                </h3>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 text-muted-foreground group-hover:opacity-0 transition-opacity" />
                <Unlock className="h-4 w-4 text-gold absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA SECTION WITH PULSING BUTTON */}
      <section className="border-t border-border/60 px-6 py-24 text-center">
        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold sm:text-5xl"
        >
          The investigation <span className="text-gold">begins now.</span>
        </motion.h2>
        <p className="mx-auto mt-4 max-w-lg font-mono text-xs leading-6 text-muted-foreground">
          Enter your real name to be recorded in the case ledger. Every second counts.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/join">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              animate={{
                boxShadow: [
                  "0 0 15px rgba(212,175,55,0.4)",
                  "0 0 35px rgba(212,175,55,0.85)",
                  "0 0 15px rgba(212,175,55,0.4)",
                ],
              }}
              transition={{
                boxShadow: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.2 },
              }}
              className="group inline-flex items-center gap-3 rounded-sm bg-[#D4AF37] px-10 py-4 font-mono text-sm font-bold tracking-[0.3em] text-black uppercase cursor-pointer hover:bg-[#F3E5AB] transition-colors"
            >
              <Lock className="h-4 w-4 text-black group-hover:rotate-12 transition-transform" />
              Join the Case
            </motion.div>
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
