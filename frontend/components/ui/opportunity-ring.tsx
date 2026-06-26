"use client";

/**
 * Pure-SVG circular progress ring for displaying a 0–100 Opportunity Score.
 * Zero external chart-library dependency.
 */

interface OpportunityRingProps {
  score: number;        // 0–100
  size?: number;        // default 36
  strokeWidth?: number; // default 3
}

function ringColor(score: number): string {
  if (score >= 70) return "#16a34a";
  if (score >= 50) return "#eab308";
  return "#a3a3a3";
}

function ringBg(score: number): string {
  if (score >= 70) return "#dcfce7";
  if (score >= 50) return "#fef9c3";
  return "#f5f5f5";
}

export default function OpportunityRing({
  score,
  size = 36,
  strokeWidth = 3,
}: OpportunityRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Background circle */}
      <svg width={size} height={size} className="absolute">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill={ringBg(score)}
          stroke="#D5D0C7"
          strokeWidth={strokeWidth}
          className="transition-all duration-500"
        />
      </svg>
      {/* Progress arc */}
      <svg
        width={size}
        height={size}
        className="absolute -rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={ringColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Score text */}
      <span
        className="relative text-[10px] font-bold"
        style={{ color: ringColor(score) }}
      >
        {score}
      </span>
    </div>
  );
}
