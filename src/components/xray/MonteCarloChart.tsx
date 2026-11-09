"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonteCarloResult } from "@/lib/engine/types";
import { formatINR, formatINRCompact } from "@/lib/format";

const tooltipStyle = {
  background: "#F2EEE6",
  border: "1px solid #14130F",
  borderRadius: 0,
  fontFamily: "var(--font-ibm-plex-mono)",
  fontSize: "11px",
  color: "#14130F",
  boxShadow: "none",
};

export default function MonteCarloChart({
  result,
}: {
  result: MonteCarloResult;
}) {
  const data = result.paths.p50.map((_, index) => ({
    month: index,
    year: index / 12,
    p10: result.paths.p10[index],
    p50: result.paths.p50[index],
    p90: result.paths.p90[index],
  }));

  return (
    <div className="h-[280px] w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          tabIndex={-1}
          margin={{ top: 10, right: 24, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            stroke="rgba(20,19,15,0.1)"
            vertical={false}
            strokeDasharray="2 4"
          />
          <XAxis
            dataKey="year"
            type="number"
            domain={[0, result.months / 12]}
            ticks={Array.from(
              { length: Math.min(6, Math.floor(result.months / 12) + 1) },
              (_, index) =>
                Math.round(
                  (index * (result.months / 12)) /
                    Math.max(1, Math.min(5, Math.floor(result.months / 12))),
                ),
            )}
            tickFormatter={(value) => `Yr ${Number(value)}`}
            axisLine={{ stroke: "rgba(20,19,15,0.25)" }}
            tickLine={false}
            tick={{
              fontFamily: "var(--font-ibm-plex-mono)",
              fontSize: 9,
              fill: "#6B675D",
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(value) => formatINRCompact(Number(value))}
            tick={{
              fontFamily: "var(--font-ibm-plex-mono)",
              fontSize: 9,
              fill: "#6B675D",
            }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            itemStyle={{ color: "#14130F" }}
            labelFormatter={(value) => `Year ${Number(value).toFixed(1)}`}
            formatter={(value, name) => [
              formatINR(Number(value)),
              name === "p10" ? "10th percentile" : name === "p90" ? "90th percentile" : "Median",
            ]}
          />
          <ReferenceLine
            y={result.goalAtHorizon}
            stroke="#B43621"
            strokeDasharray="3 4"
            label={{
              value: "Inflation-adjusted goal",
              position: "insideTopLeft",
              fill: "#B43621",
              fontFamily: "var(--font-ibm-plex-mono)",
              fontSize: 9,
            }}
          />
          <Line
            type="monotone"
            dataKey="p90"
            stroke="#8C7A63"
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="p50"
            stroke="#14130F"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="p10"
            stroke="#8C7A63"
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
