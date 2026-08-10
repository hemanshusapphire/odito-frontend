"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const RING_R    = 88
const RING_CIRC = 2 * Math.PI * RING_R  // ≈ 552.9

const CARD_CONFIGS = {
  entity_authority:      { label: "Entity Authority"    },
  knowledge_graph_score: { label: "Knowledge Graph"     },
  brand_corroboration:   { label: "Brand Corroboration" },
  geo_readiness:         { label: "GEO Readiness"       },
}

const STATUS_ACCENT = {
  up:     "var(--color-status-success)",
  down:   "var(--color-status-error)",
  stable: "var(--color-text-tertiary)",
}

function TrendIcon({ dir, size = 14 }) {
  if (dir === "up")     return <TrendingUp  size={size} />
  if (dir === "down")   return <TrendingDown size={size} />
  return <Minus size={size} />
}

function HeroMetricCard({ id, score, trend, trend_dir }) {
  const cfg    = CARD_CONFIGS[id] ?? { label: id }
  const accent = STATUS_ACCENT[trend_dir] ?? "var(--color-text-tertiary)"

  return (
    <div className="glass-card rounded-xl p-5 flex flex-col justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
           style={{ color: "var(--color-text-tertiary)" }}>
          {cfg.label}
        </p>
        <p className="text-2xl font-bold leading-none"
           style={{ fontFamily: "var(--font-metric)", color: "var(--color-text-primary)" }}>
          {score}%
        </p>
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-xs font-bold" style={{ color: accent }}>
        <TrendIcon dir={trend_dir} size={13} />
        <span style={{ fontFamily: "var(--font-metric)" }}>{trend}</span>
      </div>
    </div>
  )
}

export default function GeoScoreHero({ geoScore, scoreTrend, cards }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150)
    return () => clearTimeout(t)
  }, [])

  const dashOffset = mounted ? RING_CIRC - (RING_CIRC * geoScore) / 100 : RING_CIRC

  return (
    <section className="grid grid-cols-12 gap-4">
      {/* Score ring + description */}
      <div
        className="col-span-12 lg:col-span-7 glass-card rounded-xl p-6 flex items-center gap-10 relative overflow-hidden"
        style={{ boxShadow: "0 0 30px rgba(46,102,255,0.12)" }}
      >
        {/* Ambient glows */}
        <div className="absolute pointer-events-none" style={{
          top: "-80px", right: "-80px", width: "240px", height: "240px",
          background: "rgba(46,102,255,0.1)", filter: "blur(80px)", borderRadius: "50%",
        }} />
        <div className="absolute pointer-events-none" style={{
          bottom: "-80px", left: "-80px", width: "200px", height: "200px",
          background: "rgba(208,188,255,0.08)", filter: "blur(70px)", borderRadius: "50%",
        }} />

        {/* Ring */}
        <div className="relative z-10 w-48 h-48 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
            <defs>
              <linearGradient id="geoRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#2E66FF" />
                <stop offset="100%" stopColor="#d0bcff" />
              </linearGradient>
            </defs>
            <circle
              cx="96" cy="96" r={RING_R}
              fill="none"
              stroke="var(--color-score-ring-track)"
              strokeWidth="12"
            />
            <circle
              cx="96" cy="96" r={RING_R}
              fill="none"
              stroke="url(#geoRingGrad)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={RING_CIRC}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1.2s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span style={{
              fontFamily: "var(--font-metric)", fontSize: "64px",
              fontWeight: "800", lineHeight: "1", color: "var(--color-text-primary)",
            }}>
              {geoScore}
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
            GEO Score
          </h3>
          <p className="text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Measures how effectively generative engines recognize, validate, and trust your brand
            entities within the global knowledge graph.
          </p>
        </div>
      </div>

      {/* 3 metric cards stacked */}
      <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
        <HeroMetricCard id="entity_authority"      {...cards.entity_authority}      />
        <HeroMetricCard id="knowledge_graph_score" {...cards.knowledge_graph_score} />
        <HeroMetricCard id="brand_corroboration"   {...cards.brand_corroboration}   />
      </div>
    </section>
  )
}
