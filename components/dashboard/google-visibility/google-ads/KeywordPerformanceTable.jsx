"use client"

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Key } from 'lucide-react'
import { useGoogleAdsKeywords } from '@/hooks/useDashboardQueries'
import GoogleAdsCardState from './GoogleAdsCardState'
import { formatNumber, formatPercent } from '@/lib/googleAdsFormat'
import { useGoogleAdsCurrencyFormatter } from '@/contexts/GoogleAdsCurrencyContext'

function qualityScoreVariant(score) {
  if (score >= 8) return 'success'
  if (score >= 5) return 'warning'
  return 'critical'
}

function titleCase(value) {
  if (!value) return '—'
  return value.charAt(0) + value.slice(1).toLowerCase()
}

/** Top keywords by cost, last 30 days - reads GET /google-ads/keywords (see Phase 6.4). */
export default function KeywordPerformanceTable({ projectId, ready }) {
  const { format, formatPrecise } = useGoogleAdsCurrencyFormatter()
  const [search, setSearch] = useState('')

  const { data, isLoading, isError, refetch } = useGoogleAdsKeywords(
    projectId,
    { limit: 50, sortBy: 'cost', sortOrder: -1 },
    { enabled: !!ready }
  )
  const keywords = data?.data || []

  const rows = useMemo(
    () => keywords.filter((k) => (k.keyword_text || '').toLowerCase().includes(search.toLowerCase())),
    [keywords, search]
  )

  const status = isLoading ? 'loading' : isError ? 'error' : keywords.length === 0 ? 'empty' : 'ready'

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Keyword Performance</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Top keywords by cost</p>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords..."
            className="h-8 w-44 pl-8 text-xs"
          />
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        {status !== 'ready' ? (
          <GoogleAdsCardState status={status} icon={Key} message="No keywords collected yet." onRetry={refetch} />
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-10">
            <Key className="h-8 w-8 opacity-40" />
            <p className="text-sm">No keywords match your search.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Keyword</TableHead>
                <TableHead>Match Type</TableHead>
                <TableHead className="text-right">Quality Score</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">CPC</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((k) => (
                <TableRow key={`${k.ad_group_id}:${k.criterion_id}`}>
                  <TableCell className="font-medium">{k.keyword_text}</TableCell>
                  <TableCell className="text-muted-foreground">{titleCase(k.match_type)}</TableCell>
                  <TableCell className="text-right">
                    {k.quality_score != null ? (
                      <Badge variant={qualityScoreVariant(k.quality_score)} className="font-mono">{k.quality_score}/10</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{formatNumber(k.metrics?.clicks)}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{formatPercent(k.metrics?.ctr)}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{formatPrecise(k.metrics?.avg_cpc)}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{formatNumber(k.metrics?.conversions)}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{format(k.metrics?.cost)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {status === 'ready' && (
        <div className="mt-3 text-[11.5px] text-muted-foreground">
          Showing {rows.length} of {keywords.length} keywords
        </div>
      )}
    </Card>
  )
}
