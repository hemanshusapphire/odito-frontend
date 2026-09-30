"use client"

import { useState } from "react"
import { RefreshCw, Loader2, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import { useAuditTrigger } from "@/hooks/useAuditTrigger"
import { useSubscription } from "@/hooks/useDashboardQueries"

/**
 * Manual Recrawl card — reuses the same audit-trigger logic (socket
 * handling, progress polling, cache invalidation) via useAuditTrigger and
 * the existing full-audit endpoint. Each run consumes one of the plan's
 * manual recrawl credits; the remaining count comes from the shared
 * useSubscription() query (a per-account allowance, never derived from the
 * selected project), and is refreshed by useAuditTrigger after a start.
 */
export default function RecrawlCard({ project }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { isRecrawling, recrawlError, startRecrawl } = useAuditTrigger(project?._id)
  const { data: subscriptionResponse, isLoading: quotaLoading, isError: quotaErrored } = useSubscription()

  const recrawls = subscriptionResponse?.data?.recrawls
  const remaining = recrawls?.remaining
  const hasQuota = remaining != null
  const outOfRecrawls = hasQuota && remaining <= 0

  const isRunning = isRecrawling || project?.crawl_status === "running"

  const handleConfirm = () => {
    setConfirmOpen(false)
    startRecrawl()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recrawl Project</CardTitle>
        <CardDescription>
          Run a full audit to refresh SEO, AI Visibility, Accessibility, Performance, and Technical findings.
        </CardDescription>
        <p className="text-sm text-muted-foreground" data-testid="recrawl-credit-info">
          Uses 1 manual recrawl credit.{" "}
          {quotaLoading ? (
            "Checking your balance…"
          ) : quotaErrored || !hasQuota ? null : (
            <span className="font-medium text-foreground">
              {remaining === 1 ? "1 manual recrawl remaining" : `${remaining} manual recrawls remaining`}
            </span>
          )}
        </p>
      </CardHeader>

      {recrawlError ? (
        <CardContent>
          <p className="text-sm text-destructive">{recrawlError}</p>
        </CardContent>
      ) : outOfRecrawls ? (
        <CardContent>
          <p className="text-sm text-destructive">
            You have no manual recrawls remaining. Upgrade your plan or wait for your next billing period.
          </p>
        </CardContent>
      ) : null}

      <CardFooter>
        <Button
          onClick={() => setConfirmOpen(true)}
          disabled={isRunning || !project?._id || outOfRecrawls}
          variant="outline"
          className="gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Recrawling...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Start Recrawl
            </>
          )}
        </Button>
      </CardFooter>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="gap-0 overflow-hidden p-0 sm:max-w-120">
          <div className="px-7 pt-7 pb-6">
            <AlertDialogHeader className="space-y-3 text-left sm:text-left">
              <AlertDialogTitle className="text-xl font-bold text-foreground">
                Start Recrawl
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-foreground">
                This will run a fresh audit for the selected project and refresh all SEO, AI Visibility, Accessibility, Performance, and Technical findings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-3">
              <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
              <p className="text-sm leading-relaxed text-amber-500">
                Running a recrawl may reset issue tracking and replace existing audit results.
              </p>
            </div>
            <div className="mt-3 rounded-lg border border-border bg-muted/40 px-3.5 py-3">
              <p className="text-sm leading-relaxed text-foreground">
                This uses 1 manual recrawl credit
                {hasQuota ? ` (${remaining} remaining before this run)` : ""}.
              </p>
            </div>
          </div>

          <div className="border-t border-border" />

          <div className="flex items-center justify-end gap-3 px-7 py-4">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="rounded-lg border border-border bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #7730ed 0%, #00dfff 100%)" }}
            >
              Start Recrawl
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
