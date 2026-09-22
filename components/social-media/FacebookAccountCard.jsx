"use client"

import { Facebook, CircleCheck } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/** Connected-state card for the Facebook Page connection. */
export function FacebookAccountCard({ account, onDisconnect, onSwitchPage }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
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
        <span className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <CircleCheck className="h-3.5 w-3.5" />
          Connected
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0b2a52] text-sm font-bold text-white">
          S
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">{account.name}</p>
          <p className="truncate text-xs text-slate-400">
            {account.handle} &middot; {account.followers}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Manage connection
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 border-slate-200 bg-white text-slate-700 shadow-lg">
            <DropdownMenuItem onClick={onSwitchPage} className="text-sm focus:bg-violet-50 focus:text-violet-700">
              Switch Page
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDisconnect} className="text-sm text-red-500 focus:bg-red-50 focus:text-red-600">
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {account.permissionsGranted && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5">
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-800">All required permissions granted</p>
            <p className="mt-0.5 text-xs text-emerald-700/80">{account.permissionsNote}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacebookAccountCard
