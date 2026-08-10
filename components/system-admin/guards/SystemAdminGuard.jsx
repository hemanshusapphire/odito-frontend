"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

/**
 * Route guard for the System Admin console. Pattern mirrors
 * components/guards/AuthGuard.jsx (wait for auth to finish loading, redirect
 * via useEffect, never render children until authorized) but checks
 * roleId === 1 instead of email verification / project existence.
 *
 * This is a UX convenience only — the real security boundary is the
 * backend's requireSystemAdmin() middleware on every System Admin API route.
 * A non-admin who bypasses this guard still gets 401/403 from the backend.
 *
 * Non-admins are redirected to /dashboard (not an "access denied" page) so
 * the existence of this console is not confirmed to regular users.
 */
export function SystemAdminGuard({ children }) {
  const { isAuthenticated, isLoading, isInitialized, user } = useAuth()
  const router = useRouter()

  const isSystemAdmin = user?.roleId === 1

  useEffect(() => {
    if (!isInitialized || isLoading) return

    if (!isAuthenticated) {
      router.replace("/login")
      return
    }

    if (!isSystemAdmin) {
      router.replace("/app/dashboard")
    }
  }, [isInitialized, isLoading, isAuthenticated, isSystemAdmin, router])

  // Never render System Admin UI before authorization completes.
  if (!isInitialized || isLoading || !isAuthenticated || !isSystemAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground text-sm">Verifying access...</p>
        </div>
      </div>
    )
  }

  return children
}
