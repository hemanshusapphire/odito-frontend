"use client"

import { Globe, FileText, Share2, Table2 } from "lucide-react"

const SEVERITY_STYLE = {
  critical: { label: "Critical", color: "var(--color-status-error)",   surface: "var(--color-status-error-surface)",   border: "var(--color-status-error-border)"   },
  high:     { label: "High",     color: "var(--color-status-warning)", surface: "var(--color-status-warning-surface)", border: "var(--color-status-warning-border)" },
  medium:   { label: "Medium",   color: "var(--color-brand-violet)",   surface: "rgba(124,58,237,0.08)",               border: "rgba(124,58,237,0.2)"               },
  low:      { label: "Low",      color: "var(--color-text-tertiary)",  surface: "rgba(255,255,255,0.04)",              border: "rgba(255,255,255,0.08)"             },
}

// Page-level icon map — falls back to FileText
const PAGE_OPPORTUNITY_META = {
  "AISO-C1":  { Icon: Share2,   iconColor: "var(--color-brand-cyan)",  iconBg: "rgba(76,215,246,0.1)"  },
  "AISO-CV1": { Icon: Table2,   iconColor: "var(--color-brand-teal)",  iconBg: "rgba(56,178,172,0.1)"  },
}
const PAGE_FALLBACK = { Icon: FileText, iconColor: "var(--color-brand-violet)", iconBg: "rgba(124,58,237,0.1)" }

// Domain-level icon
const DOMAIN_META = { Icon: Globe, iconColor: "#3b82f6", iconBg: "rgba(59,130,246,0.12)" }

function OpportunityCard({ opp, isDomain }) {
  const { Icon, iconColor, iconBg } = isDomain
    ? DOMAIN_META
    : (PAGE_OPPORTUNITY_META[opp.rule_id] ?? PAGE_FALLBACK)
  const s = SEVERITY_STYLE[opp.severity] ?? SEVERITY_STYLE.low

  return (
    <div
      className="glass-card rounded-xl p-5 relative cursor-pointer transition-all group"
      style={isDomain ? { border: "1px solid rgba(59,130,246,0.15)" } : undefined}
    >
      <div className="flex gap-4">
        <div
          className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ background: iconBg }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
            {opp.issue_title}
          </h4>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
            {opp.recommendation}
          </p>

          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span
              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
              style={{
                color:      s.color,
                background: s.surface,
                border:     `1px solid ${s.border}`,
                fontFamily: "var(--font-metric)",
              }}
            >
              {s.label}
            </span>

            {isDomain ? (
              <span
                className="inline-flex items-center gap-1 text-[10px] uppercase font-bold"
                style={{ color: "#3b82f6", fontFamily: "var(--font-metric)" }}
              >
                <Globe size={9} />
                Entire Website
              </span>
            ) : (
              <span
                className="text-[10px] uppercase"
                style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-metric)" }}
              >
                {opp.pages_affected?.toLocaleString() ?? 0} pages affected
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ icon: Icon, color, bg, border, label }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
        style={{ color, background: bg, border: `1px solid ${border}` }}
      >
        <Icon size={10} />
        {label}
      </div>
      <div className="flex-1 h-px" style={{ background: border }} />
    </div>
  )
}

/**
 * TopOpportunitiesSection
 *
 * Props:
 *   opportunities — array of { rule_id, issue_title, recommendation, severity,
 *                               impact_score, pages_affected, scope }
 */
export default function TopOpportunitiesSection({ opportunities = [] }) {
  const domainOpps = opportunities.filter(o => o.scope === "domain")
  const pageOpps   = opportunities.filter(o => o.scope !== "domain")

  // Fallback: if no scope field present render all as page-level
  const hasScope = opportunities.some(o => o.scope != null)
  const legacyAll = !hasScope ? opportunities : []

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Top Opportunities</h2>
        <button
          className="text-xs font-bold uppercase transition-colors"
          style={{ color: "var(--color-brand-violet)", fontFamily: "var(--font-metric)" }}
        >
          View All
        </button>
      </div>

      <div className="space-y-5">

        {/* ── Domain opportunities ─────────────────────────────────────── */}
        {domainOpps.length > 0 && (
          <div className="space-y-3">
            <SectionLabel
              icon={Globe}
              color="#3b82f6"
              bg="rgba(59,130,246,0.1)"
              border="rgba(59,130,246,0.2)"
              label="Domain Opportunities"
            />
            <div className="grid grid-cols-1 gap-3">
              {domainOpps.map(opp => (
                <OpportunityCard key={opp.rule_id} opp={opp} isDomain />
              ))}
            </div>
          </div>
        )}

        {/* ── Page opportunities ───────────────────────────────────────── */}
        {pageOpps.length > 0 && (
          <div className="space-y-3">
            <SectionLabel
              icon={FileText}
              color="var(--color-text-secondary)"
              bg="rgba(255,255,255,0.04)"
              border="rgba(255,255,255,0.08)"
              label="Page Opportunities"
            />
            <div className="grid grid-cols-1 gap-3">
              {pageOpps.map(opp => (
                <OpportunityCard key={opp.rule_id} opp={opp} isDomain={false} />
              ))}
            </div>
          </div>
        )}

        {/* Legacy fallback (no scope in data yet) */}
        {legacyAll.map(opp => (
          <OpportunityCard key={opp.rule_id} opp={opp} isDomain={false} />
        ))}
      </div>
    </section>
  )
}
