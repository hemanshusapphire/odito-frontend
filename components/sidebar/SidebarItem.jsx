"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function SidebarItem({ item, isCollapsed = false }) {
  const pathname = usePathname()
  const isActive = pathname === item.href

  const content = (
    <Link
      href={item.href}
      className={cn(
        "group/item relative flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] font-medium transition-all duration-200 ease-out",
        "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-accent",
        isActive
          ? "bg-sidebar-active text-sidebar-active-foreground shadow-sidebar-active"
          : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-hover-foreground",
        isCollapsed && "justify-center px-2"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {/* Active indicator bar */}
      <AnimatePresence>
        {isActive && !isCollapsed && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-current"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <item.icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
          isActive
            ? "text-sidebar-active-foreground"
            : "text-sidebar-icon group-hover/item:text-sidebar-hover-foreground"
        )}
        strokeWidth={isActive ? 2.2 : 1.8}
      />

      {/* Label */}
      {!isCollapsed && (
        <motion.span
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          className="truncate"
        >
          {item.label}
        </motion.span>
      )}

      {/* Action button (e.g. + for Voices) */}
      {!isCollapsed && item.action === "add" && (
        <button
          className="ml-auto rounded-md p-0.5 text-sidebar-icon opacity-0 transition-opacity duration-200 hover:bg-sidebar-hover hover:text-sidebar-hover-foreground group-hover/item:opacity-100"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          aria-label={`Add ${item.label}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="7" y1="3" x2="7" y2="11" />
            <line x1="3" y1="7" x2="11" y2="7" />
          </svg>
        </button>
      )}
    </Link>
  )

  // When collapsed, wrap in tooltip
  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          className="bg-popover text-popover-foreground border border-border shadow-lg text-xs font-medium"
          sideOffset={8}
        >
          {item.label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}
