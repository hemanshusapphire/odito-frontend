"use client"

import { Globe, FileText, MoreHorizontal, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

const SEVERITY_STYLE = {
  critical: { label: "Critical", color: "var(--color-status-error)",   accent: "var(--color-status-error)"   },
  high:     { label: "High",     color: "var(--color-status-warning)", accent: "var(--color-status-warning)" },
  medium:   { label: "Medium",   color: "var(--color-brand-violet)",   accent: "var(--color-brand-violet)"   },
  low:      { label: "Low",      color: "var(--color-text-tertiary)",  accent: "var(--color-text-tertiary)"  },
}

function RuleRow({ rule, isDomain, onClick }) {
  const s = SEVERITY_STYLE[rule.severity] ?? SEVERITY_STYLE.low
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg transition-colors cursor-pointer"
      style={{ borderLeft: `4px solid ${isDomain ? "#3b82f6" : s.accent}` }}
      onClick={onClick}
    >
      <div className="grow min-w-0">
        <h4 className="text-sm font-bold truncate" style={{ color: "var(--color-text-primary)" }}>
          {rule.issue_title}
        </h4>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
          {isDomain ? (
            <span className="inline-flex items-center gap-1" style={{ color: "#3b82f6" }}>
              <Globe size={10} />
              Applies to entire website
            </span>
          ) : (
            `Failing on ${rule.pages_affected?.toLocaleString() ?? 0} pages`
          )}
        </p>
      </div>

      <div className="text-right shrink-0">
        <div
          className="text-[10px] font-bold uppercase mb-1"
          style={{ color: s.color, fontFamily: "var(--font-metric)" }}
        >
          {s.label}
        </div>
        <div
          className="flex items-center justify-end gap-1 text-xs font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          <Zap size={11} style={{ color: s.color }} />
          {rule.impact_score} Impact
        </div>
      </div>
    </div>
  )
}

function ScopeLabel({ icon: Icon, color, bg, border, label }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      <Icon size={10} />
      {label}
    </div>
  )
}

/**
 * TopFailedRulesSection
 *
 * Props:
 *   rules — array of { rule_id, issue_title, pages_affected, severity, impact_score, scope }
 */
export default function TopFailedRulesSection({ rules = [] }) {
  const router = useRouter()
  const goTo = (ruleId) => router.push(`/app/aiso?issue=${encodeURIComponent(ruleId)}`)

  const domainRules = rules.filter(r => r.scope === "domain")
  const pageRules   = rules.filter(r => r.scope !== "domain")

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Top Failed Rules</h2>
        <MoreHorizontal
          size={18}
          className="cursor-pointer transition-colors"
          style={{ color: "var(--color-text-tertiary)" }}
        />
      </div>

      <div className="glass-card rounded-xl p-2 space-y-1">

        {/* ── Domain group ───────────────────────────────────────────────── */}
        {domainRules.length > 0 && (
          <>
            <div className="flex items-center gap-2 px-3 pt-2 pb-1">
              <ScopeLabel
                icon={Globe}
                color="#3b82f6"
                bg="rgba(59,130,246,0.1)"
                border="rgba(59,130,246,0.2)"
                label="Domain"
              />
              <div className="flex-1 h-px" style={{ background: "rgba(59,130,246,0.12)" }} />
            </div>
            {domainRules.map(rule => (
              <RuleRow key={rule.rule_id} rule={rule} isDomain onClick={() => goTo(rule.rule_id)} />
            ))}
          </>
        )}

        {/* ── Page group ─────────────────────────────────────────────────── */}
        {pageRules.length > 0 && (
          <>
            <div className="flex items-center gap-2 px-3 pt-3 pb-1">
              <ScopeLabel
                icon={FileText}
                color="var(--color-text-secondary)"
                bg="rgba(255,255,255,0.04)"
                border="rgba(255,255,255,0.08)"
                label="Per Page"
              />
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>
            {pageRules.map(rule => (
              <RuleRow key={rule.rule_id} rule={rule} isDomain={false} onClick={() => goTo(rule.rule_id)} />
            ))}
          </>
        )}

        {/* Fallback — no scope field yet (pre-pipeline-run data) */}
        {domainRules.length === 0 && pageRules.length === 0 && rules.map(rule => (
          <RuleRow key={rule.rule_id} rule={rule} isDomain={false} onClick={() => goTo(rule.rule_id)} />
        ))}
      </div>
    </section>
  )
}
