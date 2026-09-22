"use client"

import { Instagram, ExternalLink, CircleCheck } from 'lucide-react'

const ICON_BADGE_CLASS = 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white'

/** Instagram account connection card - empty state until connected, then mirrors FacebookAccountCard's layout. */
export function InstagramAccountCard({ account, onConnect, connecting }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-pink-100 bg-gradient-to-b from-pink-50/60 to-violet-50/40 p-5">
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
        <span
          className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
            account.connected
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 bg-white text-slate-500'
          }`}
        >
          {account.connected && <CircleCheck className="h-3.5 w-3.5" />}
          {account.connected ? 'Connected' : 'Not connected'}
        </span>
      </div>

      {account.connected ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${ICON_BADGE_CLASS}`}>
            S
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{account.name}</p>
            <p className="truncate text-xs text-slate-400">
              {account.handle} &middot; {account.followers}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-pink-200 bg-white text-[#DD2A7B]">
            <Instagram className="h-7 w-7" />
          </span>
          <h4 className="text-base font-bold text-slate-900">Connect your Instagram account</h4>
          <p className="max-w-xs text-sm text-slate-500">
            Get AI-powered content suggestions, hashtag recommendations and more.
          </p>
          <button
            type="button"
            onClick={onConnect}
            disabled={connecting}
            className="mt-1 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {connecting ? 'Connecting…' : 'Connect Instagram'}
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default InstagramAccountCard
