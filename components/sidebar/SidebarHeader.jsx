"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { PanelLeftClose, PanelLeft } from "lucide-react"
import { useSidebarStore } from "./sidebar-store"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function SidebarHeader({ isCollapsed = false }) {
  const toggleCollapse = useSidebarStore((s) => s.toggleCollapse)

  return (
    <div
      className={cn(
        "flex items-center  border-sidebar-border px-4 py-2",
        isCollapsed ? "justify-center px-2" : "justify-between"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
        <Image
          src="/oditologo.png"
          alt="Odito AI"
          width={isCollapsed ? 28 : 100}
          height={28}
          className="object-contain"
          priority
        />
      </div>

      {/* Collapse toggle button */}
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <button
            onClick={toggleCollapse}
            className={cn(
              "hidden rounded-md p-1.5 text-sidebar-icon transition-colors duration-200 hover:bg-sidebar-hover hover:text-sidebar-hover-foreground md:flex",
              isCollapsed && "mx-auto mt-2"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="bg-popover text-popover-foreground border border-border text-xs">
          {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
