"use client"

import { useState } from 'react'
import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { WorkspaceSelector } from './WorkspaceSelector'

const NOTIFICATIONS = [
  { id: 'n1', text: '3 designs are waiting for your approval', time: '2h ago' },
  { id: 'n2', text: 'Instagram carousel was published successfully', time: '5h ago' },
  { id: 'n3', text: 'AI strategy insight refreshed for this month', time: '1d ago' },
]

/**
 * Top header for the Social Media AI module - deliberately its own, minimal
 * bar (workspace switcher + notifications) rather than the global
 * SiteHeader, which carries audit-tool-specific actions (Add project,
 * Export PDF) that don't apply here. Rendered by components/layout/
 * dashboard-layout.jsx as a sibling of SiteHeader (same flush,
 * outside-the-padding position) rather than from inside each page, so it
 * sits flush at the top with no gutter above it, exactly like SiteHeader
 * does everywhere else in the app.
 */
export function SocialMediaHeader() {
  const [hasUnread, setHasUnread] = useState(true)

  return (
    <header className="flex h-16 w-full shrink-0 items-center justify-end gap-3 border-b border-slate-200 bg-white px-4 lg:px-6">
      <WorkspaceSelector variant="header" />

      <DropdownMenu onOpenChange={(open) => open && setHasUnread(false)}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {hasUnread && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 border-slate-200 bg-white text-slate-700 shadow-lg">
          <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Notifications
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {NOTIFICATIONS.map((n) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 rounded-md py-2 text-sm focus:bg-violet-50">
              <span className="text-slate-700">{n.text}</span>
              <span className="text-xs text-slate-400">{n.time}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

export default SocialMediaHeader
