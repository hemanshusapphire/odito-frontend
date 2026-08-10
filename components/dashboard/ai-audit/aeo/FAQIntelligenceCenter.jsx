"use client"

import { AlertCircle, AlertTriangle, Zap } from "lucide-react"

const IMPACT_CONFIG = {
  high:   { color: "var(--color-status-error)",   surface: "var(--color-status-error-surface)",   border: "var(--color-status-error-border)",   label: "HIGH IMPACT"   },
  medium: { color: "var(--color-status-warning)", surface: "var(--color-status-warning-surface)", border: "var(--color-status-warning-border)", label: "MEDIUM IMPACT" },
  low:    { color: "var(--color-text-tertiary)",  surface: "rgba(255,255,255,0.04)",              border: "rgba(255,255,255,0.08)",             label: "LOW IMPACT"    },
}

const STATUS_CONFIG = {
  missing_schema: { Icon: AlertCircle, color: "var(--color-status-error)",   label: "Missing Schema"  },
  poor_structure: { Icon: AlertTriangle, color: "var(--color-status-warning)", label: "Poor Structure" },
}

function MetricStat({ label, value, highlight }) {
  return (
    <div className="text-center">
      <span className="text-[10px] uppercase font-bold tracking-widest block mb-1" style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-metric)" }}>
        {label}
      </span>
      <span
        className="text-2xl font-bold"
        style={{
          fontFamily: "var(--font-metric)",
          color: highlight ? "var(--color-status-success)" : "var(--color-text-primary)",
        }}
      >
        {value}
      </span>
    </div>
  )
}

function OpportunityCard({ opportunity }) {
  const impact = IMPACT_CONFIG[opportunity.impact] ?? IMPACT_CONFIG.low
  const status = STATUS_CONFIG[opportunity.status] ?? STATUS_CONFIG.missing_schema
  const { Icon } = status

  return (
    <div
      className="glass-card rounded-xl p-5 flex justify-between items-start gap-4"
      style={{ borderLeft: `3px solid ${impact.color}` }}
    >
      <div className="space-y-2 min-w-0">
        <div className="flex items-center gap-1.5">
          <Icon size={13} style={{ color: status.color }} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: status.color, fontFamily: "var(--font-metric)" }}>
            {status.label}
          </span>
        </div>

        <h4 className="text-sm font-semibold leading-snug" style={{ color: "var(--color-text-primary)" }}>
          "{opportunity.question}"
        </h4>

        <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
          Recommended:{" "}
          <span style={{ color: "var(--color-text-secondary)" }}>{opportunity.recommendation}</span>
        </p>
      </div>

      <div
        className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
        style={{ color: impact.color, background: impact.surface, border: `1px solid ${impact.border}` }}
      >
        {impact.label}
      </div>
    </div>
  )
}

export default function FAQIntelligenceCenter({ faq }) {
  return (
    <section className="glass-card rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="section-title mb-1">FAQ Intelligence Center</h2>
          <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
            Managing the knowledge bridge between your content and AI engines.
          </p>
        </div>
      </div>

      {/* Metrics row */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <MetricStat label="Schema Questions"  value={faq.schema_questions}  />
        <MetricStat label="Visible Questions" value={faq.visible_questions} />
        <MetricStat label="Matched"           value={faq.matched}           highlight />
        <MetricStat label="Pages with FAQ"    value={faq.pages_with_faq}   />
      </div>

      {/* FAQ Opportunities Panel */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap size={14} style={{ color: "var(--color-brand-violet)" }} />
          <h3
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--color-brand-violet)", fontFamily: "var(--font-metric)" }}
          >
            FAQ Opportunities Panel
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faq.opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      </div>
    </section>
  )
}
