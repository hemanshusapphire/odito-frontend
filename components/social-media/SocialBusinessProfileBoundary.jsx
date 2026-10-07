"use client"

import { Skeleton } from '@/components/ui/skeleton'
import { describeApiError } from '@/lib/socialMedia/failureMessages'

/**
 * Loading / error / no-project shell around the Social business profile query,
 * shared by Connect Accounts and Settings so both behave identically.
 * `children(data)` receives `{ resolvedProfile, editableProfile, googleStatus }`.
 */
export function SocialBusinessProfileBoundary({ projectId, query, children }) {
  if (!projectId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm" data-testid="profile-no-project">
        <p className="text-sm font-semibold text-slate-700">No project selected</p>
        <p className="mt-1 text-sm text-slate-400">Select a project to see and edit its business profile.</p>
      </div>
    )
  }

  if (query.isLoading) {
    return (
      <div className="space-y-4" data-testid="profile-loading" aria-busy="true">
        <Skeleton className="h-24 rounded-2xl bg-slate-200" aria-label="Loading business profile" />
        <Skeleton className="h-64 rounded-2xl bg-slate-200" />
      </div>
    )
  }

  if (query.isError && !query.data) {
    return (
      <div role="alert" className="flex flex-col items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-8 text-center" data-testid="profile-error">
        <p className="text-sm font-semibold text-red-700">Couldn&apos;t load your business profile</p>
        <p className="max-w-md text-sm text-red-600/90">{describeApiError(query.error, 'The request to Odito failed. Nothing was changed.').message}</p>
        <button
          type="button"
          onClick={() => query.refetch()}
          disabled={query.isFetching}
          className="mt-1 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {query.isFetching ? 'Retrying…' : 'Try again'}
        </button>
      </div>
    )
  }

  if (!query.data) return null
  return children(query.data)
}

export default SocialBusinessProfileBoundary
