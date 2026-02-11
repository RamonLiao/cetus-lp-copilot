const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Pool {
  id: string;
  name: string;
  token_a: string;
  token_b: string;
  fee_rate: number;
  tvl: number;
  daily_volume: number;
  current_price: number;
  tick_spacing: number;
}

export interface StrategyData {
  range: [number, number];
  apr: number;
  fees: number;
  il: number;
  net: number;
  fee_usd: number;
  il_usd: number;
  net_usd: number;
}

export interface SimulationResult {
  strategies: Record<string, StrategyData>;
  recommended: string;
  risk_score: "LOW" | "MEDIUM" | "HIGH";
  time_in_range: Record<string, number>;
  current_price: number;
  volatility_30d: number;
  hold_days: number;
}

export interface MonteCarloResult {
  mean_pnl: number;
  median_pnl: number;
  std_pnl: number;
  var_95: number;
  var_99: number;
  profit_probability: number;
  n_simulations: number;
  histogram: { bin_start: number; bin_end: number; count: number }[];
  range: [number, number];
}

export async function fetchPools(): Promise<Pool[]> {
  const res = await fetch(`${API_BASE}/api/pools`);
  const data = await res.json();
  return data.pools;
}

export async function simulate(
  pool_id: string,
  amount_usd: number,
  hold_days: number
): Promise<SimulationResult> {
  const res = await fetch(`${API_BASE}/api/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pool_id, amount_usd, hold_days }),
  });
  return res.json();
}

export async function runMonteCarlo(
  pool_id: string,
  amount_usd: number,
  hold_days: number,
  range_pct: number
): Promise<MonteCarloResult> {
  const res = await fetch(`${API_BASE}/api/monte-carlo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pool_id, amount_usd, hold_days, range_pct }),
  });
  return res.json();
}

export async function fetchPoolHistory(
  pool_id: string,
  days: number = 30
): Promise<{ index: number; price: number }[]> {
  const res = await fetch(
    `${API_BASE}/api/pool/${pool_id}/history?days=${days}`
  );
  const data = await res.json();
  return data.prices;
}
