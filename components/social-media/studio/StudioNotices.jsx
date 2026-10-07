"use client"

import Link from 'next/link'
import { AlertTriangle, FileText, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

/** Nothing has been written for this post (or this plan item) yet: the studio has no content to design for. */
export function StudioNoContent({ children, message = 'Content has not been generated yet.', detail = 'Creative Studio designs the approved content of a post. Generate the content first, then come back to create its design.' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm" data-testid="studio-no-content">
      <FileText className="mx-auto h-8 w-8 text-slate-300" strokeWidth={1.5} aria-hidden />
      <p className="mt-3 text-base font-semibold text-slate-800">{message}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{detail}</p>
      {children && <div className="mt-5 flex flex-wrap items-center justify-center gap-3">{children}</div>}
    </div>
  )
}

/** The approval gate, in the server's words: designs are only made for approved content. */
export function StudioGateNotice({ message }) {
  return (
    <div role="status" className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between" data-testid="studio-gate">
      <div>
        <p className="text-sm font-semibold text-amber-900" data-testid="studio-gate-message">{message || 'Content approval required before creating the design.'}</p>
        <p className="mt-0.5 text-sm text-amber-800/80">Approve the caption first; the designs are made for exactly the words that were approved.</p>
      </div>
      <Link href="/app/social-media/content-approvals" className="inline-flex shrink-0 items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700">Review Content</Link>
    </div>
  )
}

export function StudioLoading() {
  return (
    <div className="space-y-4" data-testid="studio-loading" aria-busy="true">
      <Skeleton className="h-6 w-64 bg-slate-200" aria-label="Loading Creative Studio" />
      <Skeleton className="h-36 rounded-2xl bg-slate-200" />
      <div className="grid grid-cols-1 gap-4 @min-[900px]/main:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="aspect-[3/2] rounded-2xl bg-slate-200" />)}</div>
    </div>
  )
}

/** A refused or failed request, with the server's message and a way to retry. Never a made-up fallback. */
export function StudioError({ title = 'Something went wrong', message, onRetry, onDismiss, retrying = false, testId = 'studio-error' }) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between" data-testid={testId}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-red-700">{title}</p>
          <p className="mt-0.5 text-sm text-red-600/90" data-testid={`${testId}-message`}>{message}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {onRetry && (
          <button type="button" onClick={onRetry} disabled={retrying} data-testid={`${testId}-retry`} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">
            {retrying && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}Try again
          </button>
        )}
        {onDismiss && <button type="button" onClick={onDismiss} className="rounded-lg px-2.5 py-2 text-sm font-medium text-red-600 hover:bg-red-100">Dismiss</button>}
      </div>
    </div>
  )
}
