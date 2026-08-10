"use client"

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, History, RotateCcw } from 'lucide-react'
import StatusBadge from './StatusBadge'
import FeedMetrics from '../feeds/FeedMetrics'
import FeedPagination from '../feeds/FeedPagination'
import { PUBLISHING_POSTS, PUBLISHING_PLATFORMS, historyMetricsFor } from '@/lib/publishingDummyData'

const ALL = '__all__'
const PAGE_SIZE = 8
const HISTORY_STATUSES = ['Published', 'Failed']

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

/** Past publishing activity: a recent-activity timeline + a full searchable/filterable table. */
export default function PostHistoryTable({ onRetry }) {
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const historyPosts = useMemo(
    () => PUBLISHING_POSTS
      .filter((p) => HISTORY_STATUSES.includes(p.status))
      .map((p) => ({ ...p, metrics: historyMetricsFor(p) }))
      .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt)),
    []
  )

  const filtered = useMemo(() => historyPosts.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    if (platform && p.platform !== platform) return false
    if (status && p.status !== status) return false
    return true
  }), [historyPosts, search, platform, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function updateFilter(setter, value) {
    setter(value)
    setPage(1)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
        <ul className="flex flex-col gap-4">
          {historyPosts.slice(0, 6).map((post, i) => (
            <li key={post.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${post.status === 'Failed' ? 'bg-destructive' : 'bg-emerald-500'}`} />
                {i < 5 && <span className="w-px flex-1 bg-border mt-1.5" />}
              </div>
              <div className="pb-0.5 min-w-0">
                <p className="text-xs text-foreground leading-relaxed truncate">{post.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{formatDateTime(post.scheduledAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => updateFilter(setSearch, e.target.value)} placeholder="Search history..." className="pl-9 h-9 text-sm" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={platform || ALL} onValueChange={(v) => updateFilter(setPlatform, v === ALL ? '' : v)}>
              <SelectTrigger className="h-9 w-auto min-w-[130px] text-xs"><SelectValue placeholder="Platform" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Platform</SelectItem>
                {PUBLISHING_PLATFORMS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status || ALL} onValueChange={(v) => updateFilter(setStatus, v === ALL ? '' : v)}>
              <SelectTrigger className="h-9 w-auto min-w-[130px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Status</SelectItem>
                {HISTORY_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {pageItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-14">
              <History className="h-8 w-8 opacity-40" />
              <p className="text-sm">No history matches your filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Published Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reach</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((post) => {
                  const p = PUBLISHING_PLATFORMS.find((pl) => pl.id === post.platform)
                  const Icon = p.icon
                  return (
                    <TableRow key={post.id}>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Icon className="h-3.5 w-3.5" style={{ color: p.color }} />
                          {p.name}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate font-medium">{post.title}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap text-xs">{formatDateTime(post.scheduledAt)}</TableCell>
                      <TableCell><StatusBadge status={post.status} /></TableCell>
                      <TableCell className="tabular-nums font-mono text-xs text-muted-foreground">{post.metrics.reach.toLocaleString()}</TableCell>
                      <TableCell><FeedMetrics metrics={post.metrics} keys={['likes', 'comments', 'shares']} /></TableCell>
                      <TableCell>
                        {post.status === 'Failed' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRetry(post)}>
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>

        <FeedPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </Card>
    </div>
  )
}
