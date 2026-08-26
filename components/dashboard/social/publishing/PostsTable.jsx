"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Search, MoreVertical, Trash2, FileText, Loader2, Send, Pencil, Ban } from 'lucide-react'
import StatusBadge from './StatusBadge'
import FailureDetails, { NOT_RETRYABLE_CODES } from './FailureDetails'
import FeedPagination from '../feeds/FeedPagination'
import EditPostDialog from './EditPostDialog'
import CancelPostConfirmDialog from './CancelPostConfirmDialog'
import DeletePostConfirmDialog from './DeletePostConfirmDialog'
import { platformConfig } from '@/lib/socialFeedsDummyData'
import { useProject } from '@/contexts/ProjectContext'
import { useSocialPublishing, useDeleteSocialPost, usePublishSocialPost, useUpdateSocialPost, useCancelSocialPost } from '@/hooks/useDashboardQueries'
import { formatInTimezone } from '@/lib/scheduleTime'

const ALL = '__all__'
const PAGE_SIZE = 8
const STATUS_OPTIONS = ['draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled']
const PLATFORM_OPTIONS = [{ id: 'facebook', name: 'Facebook' }, { id: 'instagram', name: 'Instagram' }]
const PUBLISHABLE_STATUSES = new Set(['draft', 'scheduled', 'failed'])
// Matches the backend's own DELETABLE_STATUSES in socialPublishingService.js
// — a published post's Odito record can now be deleted too (removes only
// the SocialPublication document; the real Facebook/Instagram post is
// untouched, since no code path here or on the backend ever reaches back
// out to Meta to delete it). Only 'publishing' — the brief in-flight
// window while an actual publish attempt is running — stays undeletable.
const DELETABLE_STATUSES = new Set(['draft', 'scheduled', 'failed', 'cancelled', 'published'])
// Matches the backend's own EDITABLE_STATUSES/CANCELLABLE_STATUSES in
// socialPublishingService.js — a post already publishing/published/failed
// can't be edited or cancelled there, so these menu items are hidden
// rather than shown-then-409ing.
const EDITABLE_STATUSES = new Set(['draft', 'scheduled'])
const CANCELLABLE_STATUSES = new Set(['draft', 'scheduled'])

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// scheduledAt is stored as a real absolute UTC instant; when the record
// also carries the IANA zone the user scheduled it in, display it back in
// THAT zone rather than the viewer's own browser timezone — otherwise a
// post scheduled for "11:30 AM Asia/Kolkata" would show as some other
// local hour to a viewer in a different timezone, which reads as wrong
// even though the underlying instant is correct.
function formatScheduledDate(post) {
  if (!post.scheduledAt) return '—'
  return formatInTimezone(post.scheduledAt, post.timezone) || formatDateTime(post.scheduledAt)
}

