"use client"

import { Code2, FileText, HelpCircle, ShoppingBag, Building2, MapPin } from "lucide-react"

// Per-schema display metadata
const SCHEMA_META = {
  LocalBusiness: {
    Icon:  MapPin,
    color: "var(--color-status-error)",
    desc:  "homepage · contact · location",
  },
  Service: {
    Icon:  Code2,
    color: "var(--color-brand-violet)",
    desc:  "service pages",
  },
  Article: {
    Icon:  FileText,
    color: "var(--color-brand-cyan)",
    desc:  "article · blog pages",
  },
  FAQPage: {
    Icon:  HelpCircle,
    color: "var(--color-status-warning)",
    desc:  "faq pages",
  },
  Product: {
    Icon:  ShoppingBag,
    color: "#3B82F6",
    desc:  "product pages",
  },
  Organization: {
    Icon:  Building2,
    color: "var(--color-status-success)",
    desc:  "about pages",
  },
}

const FALLBACK_META = {
  Icon:  FileText,
  color: "var(--color-text-tertiary)",
  desc:  "",
}

function coverageColor(pct) {
  if (pct >= 80) return "var(--color-status-success)"
  if (pct >= 50) return "var(--color-status-warning)"
  return "var(--color-status-error)"
}

function SchemaCoverageCard({ schema_type, applicable_pages, pages_with_schema, pages_missing_schema, coverage_percent, affected_urls = [] }) {
  const meta    = SCHEMA_META[schema_type] ?? FALLBACK_META
  const { Icon, color, desc } = meta
  const barColor = coverageColor(coverage_percent)

  return (
    <div
      className="glass-card rounded-xl p-5 flex flex-col gap-4"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
            style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}
          >
            <Icon size={16} style={{ color }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: "var(--color-text-primary)" }}>
              {schema_type}
            </p>
            <p className="text-[10px] truncate" style={{ color: "var(--color-text-tertiary)" }}>
              {desc}
            </p>
          </div>
        </div>

        {/* Coverage percentage */}
        <span
          className="text-2xl font-bold shrink-0"
          style={{ fontFamily: "var(--font-metric)", color: barColor }}
        >
          {coverage_percent}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--color-score-ring-track)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${coverage_percent}%`, background: barColor }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p
            className="text-base font-bold"
            style={{ fontFamily: "var(--font-metric)", color: "var(--color-text-primary)" }}
          >
            {applicable_pages}
          </p>
          <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            Applicable
          </p>
        </div>
        <div>
          <p
            className="text-base font-bold"
            style={{ fontFamily: "var(--font-metric)", color: "var(--color-status-success)" }}
          >
            {pages_with_schema}
          </p>
          <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            Found
          </p>
        </div>
        <div>
          <p
            className="text-base font-bold"
            style={{ fontFamily: "var(--font-metric)", color: pages_missing_schema > 0 ? "var(--color-status-error)" : "var(--color-text-tertiary)" }}
          >
            {pages_missing_schema}
          </p>
          <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            Missing
          </p>
        </div>
      </div>

      {/* Affected URL list (collapsed, show up to 3) */}
      {affected_urls.length > 0 && (
        <div className="space-y-1">
          {affected_urls.slice(0, 3).map(url => (
            <p
              key={url}
              className="text-[10px] truncate px-2 py-1 rounded"
              style={{
                color:      "var(--color-status-error)",
                background: "var(--color-status-error-surface)",
              }}
            >
              {url}
            </p>
          ))}
          {affected_urls.length > 3 && (
            <p className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
              +{affected_urls.length - 3} more pages missing schema
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * GeoSchemaCoverageSection
 *
 * Props:
 *   coverage — array of schema coverage objects from the API:
 *     [{ schema_type, applicable_pages, pages_with_schema,
 *        pages_missing_schema, coverage_percent, affected_urls }]
 *
 * Each entry represents one schema type and the pages where it is expected.
 * Sorted worst coverage first by the API.
 */
export default function GeoSchemaCoverageSection({ coverage = [] }) {
  if (coverage.length === 0) return null

  // Overall schema health: weighted average by applicable_pages
  const totalApplicable = coverage.reduce((s, c) => s + c.applicable_pages, 0)
  const weightedFound   = coverage.reduce((s, c) => s + c.pages_with_schema, 0)
  const overallPct      = totalApplicable > 0
    ? Math.round((weightedFound / totalApplicable) * 100)
    : 0

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Schema Coverage</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            Each schema type evaluated only on applicable pages — not total project pages
          </p>
        </div>
        <div className="text-right">
          <span
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-metric)", color: coverageColor(overallPct) }}
          >
            {overallPct}%
          </span>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
            Overall
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coverage.map(item => (
          <SchemaCoverageCard key={item.schema_type} {...item} />
        ))}
      </div>
    </section>
  )
}
