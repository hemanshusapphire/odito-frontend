"use client"

import { AlertTriangle, Loader2 } from 'lucide-react'

const PLATFORM_LABEL = { facebook: 'Facebook', instagram: 'Instagram' }

/**
 * Amber banner shown when a REAL connection blocks publishing — built from the
 * backend's account status (`attention`: [{ platform, reason: 'expired'|'permission' }]),
 * never from sample data. "Reconnect" starts the real Meta OAuth flow via
 * `onReconnect`; there is no fake confirmation step.
 */
export function ConnectionWarning({ attention, atRiskCount = 0, onReconnect, reconnecting = false }) {
  if (!attention || attention.length === 0) return null

  const names = attention.map((a) => PLATFORM_LABEL[a.platform] || a.platform)
  const expired = attention.some((a) => a.reason === 'expired')
  const title = atRiskCount > 0
    ? `${atRiskCount} scheduled ${atRiskCount === 1 ? 'post needs' : 'posts need'} attention`
    : 'A connection needs attention'
  const description = expired
    ? `${names.join(' and ')} connection expired. Reconnect to publish scheduled posts.`
    : `${names.join(' and ')} is missing publishing permission. Reconnect and approve it to publish scheduled posts.`

  return (
    <div role="alert" data-testid="connection-warning" className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-900">{title}</p>
          <p className="text-sm text-amber-700">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onReconnect}
        disabled={reconnecting}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {reconnecting && <Loader2 className="h-4 w-4 animate-spin" />}
        {reconnecting ? 'Redirecting…' : 'Reconnect'}
      </button>
    </div>
  )
}

export default ConnectionWarning
