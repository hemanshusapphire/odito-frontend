"use client"

import { Card } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import AnalyticsTable from './AnalyticsTable'

// Backed by the legacy per-page endpoint (GET .../analytics/data,
// AnalyticsData model) rather than a Phase 1-3 endpoint - its rows only
// carry pagePath/sessions/activeUsers/pageViews/engagementRate. The
// planned metric expansion (per-page bounce rate, conversions) was never
// built (see Phase 4's Technical Debt Remaining), so those columns are
// intentionally absent here rather than showing fabricated values.
const COLUMNS = [
  { key: 'pagePath', label: 'Landing Page', render: (row) => <span className="font-mono text-muted-foreground">{row.pagePath}</span> },
  { key: 'pageViews', label: 'Views', align: 'right', render: (row) => row.pageViews.toLocaleString() },
  { key: 'activeUsers', label: 'Users', align: 'right', render: (row) => row.activeUsers.toLocaleString() },
  { key: 'engagementRate', label: 'Engagement Rate', align: 'right', render: (row) => `${(row.engagementRate * 100).toFixed(1)}%` },
]

/** Highest-traffic landing pages for the selected range. */
export default function TopPagesCard({ pages = [], loading = false, rangeLabel = 'the selected period' }) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Top Pages</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Highest-traffic landing pages, {rangeLabel}</p>
      <div className="mt-4">
        <AnalyticsTable
          columns={COLUMNS}
          rows={pages}
          rowKey="pagePath"
          loading={loading}
          emptyIcon={FileText}
          emptyMessage="No page data yet."
        />
      </div>
    </Card>
  )
}
