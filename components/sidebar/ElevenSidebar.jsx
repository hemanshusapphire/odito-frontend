"use client"

import { useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useSidebarStore } from "./sidebar-store"
import { SidebarHeader } from "./SidebarHeader"
import { WorkspaceSwitcher } from "./WorkspaceSwitcher"
import { SidebarNav } from "./SidebarNav"
import { SidebarFooter } from "./SidebarFooter"
import { sidebarSections } from "./sidebar-config"
import { useIsMobile } from "@/hooks/use-mobile"
import { useProject } from "@/contexts/ProjectContext"

const SIDEBAR_WIDTH = 260
const SIDEBAR_COLLAPSED_WIDTH = 64

export function ElevenSidebar({ user }) {
  const { isCollapsed, isMobileOpen, toggleCollapse, setMobileOpen } =
    useSidebarStore()
  const isMobile = useIsMobile()
  const { activeProject } = useProject()

  const visibleSections = sidebarSections.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      item.id === "pre-audit" ? !!activeProject?.pre_audit_id : true
    ),
  }))

  // Keyboard shortcut: Ctrl/Cmd + B to toggle
  const handleKeyDown = useCallback(
    (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault()
        if (isMobile) {
          setMobileOpen(!isMobileOpen)
        } else {
          toggleCollapse()
        }
      }
    },
    [isMobile, isMobileOpen, toggleCollapse, setMobileOpen]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Sticky top: Header + Workspace Switcher */}
      <div className="shrink-0">
        <SidebarHeader isCollapsed={!isMobile && isCollapsed} />
        <WorkspaceSwitcher isCollapsed={!isMobile && isCollapsed} />
      </div>

      {/* Scrollable middle: Navigation */}
      <div className="eleven-sidebar-scroll scrollbar-hidden flex-1 overflow-y-auto overflow-x-hidden">
        <SidebarNav
          sections={visibleSections}
          isCollapsed={!isMobile && isCollapsed}
        />
      </div>

      {/* Sticky bottom: Footer */}
      <div className="shrink-0">
        <SidebarFooter
          isCollapsed={!isMobile && isCollapsed}
          user={user}
        />
      </div>
    </div>
  )

  // Mobile: Sheet/drawer
  if (isMobile) {
    return (
      <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-[280px] sidebar-surface p-0 [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Main navigation sidebar</SheetDescription>
          </SheetHeader>
          <TooltipProvider delayDuration={0}>
            {sidebarContent}
          </TooltipProvider>
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: Fixed sidebar
  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        className={cn(
          "eleven-sidebar fixed inset-y-0 left-0 z-30 flex flex-col sidebar-surface",
          "hidden md:flex"
        )}
        initial={false}
        animate={{
          width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Spacer to push main content */}
      <motion.div
        className="hidden shrink-0 md:block"
        initial={false}
        animate={{
          width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
      />
    </TooltipProvider>
  )
}
