"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CostGapProjection } from "@/lib/engine/types";
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

export default function CostGapChart({
  totals,
}: {
  totals: CostGapProjection[];
}) {
  const data = totals.map((row) => ({
    name: `${row.years} years`,
    withoutGap: row.withoutGap,
    withGap: row.withGap,
  }));

  return (
    <div className="h-[230px] w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          tabIndex={-1}
          margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            stroke="rgba(20,19,15,0.12)"
            vertical={false}
            strokeDasharray="2 4"
          />
          <XAxis
            dataKey="name"
            axisLine={{ stroke: "rgba(20,19,15,0.25)" }}
            tickLine={false}
            tick={{
              fontFamily: "var(--font-ibm-plex-mono)",
              fontSize: 10,
              fill: "#6B675D",
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={50}
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
            cursor={{ fill: "rgba(20,19,15,0.04)" }}
            formatter={(value, name) => [
              formatINR(Number(value)),
              name === "withoutGap" ? "Without gap" : "With gap",
            ]}
          />
          <Bar
            dataKey="withoutGap"
            fill="#14130F"
            maxBarSize={48}
            isAnimationActive={false}
          />
          <Bar
            dataKey="withGap"
            fill="#E5482B"
            maxBarSize={48}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
