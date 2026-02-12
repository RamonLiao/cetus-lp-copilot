"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonteCarloResult } from "@/lib/api";

interface Props {
  data: MonteCarloResult;
}

export function MonteCarloChart({ data }: Props) {
  const chartData = data.histogram.map((bin) => ({
    midpoint: parseFloat(((bin.bin_start + bin.bin_end) / 2).toFixed(2)),
    count: bin.count,
    bin_start: bin.bin_start,
    bin_end: bin.bin_end,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Monte Carlo Simulation</CardTitle>
        <p className="text-sm text-muted-foreground">
          {data.n_simulations} simulations | Profit Probability:{" "}
          <span className="font-semibold text-emerald-400">
            {(data.profit_probability * 100).toFixed(1)}%
          </span>
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
          <div>
            <p className="text-muted-foreground">Mean PnL</p>
            <p className={`font-semibold ${data.mean_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              ${data.mean_pnl}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Median PnL</p>
            <p className={`font-semibold ${data.median_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              ${data.median_pnl}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">95% VaR</p>
            <p className="font-semibold text-red-400">${data.var_95}</p>
          </div>
          <div>
            <p className="text-muted-foreground">99% VaR</p>
            <p className="font-semibold text-red-400">${data.var_99}</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="midpoint"
              type="number"
              tick={{ fontSize: 10, fill: "#888" }}
              tickFormatter={(v: number) => `$${v}`}
              domain={["dataMin", "dataMax"]}
            />
            <YAxis tick={{ fontSize: 10, fill: "#888" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
              labelStyle={{ color: "#888" }}
              formatter={(value: number) => [value, "Simulations"]}
              labelFormatter={(label: number) => `PnL: $${label}`}
            />
            <ReferenceLine x={0} stroke="#666" strokeDasharray="3 3" />
            <ReferenceLine
              x={data.var_95}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{ value: "95% VaR", fill: "#ef4444", fontSize: 10, position: "top" }}
            />
            <Bar
              dataKey="count"
              fill="#10b981"
              radius={[2, 2, 0, 0]}
              opacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
