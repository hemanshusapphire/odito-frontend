"use client";

import { memo, useMemo, useRef, useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// ── Custom tooltip ────────────────────────────────────────────────────────────

const ChartTooltip = memo(({ active, payload, unit }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point || point.value == null) return null;

  return (
    <div style={{
      background: "var(--color-bg-elevated, #06101d)",
      border: "1px solid var(--color-border-default)",
      borderRadius: 8,
      padding: "7px 11px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
      pointerEvents: "none",
    }}>
      <div style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        color: "var(--color-text-tertiary)",
        marginBottom: 3,
      }}>
        {point.label}
      </div>
      <div style={{
        fontFamily: "var(--font-metric)",
        fontVariantNumeric: "tabular-nums",
        fontWeight: 700,
        fontSize: 15,
        color: "var(--color-text-primary)",
      }}>
        {point.value}{unit ? ` ${unit}` : ""}
      </div>
    </div>
  );
});
ChartTooltip.displayName = "ChartTooltip";

// ── Base chart ────────────────────────────────────────────────────────────────

/**
 * TrendChart — reusable responsive area chart.
 *
 * @param data       - Array of { label: string, value: number|null }
 * @param colorHex   - Hex color for line + gradient (e.g. '#a855f7')
 * @param unit       - Value unit shown in tooltip (e.g. 'pts')
 * @param gradientId - Unique SVG gradient ID (must be unique per page)
 * @param height     - Chart height in px
 * @param isScore    - true = 0–100 domain; false = dynamic (issue counts)
 */
function TrendChart({ data, colorHex, unit = "", gradientId, height = 130, isScore = true }) {
  // Animate line draw only once on first mount — never on re-renders
  const hasAnimated = useRef(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!hasAnimated.current && data.length > 0) {
      hasAnimated.current = true;
      const t = setTimeout(() => setAnimate(true), 100);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const yDomain = useMemo(() => {
    const values = data.map((d) => d.value).filter((v) => v != null);
    if (!values.length) return isScore ? [0, 100] : [0, "auto"];
    if (isScore) {
      return [
        Math.max(0, Math.floor(Math.min(...values) - 4)),
        Math.min(100, Math.ceil(Math.max(...values) + 4)),
      ];
    }
    return [
      Math.max(0, Math.floor(Math.min(...values) * 0.85)),
      Math.ceil(Math.max(...values) * 1.12),
    ];
  }, [data, isScore]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: -22 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={colorHex} stopOpacity={0.22} />
            <stop offset="95%" stopColor={colorHex} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.05)"
          vertical={false}
        />

        <XAxis
          dataKey="label"
          tick={{ fontSize: 9, fill: "var(--color-text-tertiary)", fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />

        <YAxis
          domain={yDomain}
          tick={{ fontSize: 9, fill: "var(--color-text-tertiary)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={28}
        />

        <Tooltip
          content={<ChartTooltip unit={unit} />}
          cursor={{
            stroke: colorHex,
            strokeWidth: 1,
            strokeOpacity: 0.35,
            strokeDasharray: "3 3",
          }}
        />

        <Area
          type="monotone"
          dataKey="value"
          stroke={colorHex}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={{ fill: colorHex, strokeWidth: 0, r: 2.5 }}
          activeDot={{ fill: colorHex, r: 4, strokeWidth: 2, stroke: "rgba(0,0,0,0.8)" }}
          connectNulls={false}
          isAnimationActive={animate}
          animationDuration={700}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default memo(TrendChart);
