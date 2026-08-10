"use client"

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, LayoutGrid } from 'lucide-react'
import { useGoogleAdsCampaigns } from '@/hooks/useDashboardQueries'
import GoogleAdsCardState from './GoogleAdsCardState'
import { formatNumber, formatPercent, formatMultiplier, formatRangeLabel } from '@/lib/googleAdsFormat'
import { useGoogleAdsCurrencyFormatter } from '@/contexts/GoogleAdsCurrencyContext'

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'ENABLED', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
]

const STATUS_VARIANT = { ENABLED: 'success', PAUSED: 'secondary', REMOVED: 'critical' }
const STATUS_LABEL = { ENABLED: 'Active', PAUSED: 'Paused', REMOVED: 'Removed' }

const COLUMNS = [
  { key: 'name', label: 'Campaign' },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'type', label: 'Type', sortable: false },
  { key: 'budget', label: 'Budget', num: true },
  { key: 'spend', label: 'Spend', num: true },
  { key: 'clicks', label: 'Clicks', num: true },
  { key: 'ctr', label: 'CTR', num: true },
  { key: 'cpc', label: 'CPC', num: true },
  { key: 'conversions', label: 'Conversions', num: true },
  { key: 'roas', label: 'ROAS', num: true },
]

function channelLabel(type) {
  if (!type) return '—'
  return type.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
}

/** Campaign Overview: search + status filter + client-side sortable table over the real, currently-synced campaign list. */
export default function CampaignOverviewTable({ projectId, dateRange, ready }) {
  const { format, formatPrecise } = useGoogleAdsCurrencyFormatter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState({ key: null, dir: 1 })

  const { data, isLoading, isError, refetch } = useGoogleAdsCampaigns(
    projectId,
    { page: 1, limit: 100, dateRange },
    { enabled: !!ready }
  )
  const campaigns = useMemo(() => (data?.data || []).map((c) => ({
    id: c.campaign_id,
    name: c.name,
    status: c.status,
    type: channelLabel(c.channel_type),
    budget: c.budget?.amount ?? null,
    spend: c.metrics?.cost ?? 0,
    clicks: c.metrics?.clicks ?? 0,
    ctr: c.metrics?.ctr ?? 0,
    cpc: c.metrics?.avgCpc ?? 0,
    conversions: c.metrics?.conversions ?? 0,
    roas: c.metrics?.roas ?? 0,
  })), [data])

  const rows = useMemo(() => {
    let out = campaigns.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = status === 'all' || c.status === status
      return matchesSearch && matchesStatus
    })
    if (sort.key) {
      out = [...out].sort((a, b) => (a[sort.key] > b[sort.key] ? 1 : -1) * sort.dir)
    }
    return out
  }, [campaigns, search, status, sort])

  function toggleSort(key) {
    setSort((prev) => ({ key, dir: prev.key === key ? -prev.dir : 1 }))
  }

  const queryStatus = isLoading ? 'loading' : isError ? 'error' : campaigns.length === 0 ? 'empty' : 'ready'

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Campaign Overview</h3>
          <p className="text-xs text-muted-foreground mt-0.5">All campaigns &middot; {formatRangeLabel(dateRange)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/40 border rounded-full p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatus(f.value)}
                className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
                  status === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="h-8 w-44 pl-8 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        {queryStatus !== 'ready' ? (
          <GoogleAdsCardState
            status={queryStatus}
            icon={LayoutGrid}
            message="No campaign activity during this date range."
            onRetry={refetch}
          />
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-10">
            <LayoutGrid className="h-8 w-8 opacity-40" />
            <p className="text-sm">No campaigns match your filters.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {COLUMNS.map((col) => (
                  <TableHead
                    key={col.key}
                    className={`${col.num ? 'text-right' : ''} ${col.sortable === false ? '' : 'cursor-pointer select-none'}`}
                    onClick={col.sortable === false ? undefined : () => toggleSort(col.key)}
                  >
                    {col.label}
                    {sort.key === col.key && <span className="ml-1 opacity-60">{sort.dir > 0 ? '▲' : '▼'}</span>}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">{c.type}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[c.status] || 'secondary'} className="capitalize">
                      {STATUS_LABEL[c.status] || c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.type}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{c.budget != null ? `${format(c.budget)}/day` : '—'}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{format(c.spend)}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{formatNumber(c.clicks)}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{formatPercent(c.ctr)}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{formatPrecise(c.cpc)}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{formatNumber(c.conversions)}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{formatMultiplier(c.roas)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {queryStatus === 'ready' && (
        <div className="flex items-center justify-between mt-3 text-[11.5px] text-muted-foreground">
          <span>Showing {rows.length} of {campaigns.length} campaigns</span>
        </div>
      )}
    </Card>
  )
}
