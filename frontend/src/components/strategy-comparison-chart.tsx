"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SimulationResult } from "@/lib/api";

interface Props {
  result: SimulationResult;
}

export function StrategyComparisonChart({ result }: Props) {
  const data = Object.entries(result.strategies).map(([name, s]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    "Fee APR": s.fees,
    "IL APR": -s.il,
    "Net APR": s.net,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Strategy Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" tick={{ fill: "#888" }} />
            <YAxis tick={{ fill: "#888" }} unit="%" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
            />
            <Legend />
            <Bar dataKey="Fee APR" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="IL APR" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Net APR" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
