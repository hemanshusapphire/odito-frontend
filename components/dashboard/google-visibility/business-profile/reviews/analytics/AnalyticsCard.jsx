"use client"

import { Skeleton } from '@/components/ui/skeleton'

/**
 * Shared card for every analytics module, styled after the reference:
 * white surface, soft blue-grey border, ~14px radius, a regular-weight title
 * on the left and (optionally) the compact range control on the right.
 * Body height is fixed per module so skeleton -> chart -> empty never shifts.
 */
export default function AnalyticsCard({ title, subtitle, actions, className = '', children }) {
  return (
    <section className={`min-w-0 rounded-[14px] border border-[#dbe5f4] bg-card px-4 py-4 shadow-[0_1px_2px_rgba(31,42,122,0.05)] sm:px-5 dark:border-border ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <h3 className="text-[18px] font-medium leading-tight text-[#1b2540] sm:text-[20px] dark:text-foreground">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={title || actions ? 'mt-3' : ''}>{children}</div>
    </section>
  )
}

/** Consistent "nothing to chart" body at the chart's own height. */
export function EmptyBody({ message = 'No reviews available for this period.', height = 'h-64' }) {
  return (
    <div className={`${height} flex items-center justify-center text-center text-sm text-muted-foreground`}>
      {message}
    </div>
  )
}

export function SkeletonCard({ height = 'h-64', className = '' }) {
  return (
    <section className={`rounded-[14px] border border-[#dbe5f4] bg-card px-4 py-4 sm:px-5 dark:border-border ${className}`} aria-hidden="true">
      <Skeleton className="h-5 w-48" />
      <Skeleton className={`mt-4 w-full ${height}`} />
    </section>
  )
}

/** Tooltip chrome shared by the Recharts modules. */
export function TooltipShell({ title, children }) {
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs">
      <div className="font-semibold text-popover-foreground mb-1.5">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

export function TooltipRow({ color, label, value }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      {color && <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />}
      <span className="min-w-[90px]">{label}</span>
      <span className="font-medium tabular-nums text-popover-foreground">{value}</span>
    </div>
  )
}

/** Square-swatch legend row used above the charts (reference style). */
export function Legend({ items }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-[#3b4660] dark:text-muted-foreground" aria-label="Legend">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-[3px]" style={{ background: i.color }} aria-hidden="true" />
          {i.label}
        </li>
      ))}
    </ul>
  )
}
