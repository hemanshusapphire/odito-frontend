"use client"

import { ElevenSidebar } from "@/components/sidebar/ElevenSidebar"
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

      <div className="flex min-h-screen w-full">
        <ElevenSidebar user={currentUser} />

        <div className="flex flex-1 flex-col min-w-0">
          {showHeader && <SiteHeader user={currentUser} {...headerProps} />}
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardLayout
