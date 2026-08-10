"use client"

/**
 * KPI tile: circular icon chip on the left, label + value stacked on the
 * right - matches the reference's horizontal metric-card layout (distinct
 * from Google Ads' icon-top-right/value-below KPICard).
 */
export default function MetricCard({ label, value, icon: Icon, tint = '#7C6CF6' }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3.5 transition-colors hover:bg-muted/50">
      <span
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ background: `${tint}18`, color: tint }}
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground truncate">{label}</div>
        <div className="text-xl font-bold tabular-nums font-mono">{value}</div>
      </div>
    </div>
  )
}
