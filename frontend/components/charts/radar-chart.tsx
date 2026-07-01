"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { buildRadarData } from "@/lib/chart-utils";

interface OpportunityRadarProps {
  score: number;
  height?: number;
  /** Translated dimension names [Demand, Growth, Competition, Saturation, Profit] */
  dimensions?: readonly [string, string, string, string, string];
}

export default function OpportunityRadar({
  score,
  height = 200,
  dimensions,
}: OpportunityRadarProps) {
  const data = buildRadarData(score, dimensions);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <PolarGrid stroke="#D5D0C7" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fontSize: 10, fill: "#737373" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={false}
          axisLine={false}
        />
        <Radar
          name="Opportunity"
          dataKey="value"
          stroke="#16a34a"
          strokeWidth={1.5}
          fill="#16a34a"
          fillOpacity={0.12}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
