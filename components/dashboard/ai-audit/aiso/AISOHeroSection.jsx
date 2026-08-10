"use client"

import { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react"

const RING_R    = 88
const RING_CIRC = 2 * Math.PI * RING_R // ≈ 552.9

function scoreToColor(score) {
  if (score >= 70) return "var(--color-status-success)"
  if (score >= 40) return "var(--color-status-warning)"
  return "var(--color-status-error)"
}

function scoreToSurface(score) {
  if (score >= 70) return "var(--color-status-success-surface)"
  if (score >= 40) return "var(--color-status-warning-surface)"
  return "var(--color-status-error-surface)"
}

// Static sparkline paths per card — purely decorative trend lines
const SPARKLINE_PATHS = {
  crawlability: "M0 25 Q10 20, 20 22 T40 10 T60 15 T80 5",
  citability:   "M0 15 Q10 18, 20 12 T40 22 T60 18 T80 20",
  authority:    "M0 5 Q10 8, 20 15 T40 25 T60 28 T80 30",
  coverage:     "M0 28 Q10 25, 20 18 T40 12 T60 10 T80 8",
}

function HubMetricCard({ id, label, score, delta }) {
  const accentColor  = scoreToColor(score)
  const surfaceColor = scoreToSurface(score)
  const sparkPath    = SPARKLINE_PATHS[id]
  const deltaLabel   = delta != null ? (delta > 0 ? `+${delta}pts` : `${delta}pts`) : null

  return (
    <div
      className="glass-card rounded-xl p-5 flex flex-col justify-between"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <div>
        <p
          className="text-[10px] font-bold uppercase tracking-wider mb-1"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {label}
        </p>
        <p
          className="text-2xl font-bold leading-none"
          style={{ fontFamily: "var(--font-metric)", color: "var(--color-text-primary)" }}
        >
          {score}%
        </p>
      </div>

      <div className="mt-2 flex items-center justify-between">
        {deltaLabel && (
          <span className="text-[10px] font-bold uppercase" style={{ color: accentColor }}>
            {deltaLabel}
          </span>
        )}
        {sparkPath && (
          <div className="w-12 h-6 rounded overflow-hidden" style={{ background: surfaceColor }}>
            <svg className="w-full h-full" viewBox="0 0 80 32">
              <path d={sparkPath} fill="none" stroke={accentColor} strokeWidth="2" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AISOHeroSection({
  overallScore,
  crawlability,
  citability,
  authority,
  coverage,
  deltas = {},
  scoreTrend,
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150)
    return () => clearTimeout(t)
  }, [])

  const dashOffset = mounted ? RING_CIRC - (RING_CIRC * overallScore) / 100 : RING_CIRC

  return (
    <section className="grid grid-cols-12 gap-4">
      {/* Score ring panel + description */}
      <div
        className="col-span-12 lg:col-span-7 glass-card rounded-xl p-6 flex items-center gap-10 relative overflow-hidden"
        style={{ boxShadow: "0 0 30px rgba(46,102,255,0.12)" }}
      >
        {/* Ambient glow — top right */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-96px", right: "-96px",
            width: "256px", height: "256px",
            background: "rgba(46,102,255,0.1)",
            filter: "blur(80px)",
            borderRadius: "50%",
          }}
        />
        {/* Ambient glow — bottom left */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "-96px", left: "-96px",
            width: "256px", height: "256px",
            background: "rgba(208,188,255,0.1)",
            filter: "blur(80px)",
            borderRadius: "50%",
          }}
        />

        {/* Ring */}
        <div className="relative z-10 w-48 h-48 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
            <defs>
              <linearGradient id="aisoRingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-brand-violet)" />
                <stop offset="100%" stopColor="var(--color-brand-cyan)" />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle
              cx="96" cy="96" r={RING_R}
              fill="none"
              stroke="var(--color-score-ring-track)"
              strokeWidth="12"
            />
            {/* Progress arc */}
            <circle
              cx="96" cy="96" r={RING_R}
              fill="none"
              stroke="url(#aisoRingGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={RING_CIRC}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1.2s ease" }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              style={{
                fontFamily: "var(--font-metric)",
                fontSize: "64px",
                fontWeight: "800",
                lineHeight: "1",
                color: "var(--color-text-primary)",
              }}
            >
              {overallScore}
            </span>
            {scoreTrend && (
              <span className="flex items-center gap-1 text-xs font-bold mt-1"
                    style={{ color: "var(--color-status-success)", fontFamily: "var(--font-metric)" }}>
                <TrendingUp size={12} />
                {scoreTrend}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="relative z-10 space-y-4">
          <h3 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            AISO Score
          </h3>
          <p className="text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Measures how indexable, citable, and authoritative your content is to AI search agents and LLM web crawlers.
          </p>
        </div>
      </div>

      {/* 2×2 Hub metric cards */}
      <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-4">
        <HubMetricCard id="crawlability" label="Crawlability" score={crawlability} delta={deltas.crawlability} />
        <HubMetricCard id="citability"   label="Citability"   score={citability}   delta={deltas.citability}   />
        <HubMetricCard id="authority"    label="Authority"    score={authority}     delta={deltas.authority}    />
        <HubMetricCard id="coverage"     label="Coverage"     score={coverage}      delta={deltas.coverage}     />
      </div>
    </section>
  )
}
