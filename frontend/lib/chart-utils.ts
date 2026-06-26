/**
 * Chart utility functions shared between report and analysis pages.
 */

/**
 * Build 5-dimension radar-chart data from an opportunity score (0–100).
 *
 * Dimensions: Demand / Growth / Competition / Saturation / Profit Margin.
 * Higher overall score → higher Demand, Growth, Profit; lower Competition, Saturation.
 */
export function buildRadarData(score: number) {
  const t = score / 100;
  return [
    { dimension: "Demand", value: Math.round(55 + t * 40) },
    { dimension: "Growth", value: Math.round(45 + t * 42) },
    { dimension: "Competition", value: Math.round(65 - t * 20) },
    { dimension: "Saturation", value: Math.round(50 - t * 15) },
    { dimension: "Profit", value: Math.round(40 + t * 35) },
  ];
}

/** Score → color utility */
export function scoreColor(score: number): string {
  if (score >= 70) return "#16a34a"; // green
  if (score >= 50) return "#eab308"; // yellow
  return "#737373"; // neutral
}

/** Score → background color (lighter) */
export function scoreBgColor(score: number): string {
  if (score >= 70) return "#dcfce7";
  if (score >= 50) return "#fef9c3";
  return "#f5f5f5";
}
