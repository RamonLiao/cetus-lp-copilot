"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StrategyData } from "@/lib/api";
import { motion } from "framer-motion";

interface StrategyCardProps {
  name: string;
  data: StrategyData;
  timeInRange: number;
  isRecommended: boolean;
  onClick?: () => void;
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {value.toFixed(1)}{suffix}
    </motion.span>
  );
}

export function StrategyCard({
  name,
  data,
  timeInRange,
  isRecommended,
  onClick,
}: StrategyCardProps) {
  const netPositive = data.net > 0;
  const label = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        className={`cursor-pointer transition-all hover:scale-[1.02] ${
          isRecommended
            ? "border-emerald-500 ring-2 ring-emerald-500/20"
            : "border-border"
        }`}
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{label} Range</CardTitle>
            {isRecommended && (
              <Badge className="bg-emerald-500 text-white">Recommended</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            ${data.range[0].toFixed(2)} — ${data.range[1].toFixed(2)}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Fee APR</p>
              <p className="text-lg font-semibold text-emerald-400">
                <AnimatedNumber value={data.fees} suffix="%" />
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">IL APR</p>
              <p className="text-lg font-semibold text-red-400">
                <AnimatedNumber value={data.il} suffix="%" />
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Net APR</p>
              <p
                className={`text-xl font-bold ${
                  netPositive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                <AnimatedNumber value={data.net} suffix="%" />
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Time in Range</p>
              <p className="text-lg font-semibold">
                <AnimatedNumber value={timeInRange * 100} suffix="%" />
              </p>
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>Fees: ${data.fee_usd}</span>
            <span>IL: -${data.il_usd}</span>
            <span className={netPositive ? "text-emerald-400" : "text-red-400"}>
              Net: ${data.net_usd}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
