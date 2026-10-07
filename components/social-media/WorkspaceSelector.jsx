"use client"

import { Building2, ChevronDown, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProject } from '@/contexts/ProjectContext'

/**
 * Workspace switcher trigger - reused in both the top header (compact,
 * bordered pill) and the sidebar footer (full-width row). In Odito a
 * "workspace" is the user's PROJECT: this lists the user's real projects and
 * switches the active one through ProjectContext (the same mechanism the rest
 * of the app uses), which is what scopes every social API call. Ownership is
 * re-validated by the backend on every request.
 */
export function WorkspaceSelector({ variant = 'header', className = '' }) {
  const { activeProject, projects = [], setActiveProject, isLoading } = useProject()
  const isSidebar = variant === 'sidebar'
  const name = activeProject?.project_name || (isLoading ? 'Loading…' : 'No project')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-testid="workspace-selector"
          className={
            isSidebar
              ? `flex w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left transition-colors hover:bg-slate-50 ${className}`
              : `flex max-w-[16rem] items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm shadow-sm transition-colors hover:bg-slate-50 ${className}`
          }
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-600">
            <Building2 className="h-3.5 w-3.5" />
          </span>
          <span className={isSidebar ? 'min-w-0 flex-1' : 'min-w-0'}>
            <span className="block truncate text-sm font-medium text-slate-800">{name}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isSidebar ? 'start' : 'end'} className="max-h-72 w-64 overflow-y-auto border-slate-200 bg-white text-slate-700 shadow-lg">
        {projects.length === 0 && (
          <DropdownMenuItem disabled className="text-sm text-slate-400">No projects yet</DropdownMenuItem>
        )}
        {projects.map((project) => (
          <DropdownMenuItem
            key={project._id}
            onClick={() => setActiveProject?.(project)}
            className="rounded-md text-sm focus:bg-violet-50 focus:text-violet-700"
          >
            <Building2 className="h-4 w-4 text-slate-400" />
            <span className="min-w-0 flex-1 truncate">{project.project_name}</span>
            {project._id === activeProject?._id && <Check className="h-4 w-4 text-violet-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default WorkspaceSelector
