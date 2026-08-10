"use client"

import { Card } from '@/components/ui/card'
import { Radio } from 'lucide-react'
import AnalyticsTable from './AnalyticsTable'

// No Trend column: the backend's channel breakdown (analyticsService.js's
// getAnalyticsBreakdowns) is a single dateRange, by design - a per-channel
// trend would need the same 2-dateRanges technique the Events endpoint
// uses, deliberately left out of the Phase 2 backend since the widget spec
// didn't call for it there. Showing a fabricated trend here would violate
// "no fake data" - this column is simply absent until a backend phase adds it.
const COLUMNS = [
  {
    key: 'channel',
    label: 'Channel',
    render: (row) => (
      <div className="flex items-center gap-2 font-medium">
        <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: row.color }} />
        {row.label}
      </div>
    ),
  },
  { key: 'users', label: 'Users', align: 'right', render: (row) => row.users.toLocaleString() },
  { key: 'sessions', label: 'Sessions', align: 'right', render: (row) => row.sessions.toLocaleString() },
  { key: 'engagement', label: 'Engagement', align: 'right', render: (row) => `${(row.engagementRate * 100).toFixed(1)}%` },
  { key: 'conversions', label: 'Conversions', align: 'right', render: (row) => row.conversions.toLocaleString() },
]

/**
 * Channels ranked by users, last selected range. Thin wrapper around
 * AnalyticsTable with this card's specific column set.
 */
export default function TopChannelsCard({ channels = [], loading = false, rangeLabel = 'the selected period' }) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Top Channels</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Ranked by users, {rangeLabel}</p>
      <div className="mt-4">
        <AnalyticsTable
          columns={COLUMNS}
          rows={channels}
          rowKey="key"
          loading={loading}
          emptyIcon={Radio}
          emptyMessage="No channel data yet."
        />
      </div>
    </Card>
  )
}
