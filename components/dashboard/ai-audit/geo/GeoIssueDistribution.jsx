"use client"

import { ShieldAlert, AlertTriangle, Settings2, Sparkles } from "lucide-react"

function buildArcs(dist) {
  const total = dist.total || 1
  const C = 100
  return {
    lowArc:      C,
    mediumArc:   Math.round(((dist.critical + dist.high + dist.medium) / total) * C),
    highArc:     Math.round(((dist.critical + dist.high) / total) * C),
    criticalArc: Math.round((dist.critical / total) * C),
  }
}

const SEVERITY_ROWS = [
  {
    key:     "critical",
    label:   "Critical Vulnerabilities",
    desc:    "Blocks generative AI entity recognition entirely.",
    Icon:    ShieldAlert,
    color:   "var(--color-status-error)",
    surface: "var(--color-status-error-surface)",
    border:  "var(--color-status-error-border)",
  },
  {
    key:     "high",
    label:   "High Severity",
    desc:    "Significantly degrades knowledge graph ranking.",
    Icon:    AlertTriangle,
    color:   "var(--color-status-warning)",
    surface: "var(--color-status-warning-surface)",
    border:  "var(--color-status-warning-border)",
  },
  {
    key:     "medium",
    label:   "Medium Priority",
    desc:    "Optimization opportunities for entity coverage.",
    Icon:    Settings2,
    color:   "var(--color-brand-violet)",
    surface: "rgba(124,58,237,0.08)",
    border:  "rgba(124,58,237,0.2)",
  },
  {
    key:     "low",
    label:   "Low Priority",
    desc:    "Minor structural hygiene suggestions.",
    Icon:    Sparkles,
    color:   "#3B82F6",
    surface: "rgba(59,130,246,0.08)",
    border:  "rgba(59,130,246,0.2)",
  },
]

export default function GeoIssueDistribution({ distribution }) {
  const { lowArc, mediumArc, highArc, criticalArc } = buildArcs(distribution)

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Donut */}
      <div className="lg:col-span-4 glass-card rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.05) 0%, transparent 50%, rgba(46,102,255,0.05) 100%)",
          }}
        />

        <div className="relative w-48 h-48 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none"
              stroke="#3B82F6"
              strokeDasharray={`${lowArc} 100`} strokeDashoffset="0" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="16" fill="none"
              stroke="var(--color-status-warning)"
              strokeDasharray={`${mediumArc} 100`} strokeDashoffset="0" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="16" fill="none"
              stroke="var(--color-brand-violet)"
              strokeDasharray={`${highArc} 100`} strokeDashoffset="0" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="16" fill="none"
              stroke="var(--color-status-error)"
              strokeDasharray={`${criticalArc} 100`} strokeDashoffset="0" strokeWidth="3.5" />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span style={{ fontFamily: "var(--font-metric)", fontSize: "40px", fontWeight: "700", lineHeight: "1", color: "var(--color-text-primary)" }}>
              {distribution.total}
            </span>
            <span className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "var(--color-text-tertiary)" }}>
              Total Issues
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-2 w-full mt-2">
          {[
            { label: "Critical", color: "var(--color-status-error)",    count: distribution.critical },
            { label: "High",     color: "var(--color-brand-violet)",     count: distribution.high     },
            { label: "Medium",   color: "var(--color-status-warning)",   count: distribution.medium   },
            { label: "Low",      color: "#3B82F6",                       count: distribution.low      },
          ].map(({ label, color, count }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>{label}</span>
              <span className="text-[11px] ml-auto" style={{ color: "var(--color-text-tertiary)" }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Severity cards 2×2 */}
      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SEVERITY_ROWS.map(({ key, label, desc, Icon, color, surface, border }) => (
          <div
            key={key}
            className="glass-card rounded-xl p-5 flex items-center gap-4"
            style={{ borderLeft: `4px solid ${color}` }}
          >
            <div
              className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center"
              style={{ background: surface, border: `1px solid ${border}` }}
            >
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <span
                className="text-3xl font-bold block"
                style={{ fontFamily: "var(--font-metric)", color: "var(--color-text-primary)" }}
              >
                {distribution[key]}
              </span>
              <span className="text-sm font-bold block" style={{ color: "var(--color-text-primary)" }}>
                {label}
              </span>
              <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                {desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
