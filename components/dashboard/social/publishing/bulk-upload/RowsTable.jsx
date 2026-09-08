"use client"

import { useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatInTimezone } from '@/lib/scheduleTime'
import { useBulkUploadRows } from '@/hooks/useBulkUpload'
import RowStatusPill from './RowStatusPill'

const PAGE_LIMIT = 50

const PREVIEW_FILTERS = [
  { value: '', label: 'All' },
  { value: 'valid', label: 'Valid' },
  { value: 'invalid', label: 'Invalid' },
]
const RESULT_FILTERS = [
  { value: '', label: 'All' },
  { value: 'imported', label: 'Imported' },
  { value: 'failed', label: 'Failed' },
]

function RowErrors({ errors }) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }
  return (
    <ul className="space-y-1">
      {errors.map((e, i) => (
        <li key={i} className="flex flex-col">
          <span className="inline-flex w-fit items-center rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
            {e.field ? `${e.field}: ${e.code}` : e.code}
          </span>
          {/* Message is rendered verbatim from the backend — never re-worded here. */}
          <span className="text-xs text-muted-foreground leading-snug">{e.message}</span>
        </li>
      ))}
    </ul>
  )
}

function Content({ text }) {
  const value = text || ''
  return (
    <span className="block max-w-[22rem] truncate" title={value}>
      {value || <span className="text-muted-foreground">—</span>}
    </span>
  )
}

/**
 * Server-paginated view of SocialImportRow records for one batch. Used in
 * both the Review step (variant="preview") and the Results step
 * (variant="result"). Rows are fetched 50 at a time (the backend cap);
 * nothing renders all 200 at once and there is no polling.
 */
export default function RowsTable({ projectId, batchId, variant, summary }) {
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)

  const filters = variant === 'result' ? RESULT_FILTERS : PREVIEW_FILTERS
  const params = useMemo(() => ({ status: filter || undefined, page, limit: PAGE_LIMIT }), [filter, page])
  const query = useBulkUploadRows(projectId, batchId, params)

  const rows = query.data?.data || []
  const pagination = query.data?.pagination || { page: 1, pages: 1, total: 0 }
  const loading = query.isLoading
  const fetching = query.isFetching

  function changeFilter(next) {
    setFilter(next)
    setPage(1)
  }

  const filterCount = (value) => {
    if (!summary) return null
    if (value === '') return summary.total ?? null
    return summary[value] ?? null
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter rows">
        {filters.map((f) => {
          const count = filterCount(f.value)
          const active = filter === f.value
          return (
            <Button
              key={f.value || 'all'}
              type="button"
              size="sm"
              variant={active ? 'default' : 'outline'}
              aria-pressed={active}
              onClick={() => changeFilter(f.value)}
            >
              {f.label}
              {count !== null && count !== undefined ? ` (${count})` : ''}
            </Button>
          )
        })}
        <span className="ml-auto text-xs text-muted-foreground" aria-live="polite">
          {fetching && !loading ? 'Updating…' : `${pagination.total} row${pagination.total === 1 ? '' : 's'}`}
        </span>
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="w-14">Row</TableHead>
              {variant === 'preview' ? (
                <>
                  <TableHead scope="col">Platform</TableHead>
                  <TableHead scope="col">Content</TableHead>
                  <TableHead scope="col">Action</TableHead>
                  <TableHead scope="col">Media</TableHead>
                  <TableHead scope="col">Scheduled at</TableHead>
                  <TableHead scope="col">Timezone</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col">Errors</TableHead>
                </>
              ) : (
                <>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col">Publication</TableHead>
                  <TableHead scope="col">Errors</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={variant === 'preview' ? 9 : 4}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={variant === 'preview' ? 9 : 4} className="py-8 text-center text-sm text-muted-foreground">
                  No rows to show.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const n = row.normalized || {}
                const muted = row.status === 'invalid' || row.status === 'failed'
                return (
                  <TableRow key={row.rowNumber} className={muted ? 'bg-destructive/5' : undefined}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{row.rowNumber}</TableCell>
                    {variant === 'preview' ? (
                      <>
                        <TableCell className="capitalize">{n.platform || <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell className="whitespace-normal"><Content text={n.content} /></TableCell>
                        <TableCell className="capitalize">{n.action || '—'}</TableCell>
                        <TableCell className="text-xs">
                          {Array.isArray(n.media) && n.media.length > 0
                            ? `${n.media.length} file${n.media.length === 1 ? '' : 's'}`
                            : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-xs">
                          {n.scheduledAt ? (formatInTimezone(n.scheduledAt, n.timezone) || '—') : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-xs">{n.timezone || <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell><RowStatusPill status={row.status} /></TableCell>
                        <TableCell className="whitespace-normal min-w-[16rem]"><RowErrors errors={row.errors} /></TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell><RowStatusPill status={row.status} /></TableCell>
                        <TableCell className="font-mono text-[11px] text-muted-foreground">
                          {row.publicationId || row.publication_id || <span>—</span>}
                        </TableCell>
                        <TableCell className="whitespace-normal min-w-[16rem]"><RowErrors errors={row.errors} /></TableCell>
                      </>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span aria-live="polite">Page {pagination.page} of {pagination.pages}</span>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" disabled={page <= 1 || fetching} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={page >= pagination.pages || fetching} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
