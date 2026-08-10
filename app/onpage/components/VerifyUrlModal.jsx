"use client"

import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

/**
 * Realtime URL Verification progress modal (F4-001) — now also the Bulk
 * Verification progress/completion modal (Bulk URL Verification workflow).
 *
 * Purely presentational — all state (progress, open/close) lives in
 * useUrlVerification (single) or useBulkVerificationController (bulk).
 * Reuses the app's existing Dialog primitive (components/ui/dialog.jsx);
 * no new modal system, and no second implementation — passing `bulk`
 * switches this SAME component into an additive content branch instead of
 * duplicating it.
 */
export default function VerifyUrlModal({ open, onOpenChange, pageUrl, progress, bulk }) {
  if (bulk) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <BulkVerifyContent bulk={bulk} />
        </DialogContent>
      </Dialog>
    )
  }

  const status = progress?.status || "starting"
  const stage = progress?.stage || "Queued"
  const percentage = typeof progress?.percentage === "number" ? progress.percentage : 0
  const errorMessage = progress?.errorMessage

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verifying Page</DialogTitle>
          <DialogDescription className="break-all">{pageUrl}</DialogDescription>
        </DialogHeader>

        <div
          className="space-y-4 py-2"
          role={status === "failed" ? "alert" : "status"}
          aria-live={status === "failed" ? "assertive" : "polite"}
        >
          {status === "completed" ? (
            <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Verification complete — this page&apos;s results are up to date.
              </p>
            </div>
          ) : status === "failed" ? (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
              <XCircle className="h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Verification failed</p>
                {errorMessage && (
                  <p className="mt-1 text-sm text-red-500/90 dark:text-red-400/80">{errorMessage}</p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden="true" />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{stage}</span>
                    <span className="text-muted-foreground">{percentage}%</span>
                  </div>
                </div>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={`${stage}, ${percentage}%`}
              >
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                This page&apos;s scraping, analysis, SEO scoring, and AI visibility checks are running now.
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Bulk-mode content. `bulk` shape (built by buildBulkModalProps in
 * app/app/history-logs/bulkModalProps.js from useBulkVerificationController's
 * progress snapshot — consumed directly by the Optimization Center table,
 * no drawer):
 * {
 *   isComplete, isFailed,             // batch reached COMPLETED / FAILED
 *   total, completed, failed,
 *   runningUrls, waitingUrls, completedUrls, failedUrls,   // string[]
 *   isComputingResults, fixedCount, stillFailingCount,     // completion-only
 *   onViewDetails, onClose,
 * }
 */
function BulkVerifyContent({ bulk }) {
  const {
    isComplete, isFailed,
    total, completed, failed,
    runningUrls = [], waitingUrls = [], completedUrls = [], failedUrls = [],
    isComputingResults, fixedCount, stillFailingCount,
    onViewDetails, onClose,
  } = bulk

  const percentage = total > 0 ? Math.round(((completed + failed) / total) * 100) : 0

  if (isComplete) {
    return (
      <div role="status" aria-live="polite">
        <DialogHeader>
          <DialogTitle>{isFailed ? 'Verification Failed' : 'Verification Complete'}</DialogTitle>
          <DialogDescription>
            {isFailed
              ? 'None of the selected URLs could be verified.'
              : `${completed} of ${total} selected URLs were verified.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <SummaryRow label="URLs Verified" value={completed} />
          <SummaryRow label="Fixed" value={isComputingResults ? 'Calculating…' : fixedCount} tone="success" />
          <SummaryRow label="Still Failing" value={isComputingResults ? 'Calculating…' : stillFailingCount} tone="warning" />
          {failed > 0 && <SummaryRow label="Failed to Verify" value={failed} tone="error" />}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            onClick={onViewDetails}
          >
            View Details
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Verifying URLs</DialogTitle>
        <DialogDescription>
          <span role="status" aria-live="polite">{completed + failed} / {total} completed</span>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${completed + failed} of ${total} completed, ${percentage}%`}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
          <UrlGroup label="Running" urls={runningUrls} icon={<Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" aria-hidden="true" />} />
          <UrlGroup label="Waiting" urls={waitingUrls} icon={<Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />} />
          <UrlGroup label="Completed" urls={completedUrls} icon={<CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />} />
          <UrlGroup label="Failed" urls={failedUrls} icon={<XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" aria-hidden="true" />} />
        </div>
      </div>
    </>
  )
}

function UrlGroup({ label, urls, icon }) {
  if (urls.length === 0) return null
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label} ({urls.length})
      </div>
      <ul className="space-y-1">
        {urls.map((url) => (
          <li key={url} className="flex items-center gap-2 text-sm text-foreground/90">
            {icon}
            <span className="truncate">{url}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SummaryRow({ label, value, tone }) {
  const toneColor = tone === 'success' ? 'text-emerald-500' : tone === 'warning' ? 'text-amber-500' : tone === 'error' ? 'text-red-500' : 'text-foreground'
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${toneColor}`}>{value}</span>
    </div>
  )
}
