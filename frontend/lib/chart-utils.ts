/**
 * Chart utility functions shared between report and analysis pages.
 */

/**
 * Build 5-dimension radar-chart data from an opportunity score (0–100).
 *
 * Dimensions: Demand / Growth / Competition / Saturation / Profit Margin.
 * Higher overall score → higher Demand, Growth, Profit; lower Competition, Saturation.
 *
 * @param score  Opportunity score 0–100
 * @param dimensions  Optional translated dimension names (defaults to English)
 */
export function buildRadarData(
  score: number,
  dimensions?: readonly [string, string, string, string, string],
) {
  const t = score / 100;
  const dims = dimensions ?? [
    "Demand",
    "Growth",
    "Competition",
    "Saturation",
    "Profit",
  ];
  return [
    { dimension: dims[0], value: Math.round(55 + t * 40) },
    { dimension: dims[1], value: Math.round(45 + t * 42) },
    { dimension: dims[2], value: Math.round(65 - t * 20) },
    { dimension: dims[3], value: Math.round(50 - t * 15) },
    { dimension: dims[4], value: Math.round(40 + t * 35) },
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
