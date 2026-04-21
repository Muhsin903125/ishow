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
      <div className="bg-zinc-950/30 rounded-2xl p-12 border border-zinc-800 border-dashed text-center flex items-center justify-center h-[254px]">
        <div className="space-y-2">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] italic">Insufficient Samples</p>
          <p className="text-zinc-700 text-[9px] font-bold uppercase tracking-widest">Protocol requires 2+ entries for variance analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950/30 rounded-2xl p-4 border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">{label}</p>
        <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest px-2 py-0.5 bg-zinc-900 rounded">{unit}</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: "#71717a", fontWeight: 'bold' }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#71717a", fontWeight: 'bold' }}
            unit={unit}
            width={40}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            formatter={(v: any) => [`${v} ${unit}`, label]}
            contentStyle={{ 
              backgroundColor: "#18181b", 
              borderRadius: "16px", 
              border: "1px solid #27272a", 
              fontSize: "12px",
              color: "#fff",
              fontWeight: 'bold',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
            itemStyle={{ color: color }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={{ r: 4, fill: color, stroke: "#18181b", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: color, stroke: "#fff", strokeWidth: 2 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
