"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, History, RotateCcw, Loader2 } from 'lucide-react'
import StatusBadge from './StatusBadge'
import FailureDetails, { NOT_RETRYABLE_CODES } from './FailureDetails'
import FeedPagination from '../feeds/FeedPagination'
import { platformConfig } from '@/lib/socialFeedsDummyData'
import { useProject } from '@/contexts/ProjectContext'
import { useSocialPublishing, usePublishSocialPost } from '@/hooks/useDashboardQueries'

const ALL = '__all__'
const PAGE_SIZE = 8
const HISTORY_STATUSES = ['published', 'failed']

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

/**
 * Past publishing activity — real published/failed SocialPublication
 * records only. There is no engagement-metrics tracking on this model
 * yet (reach/likes/comments/shares were entirely fabricated in the
 * previous dummy version) — removed rather than shown as fake numbers.
 * Retry re-attempts a REAL Meta publish via the same publishNow endpoint
 * a failed post's status came from.
 */
export default function PostHistoryTable({ notify }) {
  const { activeProjectId } = useProject()
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const [recentQuery] = useState({ sort: 'newest', page: 1, limit: 6 })
  const recentActivity = useSocialPublishing(activeProjectId, recentQuery)

  const filters = { search: search || undefined, platform: platform || undefined, status: status || undefined, sort: 'newest', page, limit: PAGE_SIZE }
  const query = useSocialPublishing(activeProjectId, { ...filters, status: filters.status || undefined })
  const publishMutation = usePublishSocialPost(activeProjectId)

  // Both queries deliberately show only real published/failed records —
  // if no status filter is chosen, still narrow to history statuses on
  // the CLIENT since the backend's status filter is single-value, not a
  // whitelist; this tab is specifically "past activity", not everything.
  const historyPosts = (recentActivity.data?.data?.data || []).filter((p) => HISTORY_STATUSES.includes(p.status))
  const posts = (query.data?.data?.data || []).filter((p) => HISTORY_STATUSES.includes(p.status) || (status && p.status === status))
  const pagination = query.data?.data?.pagination || { page: 1, totalPages: 1 }

  function updateFilter(setter, value) {
    setter(value)
    setPage(1)
  }

  async function handleRetry(post) {
    try {
      const res = await publishMutation.mutateAsync(post.id)
      if (res?.data?.publishError) {
        notify?.(res.data.publishError.message || 'Meta rejected this post again.', 'error')
      } else {
        notify?.('Post published.', 'success')
      }
    } catch (err) {
      notify?.(err?.message || 'Failed to retry this post.', 'error')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
        {historyPosts.length === 0 ? (
          <p className="text-xs text-muted-foreground">No publishing activity yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {historyPosts.slice(0, 6).map((post, i) => (
              <li key={post.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${post.status === 'failed' ? 'bg-destructive' : 'bg-emerald-500'}`} />
                  {i < historyPosts.length - 1 && i < 5 && <span className="w-px flex-1 bg-border mt-1.5" />}
                </div>
                <div className="pb-0.5 min-w-0">
                  <p className="text-xs text-foreground leading-relaxed truncate">{post.content?.trim() || '(No text)'}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{formatDateTime(post.publishedAt || post.failedAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
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
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status || ALL} onValueChange={(v) => updateFilter(setStatus, v === ALL ? '' : v)}>
              <SelectTrigger className="h-9 w-auto min-w-[130px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Status</SelectItem>
                {HISTORY_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {query.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-14 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : posts.length === 0 ? (
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
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => {
                  const p = platformConfig(post.platform)
                  const Icon = p?.icon
                  return (
                    <TableRow key={post.id}>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          {Icon && <Icon className="h-3.5 w-3.5" style={{ color: p.color }} />}
                          {p?.name || post.platform}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate font-medium">{post.content?.trim() || '(No text)'}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap text-xs">{formatDateTime(post.publishedAt || post.failedAt)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={post.status} />
                          <FailureDetails post={post} />
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.status === 'failed' && (
                          NOT_RETRYABLE_CODES.has(post.failureCode) ? (
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled title="Reconnect this account (or fix the media URL) before retrying — retrying now would fail the same way.">
                              <RotateCcw className="h-4 w-4 opacity-40" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRetry(post)} disabled={publishMutation.isPending}>
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>

        <FeedPagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
      </Card>
    </div>
  )
}
