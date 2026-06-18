"use client"

import { useMemo, useState } from "react"
import { ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProject } from "@/contexts/ProjectContext"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function getProjectLabel(project) {
  return project?.project_name || project?.name || "Unknown"
}

function getProjectSubtitle(project) {
  const url = project?.main_url || project?.website_url || project?.url
  if (!url) return "Website project"
  try {
    const host = url.replace(/^https?:\/\//i, "").replace(/\/$/, "")
    return host.length > 40 ? `${host.slice(0, 38)}…` : host
  } catch {
    return url
  }
}

export function WorkspaceSwitcher({ isCollapsed = false }) {
  const { activeProject, projects, setActiveProject } = useProject()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filteredProjects = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return projects || []
    return (projects || []).filter((project) => {
      const name = getProjectLabel(project).toLowerCase()
      const subtitle = getProjectSubtitle(project).toLowerCase()
      return name.includes(term) || subtitle.includes(term)
    })
  }, [projects, query])

  if (!projects || projects.length === 0) return null

  const projectName = getProjectLabel(activeProject)
  const displayName =
    projectName.length > 24 ? `${projectName.slice(0, 22)}…` : projectName
  const initial = projectName.charAt(0).toUpperCase()

  const handleSelect = (project) => {
    setActiveProject(project)
    setOpen(false)
  }

  const triggerButton = (
    <PopoverTrigger asChild>
      <button
        type="button"
        className={cn(
          "workspace-switcher-trigger group/ws flex w-full items-center gap-2.5 rounded-[10px] border text-left outline-none",
          "border-[color-mix(in_srgb,var(--sidebar-foreground)_14%,transparent)]",
          "bg-[color-mix(in_srgb,var(--sidebar-foreground)_4%,var(--sidebar))]",
          "shadow-[inset_0_1px_0_color-mix(in_srgb,var(--sidebar-foreground)_6%,transparent)]",
          "transition-[border-color,background-color,box-shadow] duration-200",
          "hover:border-[color-mix(in_srgb,var(--sidebar-foreground)_24%,transparent)]",
          "hover:bg-[color-mix(in_srgb,var(--sidebar-foreground)_6%,var(--sidebar))]",
          "focus-visible:ring-2 focus-visible:ring-sidebar-ring/40 focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar",
          "data-[state=open]:border-[color-mix(in_srgb,var(--sidebar-ring)_55%,transparent)]",
          "data-[state=open]:bg-[color-mix(in_srgb,var(--sidebar-foreground)_7%,var(--sidebar))]",
          "data-[state=open]:shadow-[0_2px_10px_rgba(0,0,0,0.18)]",
          isCollapsed ? "justify-center p-2" : "h-10 px-2.5 py-0"
        )}
        aria-label="Switch project"
        aria-expanded={open}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-[8px] border font-semibold",
            "border-[color-mix(in_srgb,var(--sidebar-foreground)_12%,transparent)]",
            "bg-[color-mix(in_srgb,var(--sidebar-foreground)_8%,transparent)] text-sidebar-foreground",
            isCollapsed ? "h-8 w-8 text-sm" : "h-7 w-7 text-xs"
          )}
        >
          {initial}
        </div>

        {!isCollapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold leading-none text-sidebar-foreground">
              {displayName}
            </span>
            <ChevronsUpDown
              className="h-4 w-4 shrink-0 text-sidebar-foreground/55 transition-colors group-hover/ws:text-sidebar-foreground/80 group-data-[state=open]/ws:text-sidebar-foreground"
              strokeWidth={2}
              aria-hidden
            />
          </>
        )}
      </button>
    </PopoverTrigger>
  )

  return (
    <div
      className={cn(
        "shrink-0  border-sidebar-border",
        isCollapsed ? "px-2 py-2" : "px-3 py-2.5"
      )}
    >
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setQuery("")
        }}
      >
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>{triggerButton}</TooltipTrigger>
            <TooltipContent side="right" sideOffset={8} className="bg-popover text-popover-foreground text-xs font-medium border border-border">
              {displayName}
            </TooltipContent>
          </Tooltip>
        ) : (
          triggerButton
        )}

        <PopoverContent
          align="start"
          side={isCollapsed ? "right" : "bottom"}
          sideOffset={6}
          collisionPadding={12}
          className={cn(
            "z-[200] w-[min(340px,calc(100vw-2rem))] rounded-lg border !p-1",
            "border-border",
            "bg-popover text-popover-foreground shadow-[0_8px_28px_rgba(0,0,0,0.15)]"
          )}
        >
          <div className="relative mb-1 px-1 pt-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sidebar-muted"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              autoFocus
              className={cn(
                "h-8 w-full rounded-md border bg-transparent pl-8 pr-2 text-[12px] text-sidebar-foreground outline-none",
                "border-[color-mix(in_srgb,var(--sidebar-foreground)_14%,transparent)]",
                "placeholder:text-sidebar-muted",
                "focus-visible:border-[color-mix(in_srgb,var(--sidebar-ring)_55%,transparent)] focus-visible:ring-2 focus-visible:ring-sidebar-ring/30"
              )}
            />
          </div>

          <div className="flex max-h-65 flex-col gap-px overflow-y-auto scrollbar-hidden">
            {filteredProjects.length === 0 && (
              <div className="px-2 py-3 text-center text-[12px] text-sidebar-muted">
                No projects found
              </div>
            )}
            {filteredProjects.map((project) => {
              const name = getProjectLabel(project)
              const subtitle = getProjectSubtitle(project)
              const isSelected = activeProject?._id === project._id

              return (
                <button
                  key={project._id}
                  type="button"
                  onClick={() => handleSelect(project)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                    "outline-none hover:bg-[color-mix(in_srgb,var(--sidebar-foreground)_6%,transparent)]",
                    "focus-visible:ring-2 focus-visible:ring-sidebar-ring/30",
                    isSelected &&
                    "bg-[color-mix(in_srgb,var(--sidebar-foreground)_8%,transparent)]"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold",
                      "border-[color-mix(in_srgb,var(--sidebar-foreground)_12%,transparent)]",
                      "bg-[color-mix(in_srgb,var(--sidebar-foreground)_8%,transparent)] text-sidebar-foreground"
                    )}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-0">
                    <span className="truncate text-[12px] font-semibold leading-snug text-sidebar-foreground">
                      {name}
                    </span>
                    <span className="truncate text-[10px] leading-snug text-sidebar-muted">
                      {subtitle}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
