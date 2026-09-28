"use client"

import { usePathname } from "next/navigation"
import { ElevenSidebar } from "@/components/sidebar/ElevenSidebar"
import SocialMediaSidebar from "@/components/social-media/SocialMediaSidebar"
import { SocialMediaHeader } from "@/components/social-media/SocialMediaHeader"
import { SiteHeader } from "@/components/site-header"
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'

export function DashboardLayout({
  children,
  user,
  headerProps = {},
  showHeader = true
}) {
  const { user: authUser, isLoading } = useAuth()
  const { isSwitchingProject } = useProject()
  const pathname = usePathname()
  // Social Media AI is a separate, frontend-only mock module (see
  // components/social-media/**) with its own sidebar AND its own header
  // (SocialMediaHeader, rendered right here as SiteHeader's sibling so it
  // sits flush at the top the same way SiteHeader does everywhere else -
  // rendering it from inside {children} instead left an awkward gutter
  // above it, since {children} sits inside padded wrapper divs that
  // SiteHeader itself is never subject to). The global SiteHeader carries
  // audit-tool-specific actions (Add project, Export PDF) that don't apply
  // here, so it's swapped out entirely rather than reused. This module
  // always renders on its own light background, independent of the
  // dashboard's dark/light theme toggle, since it's a deliberately
  // distinct visual identity, not the audit tool.
  const isSocialMediaModule = pathname?.startsWith('/app/social-media')
  
  // Use auth user if no user prop provided (preferred approach)
  const currentUser = user || authUser
  
  // Show loading skeleton if auth is still loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full">
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="h-8 w-8 bg-muted rounded"></div>
            <div className="h-4 w-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 🔒 PHASE 4: Full-screen project switching overlay */}
      {isSwitchingProject && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <p className="text-base font-medium text-muted-foreground animate-pulse">
              Switching project…
            </p>
          </div>
        </div>
      )}

      <div className={`flex min-h-screen w-full ${isSocialMediaModule ? 'bg-[#f7f7fb]' : ''}`}>
        {isSocialMediaModule ? (
          <SocialMediaSidebar />
        ) : (
          <ElevenSidebar user={currentUser} />
        )}

        <div className="flex flex-1 flex-col min-w-0">
          {showHeader && (isSocialMediaModule ? <SocialMediaHeader /> : <SiteHeader user={currentUser} {...headerProps} />)}
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardLayout
