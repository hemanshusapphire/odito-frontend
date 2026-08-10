"use client"

import { Building2, Store, Link2, BadgeCheck, MapPin, Clock, RefreshCw } from "lucide-react"

const STATUS_CONFIG = {
  pass: {
    label:   "PASS",
    color:   "var(--color-status-success)",
    surface: "var(--color-status-success-surface)",
    border:  "var(--color-status-success-border)",
    left:    "var(--color-status-success)",
  },
  warning: {
    label:   "WARNING",
    color:   "var(--color-status-warning)",
    surface: "var(--color-status-warning-surface)",
    border:  "var(--color-status-warning-border)",
    left:    "var(--color-status-warning)",
  },
  fail: {
    label:   "FAIL",
    color:   "var(--color-status-error)",
    surface: "var(--color-status-error-surface)",
    border:  "var(--color-status-error-border)",
    left:    "var(--color-status-error)",
  },
}

const ICON_MAP = {
  org_schema: Building2,
  lb_schema:  Store,
  same_as:    Link2,
  nap:        BadgeCheck,
  geocoords:  MapPin,
  hours:      Clock,
}

function ValidationCard({ id, label, status, description, applicable_pages, passed_pages }) {
  const cfg     = STATUS_CONFIG[status] ?? STATUS_CONFIG.fail
  const Icon    = ICON_MAP[id] ?? BadgeCheck
  const showBar = applicable_pages != null && applicable_pages > 0
  const pct     = showBar ? Math.round((passed_pages / applicable_pages) * 100) : 0

  return (
    <div
      className="glass-card rounded-xl p-4 flex flex-col gap-3"
      style={{ borderLeft: `4px solid ${cfg.left}` }}
    >
      <div className="flex items-center justify-between">
        <Icon size={18} style={{ color: cfg.color }} />
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ color: cfg.color, background: cfg.surface, border: `1px solid ${cfg.border}` }}
        >
          {cfg.label}
        </span>
      </div>
      <div>
        <p className="text-sm font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>
          {label}
        </p>
        <p className="text-[11px] leading-snug" style={{ color: "var(--color-text-tertiary)" }}>
          {description}
        </p>
      </div>
      {showBar && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span style={{ color: "var(--color-text-tertiary)" }}>
              {passed_pages} / {applicable_pages} pages
            </span>
            <span className="font-bold" style={{ color: cfg.color }}>{pct}%</span>
          </div>
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: "var(--color-score-ring-track)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: cfg.color }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function GeoValidationCenter({ signals = [] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Entity Validation Center</h2>
        <button
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--color-brand-violet)" }}
        >
          <RefreshCw size={14} />
          Re-validate All
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {signals.map(sig => (
          <ValidationCard key={sig.id} {...sig} />
        ))}
      </div>
    </section>
  )
}
