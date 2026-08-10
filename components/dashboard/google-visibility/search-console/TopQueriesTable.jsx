"use client"

import { Card } from '@/components/ui/card'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Search } from 'lucide-react'

/**
 * Top Search Queries, ranked by clicks - real query-level rows from
 * GET /search-console/breakdown?dimension=query (SearchConsoleBreakdown).
 * Mirrors TopPagesTable.jsx.
 */
export default function TopQueriesTable({ rows = [], loading = false }) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Top Search Queries</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Ranked by clicks</p>

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-10">
            <Search className="h-8 w-8 opacity-40" />
            <p className="text-sm">No query data yet. Run "Sync Now" to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Query</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Avg. Position</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.dimension_value}>
                  <TableCell className="max-w-xs truncate" title={row.dimension_value}>
                    {row.dimension_value}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.clicks.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.impressions.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{(row.ctr * 100).toFixed(2)}%</TableCell>
                  <TableCell className="text-right tabular-nums">{row.position.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  )
}
