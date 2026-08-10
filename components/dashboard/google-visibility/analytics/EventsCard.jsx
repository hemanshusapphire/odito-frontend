"use client"

import { Card } from '@/components/ui/card'
import { Zap } from 'lucide-react'
import AnalyticsTable, { TrendValue } from './AnalyticsTable'

const COLUMNS = [
  { key: 'name', label: 'Event Name', render: (row) => <span className="font-mono text-muted-foreground">{row.name}</span> },
  { key: 'count', label: 'Count', align: 'right', render: (row) => row.count.toLocaleString() },
  { key: 'users', label: 'Users', align: 'right', render: (row) => row.users.toLocaleString() },
  { key: 'trend', label: 'Trend', align: 'right', render: (row) => <TrendValue value={row.trend} direction={row.trendDirection} /> },
]

/** Most frequent GA4 events for the selected range. */
export default function EventsCard({ events = [], loading = false, rangeLabel = 'the selected period' }) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Events</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Most frequent events, {rangeLabel}</p>
      <div className="mt-4">
        <AnalyticsTable
          columns={COLUMNS}
          rows={events}
          rowKey="name"
          loading={loading}
          emptyIcon={Zap}
          emptyMessage="No event data yet."
        />
      </div>
    </Card>
  )
}
