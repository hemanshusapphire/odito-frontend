"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

/**
 * Dashboard-wide error boundary.
 * 
 * Catches errors in any dashboard route and shows a recovery UI.
 * The dashboard shell (sidebar + header) remains visible.
 */
export default function DashboardError({ error, reset }) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md space-y-4">
        <div className="mx-auto w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground text-sm">
          {error?.message || "An unexpected error occurred while loading this page."}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button onClick={reset} variant="default" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button
            onClick={() => window.location.href = '/app/dashboard'}
            variant="outline"
            size="sm"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
