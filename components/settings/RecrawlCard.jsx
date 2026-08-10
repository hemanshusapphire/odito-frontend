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

/**
 * Recrawl Project card — reuses the same audit-trigger logic (socket
 * handling, progress polling, cache invalidation) as the dashboard's
 * Recrawl button via useAuditTrigger. Does not call a new API.
 */
export default function RecrawlCard({ project }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { isRecrawling, recrawlError, startRecrawl } = useAuditTrigger(project?._id)

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
          Run a fresh audit to refresh SEO, AI Visibility, Accessibility, Performance, and Technical findings for this project.
        </CardDescription>
      </CardHeader>

      {recrawlError && (
        <CardContent>
          <p className="text-sm text-destructive">{recrawlError}</p>
        </CardContent>
      )}

      <CardFooter>
        <Button
          onClick={() => setConfirmOpen(true)}
          disabled={isRunning || !project?._id}
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
