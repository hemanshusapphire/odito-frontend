"use client"

import { Card } from '@/components/ui/card'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { FileStack } from 'lucide-react'
import { formatRelativeTime } from '@/lib/formatRelativeTime'

function statusFor(sitemap) {
  if (sitemap.errors > 0) return { label: 'Error', className: 'bg-red-500/10 text-red-500' }
  if (sitemap.warnings > 0) return { label: 'Warning', className: 'bg-amber-500/10 text-amber-500' }
  if (sitemap.is_pending) return { label: 'Pending', className: 'bg-slate-500/10 text-slate-500' }
  return { label: 'Success', className: 'bg-emerald-500/10 text-emerald-500' }
}

function sumContents(contents, key) {
  return (contents || []).reduce((sum, c) => sum + (c[key] || 0), 0)
}

/**
 * Submitted sitemaps for the selected property - real data from
 * GET /search-console/sitemaps (Sitemaps API, live-fetched).
 */
export default function SitemapsTable({ sitemaps = [], loading = false }) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Sitemaps</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Submitted sitemap files</p>

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : sitemaps.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-8">
            <FileStack className="h-8 w-8 opacity-40" />
            <p className="text-sm">No sitemaps submitted for this property yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sitemap</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Discovered</TableHead>
                <TableHead className="text-right">Indexed</TableHead>
                <TableHead className="text-right">Last Read</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sitemaps.map((s) => {
                const status = statusFor(s)
                return (
                  <TableRow key={s.path}>
                    <TableCell className="max-w-xs truncate font-mono text-xs" title={s.path}>{s.path}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{sumContents(s.contents, 'submitted').toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{sumContents(s.contents, 'indexed').toLocaleString()}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {s.last_downloaded ? formatRelativeTime(s.last_downloaded) : (s.last_submitted ? formatRelativeTime(s.last_submitted) : '—')}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  )
}
