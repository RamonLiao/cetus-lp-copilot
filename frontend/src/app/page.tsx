"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl"
      >
        <div className="mb-6">
          <span className="text-5xl">🐳</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Cetus LP Risk Copilot
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          See the numbers before you commit liquidity.
        </p>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Backtest concentrated liquidity strategies with precise CLMM math,
          Monte Carlo risk simulation, and one-click execution on Sui.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/simulate">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
              Start Simulation
            </Button>
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" variant="outline">
              View on GitHub
            </Button>
          </a>
        </div>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl w-full"
      >
        {[
          {
            title: "Precise CLMM Backtest",
            desc: "Exact sqrt-price IL formula with volume-based fee estimation and hourly time-in-range tracking.",
          },
          {
            title: "Monte Carlo Risk",
            desc: "2000+ GBM simulations to show PnL distribution, 95% VaR, and profit probability.",
          },
          {
            title: "One-Click Execute",
            desc: "Connect your Sui wallet, pick a strategy, and add liquidity via PTB — mint a Strategy NFT too.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-border p-6 bg-card"
          >
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </motion.div>

      <footer className="mt-20 pb-8 text-xs text-muted-foreground">
        Built for Vibe Sui Sprint Hackathon 2026 | Cetus Track
      </footer>
    </div>
  );
}
