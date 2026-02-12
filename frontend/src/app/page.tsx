"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

const features = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
        <path d="M3 3v18h18" />
        <path d="m7 16 4-8 4 4 4-8" />
      </svg>
    ),
    title: "Precise CLMM Backtest",
    desc: "Exact sqrt-price IL formula with volume-based fee estimation and hourly time-in-range tracking.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 12 2 2" />
        <path d="M12 2v10h10" />
      </svg>
    ),
    title: "Monte Carlo Risk",
    desc: "2,000+ GBM simulations showing PnL distribution, 95% VaR, and profit probability.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M12 12h.01" />
        <path d="M17 12h.01" />
        <path d="M7 12h.01" />
      </svg>
    ),
    title: "One-Click Execute",
    desc: "Connect your Sui wallet, pick a strategy, and add liquidity via Cetus SDK — mint a Strategy NFT as proof.",
  },
];

const steps = [
  { num: "01", title: "Select Pool", desc: "Choose from top Cetus CLMM pools like SUI/USDC, CETUS/SUI." },
  { num: "02", title: "Simulate", desc: "Backtest narrow, medium, wide ranges with real volatility data." },
  { num: "03", title: "Compare Risk", desc: "View Monte Carlo distribution, VaR, and strategy comparison." },
  { num: "04", title: "Execute", desc: "Add liquidity on-chain and mint a Strategy NFT — all in one flow." },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center px-4 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
      </div>

      {/* Nav */}
      <nav className="w-full max-w-5xl flex items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Cetus LP Copilot" width={64} height={64} className="rounded-lg" />
          <span className="font-bold text-lg">Cetus LP Copilot</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <Link href="/simulate">
            <Button size="sm" variant="outline">
              Launch App
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center max-w-3xl mt-16 md:mt-24">
        <motion.div {...fadeUp(0)}>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Built on Sui &middot; Powered by Cetus CLMM
          </div>
        </motion.div>

        <motion.h1
          {...fadeUp(0.1)}
          className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight"
        >
          See the numbers before you commit liquidity
        </motion.h1>

        <motion.p
          {...fadeUp(0.2)}
          className="text-lg text-muted-foreground mb-8 max-w-xl"
        >
          Backtest concentrated liquidity strategies with precise CLMM math,
          Monte Carlo risk simulation, and one-click execution on Sui.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="flex gap-3">
          <Link href="/simulate">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-8 shadow-lg shadow-emerald-500/20"
            >
              Start Simulation
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Stats */}
      <motion.section
        {...fadeUp(0.4)}
        className="grid grid-cols-3 gap-8 mt-20 max-w-2xl w-full text-center"
      >
        {[
          { val: "2,000+", label: "Monte Carlo Sims" },
          { val: "3", label: "Strategy Ranges" },
          { val: "< 1s", label: "Backtest Speed" },
        ].map((s) => (
          <div key={s.label}>
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              {s.val}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </motion.section>

      {/* Features */}
      <motion.section
        {...fadeUp(0.5)}
        className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-20 max-w-4xl w-full"
      >
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
            className="group rounded-xl border border-border/50 p-6 bg-card/50 backdrop-blur-sm hover:border-emerald-500/30 hover:bg-card/80 transition-all duration-300"
          >
            <div className="mb-3">{f.icon}</div>
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {f.desc}
            </p>
          </motion.div>
        ))}
      </motion.section>

      {/* How it works */}
      <motion.section
        {...fadeUp(0.6)}
        className="mt-24 max-w-3xl w-full"
      >
        <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-emerald-500/30 mb-2">
                {s.num}
              </div>
              <div className="font-semibold text-sm mb-1">{s.title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {s.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        {...fadeUp(0.8)}
        className="mt-24 text-center"
      >
        <div className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-10 max-w-lg mx-auto">
          <h3 className="text-xl font-bold mb-2">Ready to optimize your LP?</h3>
          <p className="text-sm text-muted-foreground mb-6">
            No signup needed. Connect your wallet and start simulating.
          </p>
          <Link href="/simulate">
            <Button className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-8">
              Launch App
            </Button>
          </Link>
        </div>
      </motion.section>

      <footer className="mt-16 pb-8 text-xs text-muted-foreground">
        Built for Vibe Sui Sprint Hackathon 2026 | Cetus Track
      </footer>
    </div>
  );
}
