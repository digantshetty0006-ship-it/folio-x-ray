"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { AllocationSlice } from "@/lib/engine/types";
import { formatINR } from "@/lib/format";

const categoryColours: Record<string, string> = {
  equity: "#14130F",
  debt: "#E5482B",
  hybrid: "#8C7A63",
  "gold-and-other": "#C9BFAE",
};

const fundColours = ["#14130F", "#E5482B", "#8C7A63", "#B9AD99", "#6B675D"];

const tooltipStyle = {
  background: "#F2EEE6",
  border: "1px solid #14130F",
  borderRadius: 0,
  fontFamily: "var(--font-ibm-plex-mono)",
  fontSize: "11px",
  color: "#14130F",
  boxShadow: "none",
};

function Donut({
  data,
  colours,
  label,
}: {
  data: AllocationSlice[];
  colours: Record<string, string> | string[];
  label: string;
}) {
  return (
    <div>
      <p className="label-sm mb-2 text-muted">{label}</p>
      <div className="h-[190px] w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart tabIndex={-1}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="55%"
              outerRadius="86%"
              paddingAngle={1}
              stroke="#F2EEE6"
              strokeWidth={2}
              isAnimationActive={false}
              rootTabIndex={-1}
            >
              {data.map((slice) => (
                <Cell
                  key={slice.key}
                  fill={
                    Array.isArray(colours)
                      ? colours[data.indexOf(slice) % colours.length]
                      : colours[slice.key] ?? "#C9BFAE"
                  }
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: "#14130F" }}
              formatter={(value) => formatINR(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 space-y-1.5 print:mt-1 print:space-y-1">
        {data.map((slice, index) => (
          <li
            key={slice.key}
            className="flex items-start justify-between gap-3 text-xs leading-snug"
          >
            <span className="flex min-w-0 items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-1 size-2.5 shrink-0"
                style={{
                  background: Array.isArray(colours)
                    ? colours[index % colours.length]
                    : colours[slice.key] ?? "#C9BFAE",
                }}
              />
              <span className="truncate">{slice.label}</span>
            </span>
            <span className="tabular shrink-0 text-muted">
              {slice.pct.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AllocationChart({
  byCategory,
  byFund,
}: {
  byCategory: AllocationSlice[];
  byFund: AllocationSlice[];
}) {
  const topFunds = byFund.slice(0, 5);
  const otherValue = byFund.slice(5).reduce((sum, slice) => sum + slice.value, 0);
  const fundData =
    otherValue > 0
      ? [
          ...topFunds,
          {
            key: "other-funds",
            label: "Other funds",
            value: otherValue,
            pct: Math.max(
              0,
              100 - topFunds.reduce((sum, slice) => sum + slice.pct, 0),
            ),
          },
        ]
      : topFunds;

  return (
    <div className="grid gap-7 print:gap-4 sm:grid-cols-2">
      <Donut data={byCategory} colours={categoryColours} label="By category" />
      <Donut data={fundData} colours={fundColours} label="By fund" />
    </div>
  );
}
