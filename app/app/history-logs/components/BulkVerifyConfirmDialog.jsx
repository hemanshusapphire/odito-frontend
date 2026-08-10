"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { BULK_VERIFICATION_CONCURRENCY } from "@/lib/verification/BulkVerificationController"

// Rough, clearly-labeled heuristic — no measured/persisted average
// verification duration exists to read from. Order-of-magnitude only: real
// PageVerificationRun.durationMs values for a single full-pipeline
// verification (scrape + accessibility + analysis + SEO scoring + AI
// visibility) typically land in the 30-45s range.
const SECONDS_PER_URL_ESTIMATE = 40

export function estimateBulkVerificationSeconds(urlCount, concurrency = BULK_VERIFICATION_CONCURRENCY) {
  if (!urlCount) return 0
  return Math.ceil((urlCount * SECONDS_PER_URL_ESTIMATE) / concurrency)
}

function formatEstimate(totalSeconds) {
  if (totalSeconds < 60) return `~${totalSeconds} sec`
  const minutes = Math.round(totalSeconds / 60)
  return `~${minutes} min`
}

/**
 * Confirmation step between "Verify Selected (N)" and starting the batch.
 * Selection can now span any mix of rows/issues picked directly from the
 * Optimization Center table (no per-issue drawer) — so this dialog only
 * ever confirms a URL count, not a single issue's name.
 *
 * Pure presentational — owns no state, reuses the app's existing
 * AlertDialog primitive (components/ui/alert-dialog.jsx).
 */
export default function BulkVerifyConfirmDialog({ open, onOpenChange, selectedCount, onConfirm }) {
  const estimateSeconds = estimateBulkVerificationSeconds(selectedCount)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Verify Selected URLs</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-left">
              <div className="text-sm text-foreground">
                You are about to verify <span className="font-semibold">{selectedCount}</span> URL{selectedCount === 1 ? '' : 's'}.
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimated verification time</span>
                <span className="font-medium text-foreground">{formatEstimate(estimateSeconds)} (estimate)</span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Verify</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
