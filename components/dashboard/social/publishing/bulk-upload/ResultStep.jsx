"use client"

import { CheckCircle2, XCircle, FileText, CalendarClock, Layers, Download, Loader2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import RowsTable from './RowsTable'
import SchedulerNotice from './SchedulerNotice'

function ResultStat({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3">
      <Icon className={`h-5 w-5 shrink-0 ${tone}`} aria-hidden="true" />
      <div>
        <div className="text-lg font-semibold tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

/**
 * Step 3 — the actual import outcome. Distinguishes validation-invalid
 * rows (never attempted) from import-time failures, surfaces the
 * scheduler-disabled warning verbatim, and offers the server-generated
 * error report.
 */
export default function ResultStep({
  projectId,
  batchId,
  result,
  schedulerEnabled,
  warnings,
  replay,
  showErrorReport,
  onDownloadErrors,
  errorsDownloading,
  onGoToTab,
  onUploadAnother,
}) {
  const r = result || {}
  const attempted = r.attempted ?? 0
  const imported = r.imported ?? 0
  const failed = r.failed ?? 0
  const drafts = r.drafts ?? 0
  const scheduled = r.scheduled ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h3 className="text-base font-semibold">Import complete</h3>
          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
            {imported} of {attempted} attempted {attempted === 1 ? 'row' : 'rows'} imported
            {failed > 0 ? `, ${failed} failed` : ''}.
            {replay ? ' This file had already been imported — showing the existing result.' : ''}
          </p>
        </div>
      </div>

      {schedulerEnabled === false && <SchedulerNotice warnings={warnings} />}

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <ResultStat icon={Layers} label="Attempted" value={attempted} tone="text-muted-foreground" />
        <ResultStat icon={CheckCircle2} label="Imported" value={imported} tone="text-emerald-500" />
        <ResultStat icon={XCircle} label="Failed" value={failed} tone="text-destructive" />
        <ResultStat icon={FileText} label="Drafts" value={drafts} tone="text-muted-foreground" />
        <ResultStat icon={CalendarClock} label="Scheduled" value={scheduled} tone="text-sky-500" />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold">Per-row outcome</p>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Failed</span> rows hit a problem during import.
          Rows that were invalid at validation are in the error report but were never attempted.
        </p>
        <RowsTable projectId={projectId} batchId={batchId} variant="result" />
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/50">
        {showErrorReport && (
          <Button type="button" variant="outline" size="sm" onClick={onDownloadErrors} disabled={errorsDownloading} className="gap-2">
            {errorsDownloading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
            Download error report
          </Button>
        )}
        <Button type="button" variant="outline" size="sm" onClick={() => onGoToTab('posts')}>View Posts</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onGoToTab('history')}>View Post History</Button>
        <Button type="button" size="sm" onClick={onUploadAnother} className="gap-2">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Upload another file
        </Button>
      </div>
    </div>
  )
}
