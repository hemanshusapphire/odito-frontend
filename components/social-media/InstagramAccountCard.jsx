"use client"

import { Instagram, ExternalLink, CircleCheck, AlertTriangle, Loader2 } from 'lucide-react'
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

const ICON_BADGE_CLASS = 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white'

const ACCOUNT_TYPE_LABEL = { business: 'Business account', professional: 'Professional account', page: 'Page' }

/**
 * Instagram professional account card. Instagram is not connected on its own:
 * it is discovered through the connected Facebook Page (the backend reads the
 * Page's linked Instagram Business account). So the "not connected" body adapts
 * to the REAL Facebook state:
 *   Facebook not connected -> "Connect Instagram" starts the Meta sign-in
 *   Facebook expired       -> reconnect Facebook first
 *   Facebook connected     -> "Check for linked account" re-runs discovery
 */
export function InstagramAccountCard({
  account, facebook, busy = {}, discoveryMessage = null, onConnect, onCheck, onReconnect, onVerify, onDisconnect, onRetryStatus,
}) {
  const { state } = account
  const showProfile = state === ACCOUNT_STATE.CONNECTED || state === ACCOUNT_STATE.EXPIRED
  const facebookConnected = facebook?.state === ACCOUNT_STATE.CONNECTED
  const facebookExpired = facebook?.state === ACCOUNT_STATE.EXPIRED

  return (
    <div className="flex h-full flex-col rounded-2xl border border-pink-100 bg-gradient-to-b from-pink-50/60 to-violet-50/40 p-5" data-testid="instagram-account-card" data-state={state}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ICON_BADGE_CLASS}`}>
            <Instagram className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900">Instagram Professional Account</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Connect your Instagram professional account to create and manage content with AI.
            </p>
          </div>
        </div>
        <AccountStatusBadge vm={account} />
      </div>

      {state === ACCOUNT_STATE.LOADING && <AccountBodySkeleton />}

      {state === ACCOUNT_STATE.ERROR && <AccountErrorBody onRetry={onRetryStatus} retrying={busy.refreshing} />}

      {state === ACCOUNT_STATE.NOT_CONNECTED && (
        <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-pink-200 bg-white text-[#DD2A7B]">
            <Instagram className="h-7 w-7" />
          </span>
          <h4 className="text-base font-bold text-slate-900">Connect your Instagram account</h4>
          <p className="max-w-xs text-sm text-slate-500">
            {facebookConnected
              ? 'Instagram professional accounts connect through your Facebook Page. Link it to this Page in Meta, then check again.'
              : facebookExpired
                ? 'Reconnect your Facebook Page first — your Instagram account is found through it.'
                : 'Get AI-powered content suggestions, hashtag recommendations and more.'}
          </p>
          {discoveryMessage && (
            <p role="status" className="max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">{discoveryMessage}</p>
          )}
          {facebookConnected ? (
            <button
              type="button"
              onClick={onCheck}
              disabled={busy.checking}
              className="mt-1 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busy.checking && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy.checking ? 'Checking…' : 'Check for linked account'}
            </button>
          ) : facebookExpired ? (
            <button
              type="button"
              onClick={onReconnect}
              disabled={busy.connecting}
              className="mt-1 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busy.connecting ? 'Redirecting…' : 'Reconnect Facebook'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              disabled={busy.connecting}
              className="mt-1 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busy.connecting ? 'Redirecting…' : 'Connect Instagram'}
              <ExternalLink className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {showProfile && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
          <AccountAvatar vm={account} fallbackClass={ICON_BADGE_CLASS} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800" title={account.name || undefined}>{account.name || account.username || 'Instagram account'}</p>
            <p className="truncate text-xs text-slate-400">
              {[account.username && `@${account.username}`, ACCOUNT_TYPE_LABEL[account.accountType], formatVerified(account.lastVerifiedAt)].filter(Boolean).join(' · ')}
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
        <ReconnectPanel platformLabel="Instagram" onReconnect={onReconnect} reconnecting={busy.connecting}>
          Instagram uses your Facebook Page&apos;s connection, which has expired or was revoked. Reconnect to publish again.
        </ReconnectPanel>
      )}

      {state === ACCOUNT_STATE.CONNECTED && !account.needsPermission && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5" data-testid="permissions-ok">
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-800">Publishing permission granted</p>
            <p className="mt-0.5 text-xs text-emerald-700/80">Odito can publish posts to this account.</p>
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
                Instagram publishing permission was not granted. Reconnect and approve it to publish.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onReconnect}
            disabled={busy.connecting}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy.connecting ? 'Redirecting…' : 'Reconnect'}
          </button>
        </div>
      )}
    </div>
  )
}

export default InstagramAccountCard