/** Real posts table: every SocialPublication for the project, server-side search/platform/status filters + pagination. */
export default function PostsTable({ notify }) {
  const { activeProjectId } = useProject()
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const [editingPost, setEditingPost] = useState(null)
  const [cancellingPost, setCancellingPost] = useState(null)
  const [deletingPost, setDeletingPost] = useState(null)

  const filters = { search: search || undefined, platform: platform || undefined, status: status || undefined, sort: 'newest', page, limit: PAGE_SIZE }
  const query = useSocialPublishing(activeProjectId, filters)
  const deleteMutation = useDeleteSocialPost(activeProjectId)
  const publishMutation = usePublishSocialPost(activeProjectId)
  const updateMutation = useUpdateSocialPost(activeProjectId)
  const cancelMutation = useCancelSocialPost(activeProjectId)

  const result = query.data?.data
  const posts = result?.data || []
  const pagination = result?.pagination || { page: 1, totalPages: 1 }

  function updateFilter(setter, value) {
    setter(value)
    setPage(1)
  }

  async function handlePublishNow(post) {
    try {
      const res = await publishMutation.mutateAsync(post.id)
      if (res?.data?.publishError) {
        notify?.(res.data.publishError.message || 'Meta rejected this post.', 'error')
      } else {
        notify?.('Post published.', 'success')
      }
    } catch (err) {
      notify?.(err?.message || 'Failed to publish this post.', 'error')
    }
  }

  // Opens the confirmation dialog rather than deleting immediately — a
  // published Facebook post's Delete now attempts a REAL Meta DELETE
  // first (see socialPublishingService.js's deletePublication), so the
  // user must see and accept that explicitly, not just have it happen on
  // a single click.
  function handleDelete(post) {
    setDeletingPost(post)
  }

  async function handleConfirmDelete() {
    if (!deletingPost) return
    // Only meaningful for a published Instagram post (the platform with
    // no supported external-delete path at all) — DeletePostConfirmDialog
    // itself decides whether to show the "Remove from Odito history"
    // wording/action for exactly this case, so the request sent here must
    // match what the user actually saw and confirmed.
    const historyOnly = deletingPost.status === 'published' && deletingPost.platform === 'instagram'
    try {
      await deleteMutation.mutateAsync({ publicationId: deletingPost.id, historyOnly })
      notify?.(historyOnly ? 'Removed from Odito history.' : 'Post deleted', 'success')
      setDeletingPost(null)
    } catch (err) {
      // Deliberately does NOT close the dialog/clear deletingPost — a
      // failed external deletion (e.g. Meta rejected the DELETE) must
      // keep the post visible and the user informed, not silently
      // disappear the confirmation as if something succeeded.
      notify?.(err?.message || 'Failed to delete this post.', 'error')
    }
  }

  // Returns false on failure so EditPostDialog keeps itself open with the
  // user's edits intact (same open-on-failure contract CreatePostDialog
  // already uses) — saves through the EXISTING update mutation/PATCH
  // endpoint; no new backend logic here.
  async function handleSaveEdit(publicationId, updates) {
    try {
      await updateMutation.mutateAsync({ publicationId, updates })
      notify?.('Post updated.', 'success')
      return true
    } catch (err) {
      notify?.(err?.message || 'Failed to save changes.', 'error')
      return false
    }
  }

  async function handleConfirmCancel() {
    if (!cancellingPost) return
    try {
      await cancelMutation.mutateAsync(cancellingPost.id)
      notify?.('Post cancelled.', 'success')
      setCancellingPost(null)
    } catch (err) {
      notify?.(err?.message || 'Failed to cancel this post.', 'error')
    }
  }

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => updateFilter(setSearch, e.target.value)} placeholder="Search posts..." className="pl-9 h-9 text-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={platform || ALL} onValueChange={(v) => updateFilter(setPlatform, v === ALL ? '' : v)}>
            <SelectTrigger className="h-9 w-auto min-w-[130px] text-xs"><SelectValue placeholder="Platform" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Platform</SelectItem>
              {PLATFORM_OPTIONS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status || ALL} onValueChange={(v) => updateFilter(setStatus, v === ALL ? '' : v)}>
            <SelectTrigger className="h-9 w-auto min-w-[130px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Status</SelectItem>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
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
            <FileText className="h-8 w-8 opacity-40" />
            <p className="text-sm">No posts match your filters.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14" />
                <TableHead>Platform</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Scheduled Date</TableHead>
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
                      {Icon && (
                        <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${p.color}18`, color: p.color }}>
                          <Icon className="h-4 w-4" />
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p?.name || post.platform}</TableCell>
                    <TableCell className="max-w-xs truncate font-medium">{post.content?.trim() || '(No text)'}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap text-xs">{formatScheduledDate(post)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={post.status} />
                        <FailureDetails post={post} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {PUBLISHABLE_STATUSES.has(post.status) && (
                            post.status === 'failed' && NOT_RETRYABLE_CODES.has(post.failureCode) ? (
                              <DropdownMenuItem disabled className="gap-2" title="Reconnect this account (or fix the media URL) before retrying — retrying now would fail the same way.">
                                <Send className="h-4 w-4" />
                                Reconnect Required
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handlePublishNow(post)} className="gap-2">
                                <Send className="h-4 w-4" />
                                {post.status === 'failed' ? 'Retry Publish' : 'Publish Now'}
                              </DropdownMenuItem>
                            )
                          )}
                          {EDITABLE_STATUSES.has(post.status) && (
                            <DropdownMenuItem onClick={() => setEditingPost(post)} className="gap-2">
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {CANCELLABLE_STATUSES.has(post.status) && (
                            <DropdownMenuItem onClick={() => setCancellingPost(post)} className="gap-2">
                              <Ban className="h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                          {(PUBLISHABLE_STATUSES.has(post.status) || EDITABLE_STATUSES.has(post.status)) && <DropdownMenuSeparator />}
                          <DropdownMenuItem
                            onClick={() => handleDelete(post)}
                            variant="destructive"
                            className="gap-2"
                            disabled={!DELETABLE_STATUSES.has(post.status)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <FeedPagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />

      <EditPostDialog
        post={editingPost}
        projectId={activeProjectId}
        open={!!editingPost}
        onOpenChange={(next) => { if (!next) setEditingPost(null) }}
        onSave={handleSaveEdit}
      />

      <CancelPostConfirmDialog
        post={cancellingPost}
        open={!!cancellingPost}
        onOpenChange={(next) => { if (!next) setCancellingPost(null) }}
        onConfirm={handleConfirmCancel}
        loading={cancelMutation.isPending}
      />

      <DeletePostConfirmDialog
        post={deletingPost}
        open={!!deletingPost}
        onOpenChange={(next) => { if (!next) setDeletingPost(null) }}
        onConfirm={handleConfirmDelete}
        loading={deleteMutation.isPending}
      />
    </Card>
  )
}
