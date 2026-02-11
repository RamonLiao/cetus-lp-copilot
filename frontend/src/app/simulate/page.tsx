"use client";

import { useState } from "react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StrategyCard } from "@/components/strategy-card";
import { StrategyComparisonChart } from "@/components/strategy-comparison-chart";
import { MonteCarloChart } from "@/components/monte-carlo-chart";
import {
  fetchPools,
  simulate,
  runMonteCarlo,
  type Pool,
  type SimulationResult,
  type MonteCarloResult,
} from "@/lib/api";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SimulatePage() {
  const account = useCurrentAccount();
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPool, setSelectedPool] = useState<string>("");
  const [amountUsd, setAmountUsd] = useState(1000);
  const [holdDays, setHoldDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [mcResult, setMcResult] = useState<MonteCarloResult | null>(null);
  const [poolsLoaded, setPoolsLoaded] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");

  const loadPools = async () => {
    if (poolsLoaded) return;
    try {
      const data = await fetchPools();
      setPools(data);
      setPoolsLoaded(true);
    } catch {
      // Use fallback pools on error
      setPools([
        { id: "sui-usdc", name: "SUI / USDC", token_a: "SUI", token_b: "USDC", fee_rate: 0.0025, tvl: 15000000, daily_volume: 8000000, current_price: 3.45, tick_spacing: 60 },
        { id: "cetus-sui", name: "CETUS / SUI", token_a: "CETUS", token_b: "SUI", fee_rate: 0.0025, tvl: 3000000, daily_volume: 1500000, current_price: 0.045, tick_spacing: 60 },
        { id: "usdt-usdc", name: "USDT / USDC", token_a: "USDT", token_b: "USDC", fee_rate: 0.0001, tvl: 20000000, daily_volume: 12000000, current_price: 1.0, tick_spacing: 1 },
      ]);
      setPoolsLoaded(true);
    }
  };

  const handleSimulate = async () => {
    if (!selectedPool) return;
    setLoading(true);
    setResult(null);
    setMcResult(null);
    try {
      const [simResult, mcData] = await Promise.all([
        simulate(selectedPool, amountUsd, holdDays),
        runMonteCarlo(selectedPool, amountUsd, holdDays, 0.15),
      ]);
      setResult(simResult);
      setMcResult(mcData);
      setSelectedStrategy(simResult.recommended);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const riskColor = {
    LOW: "bg-emerald-500",
    MEDIUM: "bg-yellow-500",
    HIGH: "bg-red-500",
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🐳</span>
          <h1 className="text-xl font-bold">LP Risk Copilot</h1>
        </Link>
        <ConnectButton />
      </div>

      {/* Input Panel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Simulation Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Pool Selector */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Pool
              </label>
              <Select
                onOpenChange={() => loadPools()}
                value={selectedPool}
                onValueChange={setSelectedPool}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a pool" />
                </SelectTrigger>
                <SelectContent>
                  {pools.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({(p.fee_rate * 100).toFixed(2)}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Amount (USD)
              </label>
              <input
                type="number"
                value={amountUsd}
                onChange={(e) => setAmountUsd(Number(e.target.value))}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                min={10}
                max={1000000}
              />
            </div>

            {/* Hold Days */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Hold Period: {holdDays} days
              </label>
              <Slider
                value={[holdDays]}
                onValueChange={([v]) => setHoldDays(v)}
                min={7}
                max={90}
                step={1}
              />
            </div>

            {/* Simulate Button */}
            <Button
              onClick={handleSimulate}
              disabled={!selectedPool || loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {loading ? "Simulating..." : "Simulate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Risk Summary */}
          <div className="flex items-center gap-4 mb-6">
            <Badge className={riskColor[result.risk_score]}>
              Risk: {result.risk_score}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Current Price: ${result.current_price} | 30d Volatility:{" "}
              {(result.volatility_30d * 100).toFixed(1)}%
            </span>
          </div>

          {/* Strategy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Object.entries(result.strategies).map(([name, data]) => (
              <StrategyCard
                key={name}
                name={name}
                data={data}
                timeInRange={result.time_in_range[name]}
                isRecommended={name === result.recommended}
                onClick={() => setSelectedStrategy(name)}
              />
            ))}
          </div>

          <Separator className="my-6" />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <StrategyComparisonChart result={result} />
            {mcResult && <MonteCarloChart data={mcResult} />}
          </div>

          <Separator className="my-6" />

          {/* Execute */}
          {selectedStrategy && (
            <Card>
              <CardHeader>
                <CardTitle>Execute Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Selected: <strong className="text-foreground">{selectedStrategy}</strong> range
                      [{result.strategies[selectedStrategy].range[0]} —{" "}
                      {result.strategies[selectedStrategy].range[1]}]
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expected Net APR:{" "}
                      <span className="text-emerald-400 font-semibold">
                        {result.strategies[selectedStrategy].net}%
                      </span>
                    </p>
                  </div>
                  <Button
                    disabled={!account}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {account
                      ? "Add Liquidity + Mint NFT"
                      : "Connect Wallet First"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
