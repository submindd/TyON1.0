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
import { useTranslations } from "next-intl";
import type { ResearchProduct } from "@/types/report";
import { buildPriceBuckets } from "@/lib/analysis-filters";

interface PriceDistributionProps {
  products: ResearchProduct[];
}

export default function PriceDistribution({ products }: PriceDistributionProps) {
  const t = useTranslations("chart.priceDistribution");
  const buckets = buildPriceBuckets(products, 7);

  if (buckets.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ height: 180, backgroundColor: "#F0EDE7" }}
      >
        <p className="text-xs text-neutral-300">{t("noData")}</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={buckets} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "#a3a3a3" }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={buckets.length > 5 ? -30 : 0}
          textAnchor={buckets.length > 5 ? "end" : "middle"}
          height={30}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#a3a3a3" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={22}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #efefef",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            fontSize: 11,
          }}
        />
        <Bar
          dataKey="count"
          fill="#171717"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
