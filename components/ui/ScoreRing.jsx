"use client";

import { useState, useEffect } from "react";

// `fluid` makes the ring scale down with its container (viewBox + 100% width,
// capped at `size`) instead of staying a fixed `size`px square, so it can
// never be wider than the card that holds it. Default (false) keeps the
// original fixed-size SVG for every other caller.
export default function ScoreRing({ val, color, color2, size = 90, fluid = false }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => { const t = setTimeout(() => setCurrent(val), 300); return () => clearTimeout(t); }, [val]);
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const offset = circ - (current / 100) * circ;
  return (
    <svg
      width={fluid ? undefined : size}
      height={fluid ? undefined : size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)", ...(fluid ? { width: "100%", height: "auto" } : null) }}
      role="img"
      aria-label={`Score ${val} out of 100`}
    >
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--color-score-ring-track, rgba(255,255,255,0.06))" strokeWidth="7" />
      <defs>
        <linearGradient id={`g${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={`url(#g${color.replace('#','')})`} strokeWidth="7"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}
