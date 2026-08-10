"use client"

const ACCENT_MAP = {
  brand:     "var(--color-brand-violet)",
  secondary: "#d0bcff",
  cyan:      "var(--color-brand-cyan)",
  neutral:   "var(--color-text-primary)",
}

function SummaryCard({ label, score, passed, failed, accent }) {
  const accentColor = ACCENT_MAP[accent] ?? ACCENT_MAP.brand
  const total       = passed + failed || 1

  return (
    <div
      className="glass-card rounded-xl p-5 flex flex-col gap-4"
      style={{ borderTop: `2px solid ${accentColor}` }}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
          {label}
        </h4>
        <span
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-metric)", color: accentColor }}
        >
          {score}
        </span>
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

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-status-success)" }} />
          <span style={{ color: "var(--color-text-tertiary)" }}>Passed</span>
          <span className="font-bold ml-1" style={{ color: "var(--color-status-success)" }}>
            {passed}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-status-error)" }} />
          <span style={{ color: "var(--color-text-tertiary)" }}>Failed</span>
          <span className="font-bold ml-1" style={{ color: "var(--color-status-error)" }}>
            {failed}
          </span>
        </div>
        <span style={{ color: "var(--color-text-tertiary)" }}>
          {Math.round((passed / total) * 100)}% pass rate
        </span>
      </div>
    </div>
  )
}

export default function GeoSummaryCards({ cards = [] }) {
  return (
    <section className="space-y-4">
      <h2 className="section-title">GEO Score Breakdown</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <SummaryCard key={card.id} {...card} />
        ))}
      </div>
    </section>
  )
}
