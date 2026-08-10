"use client"

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart2 } from 'lucide-react'

/**
 * Ranked breakdown list, shared by Country/Device/Search Appearance -
 * structurally identical widgets (a dimension value, its clicks/CTR, and a
 * bar sized relative to the top row), differing only in title and how the
 * raw dimension_value is labeled. One component instead of three
 * near-identical ones.
 */
export default function DimensionBreakdownList({
  title,
  subtitle,
  rows = [],
  loading = false,
  labelFormatter = (v) => v,
  emptyMessage = 'No data yet. Run "Sync Now" to get started.',
}) {
  const maxClicks = rows.reduce((max, r) => Math.max(max, r.clicks), 0) || 1

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}

      <div className="mt-4">
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-8">
            <BarChart2 className="h-8 w-8 opacity-40" />
            {/* emptyMessage may be a plain string (Country/Device default) or
                a richer ReactNode (Search Appearance's educational empty
                state) - a div renders either safely, unlike a <p> which
                can't legally contain the block-level markup the latter uses. */}
            <div className="text-sm">{emptyMessage}</div>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.dimension_value} className="flex items-center gap-3">
                <span className="text-sm text-foreground w-32 sm:w-40 shrink-0 truncate" title={labelFormatter(row.dimension_value)}>
                  {labelFormatter(row.dimension_value)}
                </span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${Math.max((row.clicks / maxClicks) * 100, row.clicks > 0 ? 3 : 0)}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground tabular-nums w-32 text-right shrink-0">
                  {row.clicks.toLocaleString()} clicks · {(row.ctr * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
