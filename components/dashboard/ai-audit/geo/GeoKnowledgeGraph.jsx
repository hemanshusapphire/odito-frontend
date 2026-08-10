"use client"

// Accent color per card — matches HTML design tokens
const ACCENT_MAP = {
  brand:     "var(--color-brand-violet)",
  secondary: "#d0bcff",
  cyan:      "var(--color-brand-cyan)",
  neutral:   "var(--color-text-primary)",
}

function KGCard({ label, subtitle, score, passed, failed, accent }) {
  const accentColor = ACCENT_MAP[accent] ?? ACCENT_MAP.brand

  return (
    <div className="glass-card rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
            {label}
          </h4>
          <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
            {subtitle}
          </p>
        </div>
        <span
          className="text-xl font-bold flex-shrink-0"
          style={{ fontFamily: "var(--font-metric)", color: accentColor }}
        >
          {score}/100
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span style={{ color: "var(--color-text-tertiary)" }}>Checks Passed</span>
          <span className="font-bold" style={{ color: "var(--color-status-success)" }}>{passed}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span style={{ color: "var(--color-text-tertiary)" }}>Checks Failed</span>
          <span className="font-bold" style={{ color: "var(--color-status-error)" }}>{failed}</span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "var(--color-score-ring-track)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width:      `${score}%`,
              background: `linear-gradient(90deg, #2E66FF, ${accentColor})`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default function GeoKnowledgeGraph({ cards = [] }) {
  const filtered = cards.filter(c => c.id !== 'geo_readiness')
  return (
    <div className="space-y-4">
      <h2 className="section-title">Knowledge Graph Intelligence</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {filtered.map(card => (
          <KGCard key={card.id} {...card} />
        ))}
      </div>
    </div>
  )
}
