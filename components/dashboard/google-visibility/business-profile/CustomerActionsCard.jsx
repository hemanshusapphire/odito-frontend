"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MousePointerClick } from 'lucide-react'

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value, payload: entry } = payload[0]

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
        <span className="font-medium text-popover-foreground">{name}</span>
      </div>
      <div className="text-muted-foreground mt-1 tabular-nums">{value.toLocaleString()} actions</div>
    </div>
  )
}

/**
 * Donut breakdown of customer actions (website clicks, calls, directions,
 * bookings) with a centered total and a value/percentage legend.
 */
export default function CustomerActionsCard({ customerActions, rangeLabel = 'the selected period', loading = false }) {
  const { total = 0, breakdown = [] } = customerActions || {}

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Customer Actions</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Distribution over {rangeLabel}</p>

      {loading ? (
        <div className="flex items-center gap-4 mt-4">
          <Skeleton className="h-40 w-40 rounded-full shrink-0" />
          <div className="flex-1 space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        </div>
      ) : total === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-8">
          <MousePointerClick className="h-8 w-8 opacity-40" />
          <p className="text-sm">No customer actions recorded for this range yet.</p>
        </div>
      ) : (
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
        <div className="relative h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdown}
                dataKey="value"
                nameKey="label"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={2}
                strokeWidth={0}
              >
                {breakdown.map((entry) => (
                  <Cell key={entry.key} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold tabular-nums">{total.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground">Total actions</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-2.5">
          {breakdown.map((item) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
            return (
              <div key={item.key} className="flex items-center gap-2.5 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-muted-foreground flex-1">{item.label}</span>
                <span className="font-semibold tabular-nums">{item.value.toLocaleString()}</span>
                <span className="text-muted-foreground w-9 text-right tabular-nums">{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>
      )}
    </Card>
  )
}
