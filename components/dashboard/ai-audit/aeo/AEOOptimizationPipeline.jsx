"use client"

const SEVERITY_STYLE = {
  critical: {
    label:    "Critical",
    color:    "var(--color-status-error)",
    surface:  "var(--color-status-error-surface)",
    border:   "var(--color-status-error-border)",
    barColor: "var(--color-status-error)",
  },
  high: {
    label:    "High",
    color:    "var(--color-status-warning)",
    surface:  "var(--color-status-warning-surface)",
    border:   "var(--color-status-warning-border)",
    barColor: "var(--color-status-warning)",
  },
  medium: {
    label:    "Medium",
    color:    "var(--color-brand-violet)",
    surface:  "rgba(124,58,237,0.08)",
    border:   "rgba(124,58,237,0.2)",
    barColor: "var(--color-brand-violet)",
  },
  low: {
    label:    "Low",
    color:    "var(--color-text-tertiary)",
    surface:  "rgba(255,255,255,0.04)",
    border:   "rgba(255,255,255,0.08)",
    barColor: "var(--color-text-tertiary)",
  },
}

function SeverityBadge({ severity }) {
  const s = SEVERITY_STYLE[severity] ?? SEVERITY_STYLE.low
  return (
    <span
      className="text-[10px] font-bold px-2 py-1 rounded uppercase"
      style={{ color: s.color, background: s.surface, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  )
}

function ImpactBar({ impact, severity }) {
  const s = SEVERITY_STYLE[severity] ?? SEVERITY_STYLE.low
  const pct = Math.min(100, Math.round(impact * 10))
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.barColor }} />
      </div>
      <span className="text-[10px] font-bold" style={{ color: s.color }}>
        {typeof impact === "number" ? impact.toFixed(1) : impact}
      </span>
    </div>
  )
}

export default function AEOOptimizationPipeline({ issues = [], onFix }) {
  return (
    <section className="space-y-4">
      <h2 className="section-title">Optimization Pipeline</h2>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["Issue Name", "Severity", "Impact", "Pages Affected", "Actions"].map((h, i) => (
                <th
                  key={h}
                  className={`px-6 py-4 text-[11px] font-bold uppercase tracking-widest${i === 3 || i === 4 ? " text-center" : ""}`}
                  style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-metric)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {issues.map((issue, idx) => (
              <tr
                key={issue.rule_id}
                className="transition-colors cursor-pointer"
                style={{ borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.03)" : undefined }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "inset 4px 0 0 var(--color-brand-violet)" }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none" }}
              >
                <td className="px-6 py-4">
                  <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                    {issue.issue_title}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                    {issue.issue_description}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <SeverityBadge severity={issue.severity} />
                </td>
                <td className="px-6 py-4">
                  <ImpactBar impact={issue.impact_score} severity={issue.severity} />
                </td>
                <td className="px-6 py-4 text-center text-xs font-bold" style={{ fontFamily: "var(--font-metric)", color: "var(--color-text-secondary)" }}>
                  {issue.pages_affected?.toLocaleString() ?? 0}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    className="text-xs font-bold uppercase px-4 py-1.5 rounded-lg transition-all"
                    style={{
                      color:      "var(--color-brand-violet)",
                      border:     "1px solid var(--color-brand-violet)",
                      background: "rgba(124,58,237,0.08)",
                    }}
                    onClick={() => onFix?.(issue.rule_id)}
                  >
                    Fix
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
