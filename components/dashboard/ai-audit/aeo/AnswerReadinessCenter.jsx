"use client"

import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"

const STATUS_CONFIG = {
  pass:    { Icon: CheckCircle,   color: "var(--color-status-success)", label: "Pass",    barColor: "var(--color-status-success)" },
  warning: { Icon: AlertTriangle, color: "var(--color-status-warning)", label: "Warning", barColor: "var(--color-status-warning)" },
  fail:    { Icon: XCircle,       color: "var(--color-status-error)",   label: "Fail",    barColor: "var(--color-status-error)"   },
}

function ReadinessCard({ label, status, score, description }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.fail
  const { Icon } = cfg

  return (
    <div
      className="glass-card rounded-xl p-4 flex flex-col gap-3 hover:scale-[1.01] transition-transform cursor-default"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={15} style={{ color: cfg.color }} />
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: cfg.color, fontFamily: "var(--font-metric)" }}
          >
            {cfg.label}
          </span>
        </div>
        <span
          className="text-lg font-bold"
          style={{ fontFamily: "var(--font-metric)", color: "var(--color-text-primary)" }}
        >
          {score}%
        </span>
      </div>

      <div>
        <h4 className="text-sm font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
          {label}
        </h4>
        <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
          {description}
        </p>
      </div>

      <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--color-score-ring-track)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: cfg.barColor }}
        />
      </div>
    </div>
  )
}

export default function AnswerReadinessCenter({ signals }) {
  return (
    <section className="space-y-4">
      <h2 className="section-title">Answer Readiness Center</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {signals.map((s) => (
          <ReadinessCard
            key={s.id}
            label={s.label}
            status={s.status}
            score={s.score}
            description={s.description}
          />
        ))}
      </div>
    </section>
  )
}
