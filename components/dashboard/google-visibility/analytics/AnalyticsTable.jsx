"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { TREND_UP_COLOR, TREND_DOWN_COLOR } from '@/lib/analyticsChartConfig'

/** Small up/down trend readout, reused by any table column that needs one. */
export function TrendValue({ value, direction = value >= 0 ? 'up' : 'down' }) {
  const isUp = direction === 'up'
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums"
      style={{ color: isUp ? TREND_UP_COLOR : TREND_DOWN_COLOR }}
    >
      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isUp ? '+' : ''}{value}%
    </span>
  )
}

/**
 * Generic data table shared by TopChannelsCard, TopPagesCard and
 * EventsCard - the three tables in the reference HTML differed only in
 * their column set, not their structure, so one reusable table (column
 * config in, rows out) replaces three hand-rolled <table> markups. Built on
 * ui/table.jsx (shadcn primitives) rather than raw <table> elements to stay
 * consistent with the rest of Odito.
 */
export default function AnalyticsTable({
  columns,
  rows = [],
  rowKey = 'id',
  loading = false,
  emptyIcon: EmptyIcon,
  emptyMessage = 'No data for this range yet.',
}) {
  if (loading) {
    return (
      <div className="space-y-2.5 px-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    )
  }

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-10">
        {EmptyIcon && <EmptyIcon className="h-8 w-8 opacity-40" />}
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className={`text-[10.5px] uppercase tracking-wide text-muted-foreground/80 font-medium ${
                col.align === 'right' ? 'text-right' : ''
              }`}
            >
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row[rowKey]}>
            {columns.map((col) => (
              <TableCell key={col.key} className={col.align === 'right' ? 'text-right tabular-nums' : ''}>
                {col.render ? col.render(row) : row[col.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
