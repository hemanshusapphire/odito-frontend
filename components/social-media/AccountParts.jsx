"use client"

import { CircleCheck, AlertTriangle, Loader2 } from 'lucide-react'
import { DateTime } from 'luxon'
import { Skeleton } from '@/components/ui/skeleton'
import { normalizeImageUrl } from '@/lib/security/sanitize'
import { ACCOUNT_STATE, accountStatusLabel } from '@/lib/socialMedia/accountViewModel'

/** "3 minutes ago" / "Never verified" for a backend ISO timestamp. */
export function formatVerified(iso) {
  if (!iso) return 'Not verified yet'
  const dt = DateTime.fromISO(String(iso))
  if (!dt.isValid) return 'Not verified yet'
  return `Verified ${dt.toRelative() || dt.toLocaleString(DateTime.DATETIME_MED)}`
}

/** Status pill used in both account cards' headers. Colors follow the backend state, not a prop. */
export function AccountStatusBadge({ vm }) {
  const label = accountStatusLabel(vm)
  const tone = vm.state === ACCOUNT_STATE.CONNECTED && !vm.needsPermission
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : vm.state === ACCOUNT_STATE.EXPIRED || (vm.state === ACCOUNT_STATE.CONNECTED && vm.needsPermission)
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : vm.state === ACCOUNT_STATE.ERROR
        ? 'border-red-200 bg-red-50 text-red-600'
        : 'border-slate-200 bg-white text-slate-500'
  return (
    <span data-testid={`${vm.platform}-status-badge`} className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {vm.state === ACCOUNT_STATE.CONNECTED && !vm.needsPermission && <CircleCheck className="h-3.5 w-3.5" />}
      {(vm.state === ACCOUNT_STATE.EXPIRED || (vm.state === ACCOUNT_STATE.CONNECTED && vm.needsPermission)) && <AlertTriangle className="h-3.5 w-3.5" />}
      {vm.state === ACCOUNT_STATE.LOADING && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {label}
    </span>
  )
}

/** Profile image from the backend (a Meta CDN URL) with an initial fallback — never a made-up image. */
export function AccountAvatar({ vm, fallbackClass }) {
  const src = normalizeImageUrl(vm.picture)
  const initial = (vm.name || vm.username || '?').trim().charAt(0).toUpperCase()
  return (
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white ${fallbackClass}`}>
      {src ? <img src={src} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : initial}
    </span>
  )
}

/** Placeholder body shown while the status request is in flight (same height as a connected body). */
export function AccountBodySkeleton() {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5" aria-busy="true" aria-label="Loading account">
      <Skeleton className="h-11 w-11 shrink-0 rounded-full bg-slate-200" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/5 bg-slate-200" />
        <Skeleton className="h-3 w-3/5 bg-slate-100" />
      </div>
    </div>
  )
}

/** Inline error body with a retry action, used when the status request itself failed. */
export function AccountErrorBody({ onRetry, retrying }) {
  return (
    <div role="alert" className="mt-4 flex flex-col items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5">
      <p className="text-sm font-semibold text-red-700">Couldn&apos;t load this connection</p>
      <p className="text-xs text-red-600/90">The connection status could not be loaded from Odito. Nothing was changed.</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {retrying ? 'Retrying…' : 'Try again'}
      </button>
    </div>
  )
}

/** Amber "reconnect required" panel shown for an EXPIRED connection. */
export function ReconnectPanel({ platformLabel, onReconnect, reconnecting, children }) {
  return (
    <div className="mt-3 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5" data-testid="reconnect-panel">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-900">Reconnect {platformLabel}</p>
          <p className="mt-0.5 text-xs text-amber-800/90">
            {children || 'This connection has expired or was revoked in Meta. Posts cannot be published until you reconnect.'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onReconnect}
        disabled={reconnecting}
        className="inline-flex w-fit items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {reconnecting && <Loader2 className="h-4 w-4 animate-spin" />}
        {reconnecting ? 'Redirecting…' : `Reconnect ${platformLabel}`}
      </button>
    </div>
  )
}
