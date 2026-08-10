"use client"

import { useState, useEffect } from "react"

const RING_R    = 88
const RING_CIRC = 2 * Math.PI * RING_R  // ≈ 552.9

const CARD_CONFIGS = {
  answer_readiness:  { label: "Answer Readiness"  },
  question_coverage: { label: "Question Coverage" },
  faq_coverage:      { label: "FAQ Coverage"       },
  snippet_score:     { label: "Snippet Score"      },
  voice_search:      { label: "Voice Search"       },
}

const STATUS_ACCENT = {
  OPTIMAL:      "var(--color-status-success)",
  "NEEDS WORK": "var(--color-status-warning)",
  CRITICAL:     "var(--color-status-error)",
}

function HubMetricCard({ id, score, status, wide = false }) {
  const cfg    = CARD_CONFIGS[id] ?? { label: id }
  const accent = STATUS_ACCENT[status] ?? "var(--color-text-tertiary)"

  return (
    <div
      className={`glass-card rounded-xl p-4 flex ${wide ? "flex-row items-center justify-between" : "flex-col justify-between"}`}
      style={{ borderLeft: `4px solid ${accent}`, ...(wide ? { gridColumn: "span 2" } : {}) }}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
        {cfg.label}
      </p>
      <div className={`flex ${wide ? "items-center gap-4" : "flex-col mt-2"}`}>
        <p
          className="text-2xl font-bold leading-none"
          style={{ fontFamily: "var(--font-metric)", color: "var(--color-text-primary)" }}
        >
          {score}%
        </p>
        <span
          className="text-[10px] font-bold uppercase mt-1"
          style={{ color: accent, fontFamily: "var(--font-metric)" }}
        >
          {status}
        </span>
      </div>
    </div>
  )
}

export default function AEOHeroSection({ aeoScore, cards }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150)
    return () => clearTimeout(t)
  }, [])

  const dashOffset = mounted ? RING_CIRC - (RING_CIRC * aeoScore) / 100 : RING_CIRC

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
              <linearGradient id="aeoRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2E66FF" />
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
              stroke="url(#aeoRingGrad)"
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
              {aeoScore}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="relative z-10 space-y-4">
          <h3 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            AEO Score
          </h3>
          <p className="text-base leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Measures how effectively generative engines find, extract, and present your content as direct answers to user queries.
          </p>
        </div>
      </div>

      {/* 5 metric cards: 2×2 + 1 wide */}
      <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-4">
        <HubMetricCard id="answer_readiness"  score={cards.answer_readiness.score}  status={cards.answer_readiness.status}  />
        <HubMetricCard id="question_coverage" score={cards.question_coverage.score} status={cards.question_coverage.status} />
        <HubMetricCard id="faq_coverage"      score={cards.faq_coverage.score}      status={cards.faq_coverage.status}      />
        <HubMetricCard id="snippet_score"     score={cards.snippet_score.score}     status={cards.snippet_score.status}     />
        <HubMetricCard id="voice_search"      score={cards.voice_search.score}      status={cards.voice_search.status}      wide />
      </div>
    </section>
  )
}
