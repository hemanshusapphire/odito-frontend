"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, DatabaseBackup, Puzzle, Palette, Users, ArrowLeft, Menu, X,
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/app/wordpress', icon: LayoutDashboard },
  { label: 'Backups', href: '/app/wordpress/backups', icon: DatabaseBackup },
  { label: 'Plugins', href: '/app/wordpress/plugins', icon: Puzzle },
  { label: 'Themes', href: '/app/wordpress/themes', icon: Palette },
  { label: 'Users', href: '/app/wordpress/users', icon: Users },
]

const SIDEBAR_WIDTH = 248

function NavList({ pathname, onNavigate }) {
  return (
    <nav className="flex flex-col gap-0.5 px-3 py-2">
      {NAV_ITEMS.map((item) => {
        const active = item.href === '/app/wordpress' ? pathname === item.href : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-sidebar-active text-sidebar-active-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-hover-foreground'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
            {active && (
              <motion.span
                layoutId="wp-sidebar-active-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary"
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

/**
 * Standalone WordPress Management sidebar - deliberately independent from
 * the Audit sidebar (components/sidebar/ElevenSidebar.jsx): its own nav
 * items, its own active-state logic, its own mobile drawer state. Swapped
 * in by DashboardLayout for any /app/wordpress* route.
 */
export default function WordPressSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarBody = (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-4 py-4 border-b border-sidebar-border">
        <Link href="/app/dashboard" className="inline-flex items-center gap-1.5 text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors mb-3">
          <ArrowLeft className="h-3 w-3" />
          Back to Odito
        </Link>
        <h2 className="text-base font-bold text-sidebar-foreground tracking-tight">WordPress Management</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <NavList pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-40 flex h-9 w-9 items-center justify-center rounded-lg border bg-card shadow-sm"
        aria-label="Open WordPress Management navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[260px] p-0 sidebar-surface [&>button]:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>WordPress Management Navigation</SheetTitle>
            <SheetDescription>Navigate the WordPress Management module</SheetDescription>
          </SheetHeader>
          <div className="flex items-center justify-end px-3 pt-3">
            <button onClick={() => setMobileOpen(false)} className="h-7 w-7 flex items-center justify-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-hover">
              <X className="h-4 w-4" />
            </button>
          </div>
          {sidebarBody}
        </SheetContent>
      </Sheet>

      {/* Desktop fixed sidebar */}
      <motion.aside
        initial={{ x: -SIDEBAR_WIDTH, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden md:flex fixed inset-y-0 left-0 z-30 flex-col sidebar-surface"
        style={{ width: SIDEBAR_WIDTH }}
      >
        {sidebarBody}
      </motion.aside>

      {/* Spacer to offset main content */}
      <div className="hidden md:block shrink-0" style={{ width: SIDEBAR_WIDTH }} />
    </>
  )
}
