"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Loader2, CheckCircle2, XCircle, AlertTriangle, ScanSearch } from 'lucide-react'
import { formatRelativeTime } from '@/lib/formatRelativeTime'

const VERDICT_ICON = {
  PASS: { Icon: CheckCircle2, className: 'text-emerald-500' },
  FAIL: { Icon: XCircle, className: 'text-red-500' },
  NEUTRAL: { Icon: AlertTriangle, className: 'text-amber-500' },
  PARTIAL: { Icon: AlertTriangle, className: 'text-amber-500' },
}

function humanize(value) {
  if (!value) return '—'
  return String(value).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

function ResultRow({ label, value }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5 truncate" title={typeof value === 'string' ? value : undefined}>{value ?? '—'}</p>
    </div>
  )
}

/**
 * Live, on-demand URL Inspection - real data from
 * POST /search-console/inspect-url (URL Inspection API). Not synced/stored:
 * each click inspects whatever URL is currently in the input.
 */
export default function UrlInspectionCard({ onInspect, isPending, result, error, defaultUrl = '' }) {
  const [url, setUrl] = useState(defaultUrl)

  function handleSubmit(e) {
    e.preventDefault()
    if (!url.trim() || isPending) return
    onInspect(url.trim())
  }

  const verdict = result?.verdict
  const verdictMeta = VERDICT_ICON[verdict] || { Icon: AlertTriangle, className: 'text-muted-foreground' }
  const VerdictIcon = verdictMeta.Icon

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">URL Inspection</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Check indexing &amp; crawl status for any URL</p>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/some-page"
          className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="submit" disabled={isPending || !url.trim()} className="gap-2 shrink-0">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {isPending ? 'Inspecting…' : 'Inspect'}
        </Button>
      </form>

      {error && (
        <p className="text-sm text-red-500 mt-3">{error}</p>
      )}

      {!result && !error && !isPending && (
        <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-10">
          <ScanSearch className="h-8 w-8 opacity-40" />
          <p className="text-sm">Enter a URL above and click Inspect to see its indexing status.</p>
        </div>
      )}

      {isPending && (
        <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Inspecting URL with Google…</p>
        </div>
      )}

      {result && !error && !isPending && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <VerdictIcon className={`h-5 w-5 ${verdictMeta.className}`} />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Index Status</p>
              <span className="text-sm font-semibold">{humanize(verdict)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <ResultRow label="Coverage State" value={humanize(result.coverage_state)} />
            <ResultRow label="Last Crawl" value={result.last_crawl_time ? formatRelativeTime(result.last_crawl_time) : '—'} />
            <ResultRow label="User Canonical" value={result.user_canonical || '—'} />
            <ResultRow label="Google Canonical" value={result.google_canonical || '—'} />
            <ResultRow label="Crawl Status" value={humanize(result.page_fetch_state)} />
            <ResultRow label="Mobile Usability" value={humanize(result.mobile_usability_verdict)} />
            <ResultRow label="Rich Results Eligibility" value={humanize(result.rich_results_verdict)} />
            <ResultRow label="Indexing State" value={humanize(result.indexing_state)} />
            <ResultRow label="Robots.txt" value={humanize(result.robots_txt_state)} />
            <ResultRow label="Crawled As" value={humanize(result.crawled_as)} />
          </div>
        </div>
      )}
    </Card>
  )
}
