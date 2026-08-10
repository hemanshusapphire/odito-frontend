"use client"

import { Card } from '@/components/ui/card'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { FileSearch } from 'lucide-react'

/**
 * Top Performing Pages, ranked by clicks - real page-level rows from
 * GET /search-console/data (SearchConsoleData, the `page`-dimension sync).
 * No "Indexed Status" column: Google's Search Analytics API doesn't return
 * per-page indexing status - use the URL Inspection tool below for that.
 */
export default function TopPagesTable({ rows = [], loading = false }) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Top Performing Pages</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Ranked by clicks</p>

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-10">
            <FileSearch className="h-8 w-8 opacity-40" />
            <p className="text-sm">No page performance data yet. Run "Sync Now" to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Landing Page</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Avg. Position</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.page_url}>
                  <TableCell className="max-w-xs truncate font-mono text-xs" title={row.page_url}>
                    {row.page_url}
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
