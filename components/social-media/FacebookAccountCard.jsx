"use client"

import { Facebook, CircleCheck, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ACCOUNT_STATE } from '@/lib/socialMedia/accountViewModel'
import {
  AccountStatusBadge, AccountAvatar, AccountBodySkeleton, AccountErrorBody, ReconnectPanel, formatVerified,
} from './AccountParts'

/**
 * Facebook Page connection card. Every state is rendered from the backend's
 * real account status (`account` is the view model from
 * lib/socialMedia/accountViewModel.js): loading, error, not connected,
 * connected (healthy or missing publish permission), expired (reconnect).
 */
export function FacebookAccountCard({
  account, busy = {}, onConnect, onReconnect, onVerify, onDisconnect, onSwitchPage, onRetryStatus,
}) {
  const { state } = account
  const showProfile = state === ACCOUNT_STATE.CONNECTED || state === ACCOUNT_STATE.EXPIRED

  return (
    <div className="flex h-full flex-col rounded-2xl border border-blue-100 bg-blue-50/50 p-5" data-testid="facebook-account-card" data-state={state}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-white">
            <Facebook className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">Facebook Page</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Connect your Facebook Page to create and manage content with AI.
            </p>
          </div>
        </div>
        <AccountStatusBadge vm={account} />
      </div>

      {state === ACCOUNT_STATE.LOADING && <AccountBodySkeleton />}

      {state === ACCOUNT_STATE.ERROR && <AccountErrorBody onRetry={onRetryStatus} retrying={busy.refreshing} />}

      {state === ACCOUNT_STATE.NOT_CONNECTED && (
        <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-blue-200 bg-white text-[#1877F2]">
            <Facebook className="h-7 w-7" />
          </span>
          <h4 className="text-base font-bold text-slate-900">Connect your Facebook Page</h4>
          <p className="max-w-xs text-sm text-slate-500">
            You&apos;ll sign in with Facebook and choose which Page to connect.
          </p>
          <button
            type="button"
            onClick={onConnect}
            disabled={busy.connecting}
            className="mt-1 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy.connecting ? 'Redirecting…' : 'Connect Facebook'}
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      )}

      {showProfile && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
          <AccountAvatar vm={account} fallbackClass="bg-[#0b2a52]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800" title={account.name || undefined}>{account.name || 'Facebook Page'}</p>
            <p className="truncate text-xs text-slate-400">
              {[account.username && `@${account.username}`, account.category, formatVerified(account.lastVerifiedAt)].filter(Boolean).join(' · ')}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={busy.verifying || busy.disconnecting}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy.verifying ? <span className="inline-flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" />Verifying…</span> : 'Manage connection'}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 border-slate-200 bg-white text-slate-700 shadow-lg">
              {state === ACCOUNT_STATE.CONNECTED && (
                <>
                  <DropdownMenuItem onClick={onSwitchPage} className="text-sm focus:bg-violet-50 focus:text-violet-700">
                    Switch Page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onVerify} className="text-sm focus:bg-violet-50 focus:text-violet-700">
                    Verify connection
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={onDisconnect} className="text-sm text-red-500 focus:bg-red-50 focus:text-red-600">
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {state === ACCOUNT_STATE.EXPIRED && (
        <ReconnectPanel platformLabel="Facebook" onReconnect={onReconnect} reconnecting={busy.connecting} />
      )}

      {state === ACCOUNT_STATE.CONNECTED && !account.needsPermission && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5" data-testid="permissions-ok">
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-800">Publishing permission granted</p>
            <p className="mt-0.5 text-xs text-emerald-700/80">Odito can publish posts to this Page.</p>
          </div>
        </div>
      )}

      {state === ACCOUNT_STATE.CONNECTED && account.needsPermission && (
        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5" data-testid="permissions-missing">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-900">Publishing permission missing</p>
              <p className="mt-0.5 text-xs text-amber-800/90">
                This Page is connected but Facebook did not grant posting permission. Reconnect and approve it to publish.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onReconnect}
            disabled={busy.connecting}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy.connecting ? 'Redirecting…' : 'Reconnect Facebook'}
          </button>
        </div>
      )}
    </div>
  )
}

export default FacebookAccountCard
