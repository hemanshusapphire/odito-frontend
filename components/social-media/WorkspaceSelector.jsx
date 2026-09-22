"use client"

import { Building2, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { WORKSPACE } from '@/lib/socialMediaAIDummyData'

/**
 * Workspace switcher trigger - reused in both the top header (compact,
 * bordered pill) and the sidebar footer (full-width row). Single workspace
 * for now (frontend-only mock), so the menu just reflects the active one.
 */
export function WorkspaceSelector({ variant = 'header', className = '' }) {
  const isSidebar = variant === 'sidebar'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={
            isSidebar
              ? `flex w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left transition-colors hover:bg-slate-50 ${className}`
              : `flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm shadow-sm transition-colors hover:bg-slate-50 ${className}`
          }
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-600">
            <Building2 className="h-3.5 w-3.5" />
          </span>
          <span className={isSidebar ? 'min-w-0 flex-1' : 'min-w-0'}>
            <span className="block truncate text-sm font-medium text-slate-800">{WORKSPACE.name}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isSidebar ? 'start' : 'end'} className="w-64 border-slate-200 bg-white text-slate-700 shadow-lg">
        <DropdownMenuItem className="rounded-md text-sm focus:bg-violet-50 focus:text-violet-700">
          <Building2 className="h-4 w-4 text-slate-400" />
          {WORKSPACE.name}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default WorkspaceSelector
