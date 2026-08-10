"use client"

import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { useGoogleAdsSearchTerms } from '@/hooks/useDashboardQueries'
import GoogleAdsCardState from './GoogleAdsCardState'
import { formatNumber, formatPercent } from '@/lib/googleAdsFormat'
import { useGoogleAdsCurrencyFormatter } from '@/contexts/GoogleAdsCurrencyContext'

const ACTION_VARIANT = { add: 'success', negative: 'critical', watch: 'secondary' }
const ACTION_LABEL = { add: 'Add as keyword', negative: 'Add negative', watch: 'Monitor' }

/** Recent search queries that triggered ads, with a suggested next action - reads GET /google-ads/search-terms. */
export default function SearchTermsTable({ projectId, ready }) {
  const { format } = useGoogleAdsCurrencyFormatter()
  const { data, isLoading, isError, refetch } = useGoogleAdsSearchTerms(
    projectId,
    { limit: 25, sortBy: 'cost', sortOrder: -1 },
    { enabled: !!ready }
  )
  const rows = data?.data || []
  const status = isLoading ? 'loading' : isError ? 'error' : rows.length === 0 ? 'empty' : 'ready'

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Search Terms</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Recent queries triggering your ads</p>

      <div className="mt-4 overflow-x-auto">
        {status !== 'ready' ? (
          <GoogleAdsCardState status={status} icon={Search} message="No search terms collected." onRetry={refetch} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Search Term</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
                <TableHead>Suggested Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={`${t.ad_group_id}:${t.search_term}`}>
                  <TableCell className="font-medium">{t.search_term}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{formatNumber(t.metrics?.clicks)}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{formatPercent(t.metrics?.ctr)}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{format(t.metrics?.cost)}</TableCell>
                  <TableCell className="text-right tabular-nums font-mono">{formatNumber(t.metrics?.conversions)}</TableCell>
                  <TableCell>
                    {t.suggested_action ? (
                      <Badge variant={ACTION_VARIANT[t.suggested_action]}>{ACTION_LABEL[t.suggested_action]}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  )
}
