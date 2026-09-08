"use client"

import { CheckCircle2, XCircle, Info, Loader2, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IMPORT_MODES } from './bulkUploadConstants'
import RowsTable from './RowsTable'
import ImportModeField from './ImportModeField'

function SummaryStat({ icon: Icon, label, value, tone }) {
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
 * Step 2 — validation summary, per-row preview, import-mode choice, and a
 * confirmation summary before the (synchronous) import runs.
 */
export default function ReviewStep({
  projectId,
  batchId,
  validation,
  mode,
  onModeChange,
  onImport,
  importing,
  progress,
  importError,
  importErrorCode,
  onBack,
}) {
  const total = validation?.total ?? 0
  const valid = validation?.valid ?? 0
  const invalid = validation?.invalid ?? 0
  const modeLabel = IMPORT_MODES.find((m) => m.value === mode)?.label || mode

  // Real progress from Socket.IO — never a fabricated percentage.
  const p = progress || {}
  const liveProcessed = importing && p.status === 'importing' && p.processed > 0
  const progressTotal = p.total > 0 ? p.total : valid
  const progressLabel = liveProcessed
    ? `Importing ${p.processed} of ${progressTotal}…`
    : 'Importing posts…'
  const progressDetail = liveProcessed
    ? `Imported ${p.imported} · Failed ${p.failed}${p.reconnectedAt ? ' · reconnected, re-checking' : ''}`
    : 'Creating posts — this can take a moment for large files.'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Review &amp; import</h3>
          <p className="text-sm text-muted-foreground">
            Only <span className="font-medium text-foreground">valid</span> rows can be imported. Invalid rows are listed so you can fix and re-upload.
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onBack} disabled={importing} className="gap-1">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Upload a different file
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3" role="status" aria-live="polite">
        <SummaryStat icon={Info} label="Total rows" value={total} tone="text-muted-foreground" />
        <SummaryStat icon={CheckCircle2} label="Valid rows" value={valid} tone="text-emerald-500" />
        <SummaryStat icon={XCircle} label="Invalid rows" value={invalid} tone="text-destructive" />
      </div>

      <RowsTable
        projectId={projectId}
        batchId={batchId}
        variant="preview"
        summary={{ total, valid, invalid }}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ImportModeField value={mode} onChange={onModeChange} disabled={importing} />

        <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
          <p className="text-sm font-semibold">Ready to import</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li><span className="font-medium text-foreground tabular-nums">{valid}</span> valid rows will be imported</li>
            <li><span className="tabular-nums">{invalid}</span> invalid rows excluded</li>
            <li>Mode: <span className="text-foreground">{modeLabel}</span></li>
          </ul>
          <p className="text-xs text-muted-foreground leading-snug pt-1 border-t border-border/50">
            Draft rows are saved as drafts. Scheduled and publish rows are handed to Odito&apos;s scheduler — nothing is published from this screen.
          </p>
        </div>
      </div>

      {importError && (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {importError}
          {importErrorCode ? <span className="ml-1 text-xs opacity-70">({importErrorCode})</span> : null}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="button" onClick={onImport} disabled={importing || valid === 0} aria-busy={importing} className="gap-2">
          {importing && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {importing ? progressLabel : `Import ${valid} valid ${valid === 1 ? 'row' : 'rows'}`}
        </Button>
        {importing && (
          <span role="status" aria-live="polite" className="text-xs text-muted-foreground tabular-nums">
            {progressDetail}
          </span>
        )}
        {valid === 0 && !importing && (
          <span className="text-xs text-muted-foreground">There are no valid rows to import.</span>
        )}
      </div>
    </div>
  )
}
