"use client"

import { AlertCircle, AlertTriangle, Info, Lightbulb, ArrowRight } from "lucide-react"

const PRIORITY_CONFIG = {
  critical: {
    label:   "Critical Priority",
    color:   "var(--color-status-error)",
    surface: "var(--color-status-error-surface)",
    border:  "var(--color-status-error-border)",
    Icon:    AlertCircle,
  },
  high: {
    label:   "High Priority",
    color:   "var(--color-status-warning)",
    surface: "var(--color-status-warning-surface)",
    border:  "var(--color-status-warning-border)",
    Icon:    AlertTriangle,
  },
  medium: {
    label:   "Medium Priority",
    color:   "var(--color-brand-violet)",
    surface: "rgba(124,58,237,0.08)",
    border:  "rgba(124,58,237,0.2)",
    Icon:    Info,
  },
  low: {
    label:   "Low Priority",
    color:   "var(--color-status-success)",
    surface: "var(--color-status-success-surface)",
    border:  "var(--color-status-success-border)",
    Icon:    Lightbulb,
  },
}

function OpportunityCard({ priority, title, description, onFix }) {
  const cfg  = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.low
  const { Icon } = cfg

  return (
    <div
      className="p-5 rounded-xl flex flex-col gap-3 cursor-pointer transition-colors"
      style={{
        background:    "rgba(255,255,255,0.02)",
        border:        "1px solid rgba(255,255,255,0.06)",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(46,102,255,0.3)" }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color: cfg.color }} />
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: cfg.color }}
        >
          {cfg.label}
        </span>
      </div>
      <h5 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </h5>
      <p className="text-xs leading-relaxed flex-1" style={{ color: "var(--color-text-tertiary)" }}>
        {description}
      </p>
      <button
        className="flex items-center gap-1 text-[11px] font-bold"
        style={{ color: "var(--color-brand-violet)" }}
        onClick={onFix}
      >
        Implement Fix <ArrowRight size={12} />
      </button>
    </div>
  )
}

export default function GeoOpportunitiesCenter({
  entityTrustScore,
  validatedEntities,
  missingLinks,
  opportunities = [],
  onFix,
}) {
  return (
    <section className="glass-card rounded-xl overflow-hidden"
             style={{ boxShadow: "0 0 30px rgba(46,102,255,0.08)" }}>
      {/* Header band */}
      <div
        className="p-8 border-b"
        style={{
          background:   "linear-gradient(90deg, rgba(46,102,255,0.12) 0%, transparent 70%)",
          borderColor:  "rgba(255,255,255,0.05)",
        }}
      >
        <div className="grid grid-cols-12 items-center gap-6">
          <div className="col-span-12 lg:col-span-4">
            <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
              Entity Opportunities Center
            </h3>
            <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
              AI-curated structural enhancements to dominate search engine knowledge vaults.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-8 flex justify-start lg:justify-end gap-10 lg:gap-14">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest mb-1"
                 style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-metric)" }}>
                Entity Trust Score
              </p>
              <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-metric)", color: "var(--color-text-primary)" }}>
                {entityTrustScore}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest mb-1"
                 style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-metric)" }}>
                Validated Entities
              </p>
              <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-metric)", color: "var(--color-text-primary)" }}>
                {validatedEntities}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest mb-1"
                 style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-metric)" }}>
                Missing Links
              </p>
              <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-metric)", color: "var(--color-status-error)" }}>
                {missingLinks}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunity cards grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {opportunities.map(opp => (
            <OpportunityCard
              key={opp.id}
              {...opp}
              onFix={() => onFix?.(opp)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
