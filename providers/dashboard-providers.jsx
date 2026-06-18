"use client"

import { ProjectProvider } from "@/contexts/ProjectContext"

/**
 * Dashboard-scoped providers.
 * 
 * AuthProvider is in root layout (needed by login, signup, verify-email, etc.)
 * Only ProjectProvider is dashboard-scoped:
 * - Project list fetching
 * - Active project state
 * - WebSocket connection
 * 
 * Landing, pricing, login, signup pages skip ProjectProvider entirely.
 */
export function DashboardProviders({ children }) {
  return (
    <ProjectProvider>
      {children}
    </ProjectProvider>
  )
}
