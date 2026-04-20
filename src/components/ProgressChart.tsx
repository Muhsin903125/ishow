"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Measurement } from "@/lib/db/measurements";

interface ProgressChartProps {
  measurements: Measurement[];
  metric: "weightKg" | "waistCm" | "bodyFatPct";
  label: string;
  unit: string;
  color?: string;
}

export function ProgressChart({
  measurements,
  metric,
  label,
  unit,
  color = "#f97316",
}: ProgressChartProps) {
  const data = measurements
    .map((m) => ({
      date: new Date(m.recordedAt + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: m[metric],
    }))
    .filter((d) => d.value != null);

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        Log at least 2 measurements to see your {label.toLowerCase()} chart.
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            unit={unit}
            width={40}
          />
          <Tooltip
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            formatter={(v: any) => [`${v} ${unit}`, label]}
            contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
