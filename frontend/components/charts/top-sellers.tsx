"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ResearchProduct } from "@/types/report";
import { parseSoldCount } from "@/lib/analysis-filters";

interface TopSellersProps {
  products: ResearchProduct[];
}

export default function TopSellers({ products }: TopSellersProps) {
  // Take top 8 by sold count
  const chartData = [...products]
    .sort((a, b) => parseSoldCount(b.sold_count) - parseSoldCount(a.sold_count))
    .slice(0, 8)
    .map((p) => ({
      name:
        (p.title ?? "Untitled").length > 28
          ? (p.title ?? "Untitled").slice(0, 25) + "..."
          : (p.title ?? "Untitled"),
      sold: parseSoldCount(p.sold_count),
    }))
    .filter((d) => d.sold > 0);

  if (chartData.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ height: 180, backgroundColor: "#F0EDE7" }}
      >
        <p className="text-xs text-neutral-300">No sales data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 32)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: "#a3a3a3" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 10, fill: "#737373" }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #efefef",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            fontSize: 11,
          }}
          formatter={(value) => {
            const v = Number(value);
            return [
              v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v),
              "Sold",
            ] as [string, string];
          }}
        />
        <Bar
          dataKey="sold"
          fill="#525252"
          radius={[0, 4, 4, 0]}
          maxBarSize={16}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
