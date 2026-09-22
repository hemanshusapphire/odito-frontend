"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Menu, X, ChevronDown } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useAuth } from '@/contexts/AuthContext'
import { SOCIAL_MEDIA_NAV_ITEMS } from './socialMediaNav'
import { WorkspaceSelector } from './WorkspaceSelector'

const SIDEBAR_WIDTH = 260

function initialsFor(user) {
  const initials = `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`.toUpperCase()
  return initials || 'U'
}

function NavList({ pathname, onNavigate }) {
  return (
    <nav className="flex flex-col gap-0.5 px-3 py-2">
      {SOCIAL_MEDIA_NAV_ITEMS.map((item) => {
        const active = item.href === '/app/social-media' ? pathname === item.href : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-violet-50 text-violet-700'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-violet-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span className="truncate">{item.label}</span>
            {active && (
              <motion.span
                layoutId="social-media-sidebar-active-indicator"
                className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-violet-600"
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

/**
 * Standalone Social Media AI sidebar - deliberately independent from the
 * Audit sidebar (components/sidebar/ElevenSidebar.jsx) and from the
 * WordPress Management sidebar, same isolation pattern as
 * components/wordpress/WordPressSidebar.jsx. Swapped in by DashboardLayout
 * for any /app/social-media* route.
 */
export default function SocialMediaSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'

  const sidebarBody = (
    <div className="flex h-full flex-col bg-white">
      <div className="shrink-0 px-5 py-5">
        <Link href="/app/social-media" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold leading-tight tracking-tight text-slate-900">Social Media AI</span>
            <span className="block truncate text-xs text-slate-400">Create. Engage. Grow.</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        <NavList pathname={pathname} onNavigate={() => setMobileOpen(false)} />
      </div>

      <div className="shrink-0 space-y-3 border-t border-slate-100 px-3 py-4">
        <WorkspaceSelector variant="sidebar" />

        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-50"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
            {initialsFor(user)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-slate-800">{displayName}</span>
            <span className="block truncate text-xs text-slate-400">{user?.email || 'you@example.com'}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-40 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm md:hidden"
        aria-label="Open Social Media AI navigation"
      >
        <Menu className="h-4 w-4 text-slate-600" />
      </button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] bg-white p-0 [&>button]:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Social Media AI Navigation</SheetTitle>
            <SheetDescription>Navigate the Social Media AI module</SheetDescription>
          </SheetHeader>
          <div className="flex items-center justify-end px-3 pt-3">
            <button onClick={() => setMobileOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100">
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
        className="fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200 md:flex"
        style={{ width: SIDEBAR_WIDTH }}
      >
        {sidebarBody}
      </motion.aside>

      {/* Spacer to offset main content */}
      <div className="hidden shrink-0 md:block" style={{ width: SIDEBAR_WIDTH }} />
    </>
  )
}
