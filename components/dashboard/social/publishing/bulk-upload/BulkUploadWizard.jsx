"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useProject } from '@/contexts/ProjectContext'
import {
  useValidateBulkUpload, useImportBulkUpload,
  useDownloadBulkUploadTemplate, useDownloadBulkUploadErrors,
  useBulkUploadBatch,
} from '@/hooks/useBulkUpload'
import { useBulkImportProgress } from '@/hooks/useBulkImportProgress'
import { DEFAULT_IMPORT_MODE, WIZARD_STEPS } from './bulkUploadConstants'
import { saveBulkUploadSession, loadBulkUploadSession, clearBulkUploadSession } from './bulkUploadSession'
import UploadStep from './UploadStep'
import ReviewStep from './ReviewStep'
import ResultStep from './ResultStep'

/**
 * Bulk Upload — a wizard over the existing backend
 * (POST /bulk-upload/validate → GET /bulk-upload/:batchId/rows →
 * POST /bulk-upload/:batchId/import). The frontend never parses,
 * validates, publishes, or schedules — it renders backend results.
 *
 * Phase 5: live import progress over Socket.IO (no polling, no fake
 * percentage) + recovery of an in-flight / just-finished import after a
 * browser refresh (the batch id is kept in sessionStorage — opaque, not
 * sensitive; authoritative state always comes from the backend). The
 * wizard only ever transitions to Results from an authoritative import
 * response, never from a socket event alone.
 *
 * @param {(msg: string, tone?: string) => void} notify  the page's shared toast
 * @param {(tab: string) => void} onGoToTab              switches the Publishing tab
 */
export default function BulkUploadWizard({ notify, onGoToTab }) {
  const { activeProjectId } = useProject()

  const [step, setStep] = useState('upload')
  const [file, setFile] = useState(null)
  const [batchId, setBatchId] = useState(null)
  const [validation, setValidation] = useState(null) // { total, valid, invalid }
  const [mode, setMode] = useState(DEFAULT_IMPORT_MODE)
  const [importResult, setImportResult] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [importError, setImportError] = useState(null)
  const [importErrorCode, setImportErrorCode] = useState(null)

  // Phase 5 recovery: true while we're resolving a persisted batch after a refresh.
  const [recovering, setRecovering] = useState(() => !!loadBulkUploadSession(activeProjectId))
  const recoveryHandledRef = useRef(false)

  const validateMutation = useValidateBulkUpload(activeProjectId)
  const importMutation = useImportBulkUpload(activeProjectId)
  const templateMutation = useDownloadBulkUploadTemplate(activeProjectId)
  const errorsMutation = useDownloadBulkUploadErrors(activeProjectId)

  // Authoritative batch state — enabled while recovering, or once an
  // import is/was running so a reconnect can re-read it.
  const importActive = importMutation.isPending || recovering
  const batchQuery = useBulkUploadBatch(activeProjectId, batchId, { enabled: !!batchId && importActive })
  const backendBatch = batchQuery.data?.data?.batch || null

  // Live progress (subscribes only while an import is active).
  const progress = useBulkImportProgress(activeProjectId, batchId, { active: importActive })
  const progressRef = useRef(progress)
  useEffect(() => { progressRef.current = progress }, [progress])

  const headingRef = useRef(null)
  useEffect(() => { headingRef.current?.focus() }, [step])

  const readCode = (err) => err?.details?.code || err?.code || null

  const persist = useCallback((next) => {
    if (!activeProjectId || !next.batchId) return
    saveBulkUploadSession(activeProjectId, next)
  }, [activeProjectId])

  function resetAll() {
    clearBulkUploadSession(activeProjectId)
    recoveryHandledRef.current = false
    setRecovering(false)
    setStep('upload')
    setFile(null)
    setBatchId(null)
    setValidation(null)
    setMode(DEFAULT_IMPORT_MODE)
    setImportResult(null)
    setUploadError(null)
    setImportError(null)
    setImportErrorCode(null)
  }

  const runImport = useCallback(async ({ silent = false } = {}) => {
    if (!batchId || !activeProjectId) return null
    if (!silent) { setImportError(null); setImportErrorCode(null) }
    try {
      const res = await importMutation.mutateAsync({ batchId, mode })
      if (!res?.data?.result) {
        if (!silent) setImportError('The import finished but returned an unexpected response.')
        return null
      }
      setImportResult(res.data)
      setStep('result')
      setRecovering(false)
      clearBulkUploadSession(activeProjectId)
      return res.data
    } catch (err) {
      const code = readCode(err)
      // The HTTP response was lost but the socket already told us the
      // import completed — recover by replaying once (idempotent).
      if (!code && progressRef.current?.status === 'completed' && !recoveryHandledRef.current) {
        recoveryHandledRef.current = true
        return runImport({ silent: true })
      }
      if (!silent) {
        setImportErrorCode(code)
        setImportError(importErrorMessage(code, err))
      }
      return null
    }
  }, [activeProjectId, batchId, mode, importMutation])

  async function handleValidate() {
    if (!file || !activeProjectId) return
    setUploadError(null)
    try {
      const res = await validateMutation.mutateAsync(file)
      const batch = res?.data?.batch
      const summary = res?.data?.validation
      if (!batch?.id || !summary) {
        setUploadError('The server returned an unexpected response. Please try again.')
        return
      }
      setBatchId(batch.id)
      setValidation(summary)
      setStep('review')
      persist({ batchId: batch.id, step: 'review', mode, validation: summary })
    } catch (err) {
      const code = readCode(err)
      const base = err?.message || 'Could not validate the file.'
      setUploadError(code ? `${base} (${code})` : base)
    }
  }

  function handleModeChange(next) {
    setMode(next)
    if (batchId) persist({ batchId, step, mode: next, validation })
  }

  async function handleImport() {
    await runImport()
  }

  async function handleDownloadTemplate() {
    try { await templateMutation.mutateAsync() } catch (err) { notify?.(err?.message || 'Could not download the template.', 'danger') }
  }

  async function handleDownloadErrors() {
    if (!batchId) return
    try { await errorsMutation.mutateAsync(batchId) } catch (err) { notify?.(err?.message || 'Could not download the error report.', 'danger') }
  }

  // ── refresh recovery: resolve a persisted batch to the right step ──
  useEffect(() => {
    if (!recovering || recoveryHandledRef.current) return
    const persisted = loadBulkUploadSession(activeProjectId)
    if (!persisted?.batchId) { setRecovering(false); return }
    if (!batchId) {
      setBatchId(persisted.batchId)
      setMode(persisted.mode || DEFAULT_IMPORT_MODE)
      setValidation(persisted.validation || null)
      return // wait for the batch query with the id now set
    }

    if (batchQuery.isError) {
      // 404 / not-ours → nothing to recover.
      recoveryHandledRef.current = true
      clearBulkUploadSession(activeProjectId)
      setRecovering(false)
      setStep('upload')
      setUploadError('The previous bulk upload could not be found. Please upload the file again.')
      return
    }
    if (!backendBatch) return

    const s = backendBatch.status
    if (s === 'ready') {
      recoveryHandledRef.current = true
      setValidation({
        total: backendBatch.counts?.total ?? persisted.validation?.total ?? 0,
        valid: backendBatch.counts?.valid ?? persisted.validation?.valid ?? 0,
        invalid: backendBatch.counts?.invalid ?? persisted.validation?.invalid ?? 0,
      })
      setStep('review')
      setRecovering(false)
    } else if (s === 'completed') {
      recoveryHandledRef.current = true
      runImport({ silent: true }) // idempotent replay → Results
    } else if (s === 'failed' && backendBatch.importMode) {
      recoveryHandledRef.current = true
      setStep('review')
      setImportError('A previous import was interrupted before finishing. It is safe to retry.')
      setImportErrorCode('IMPORT_FAILED')
      setRecovering(false)
    } else if (s === 'failed' || s === 'expired') {
      recoveryHandledRef.current = true
      clearBulkUploadSession(activeProjectId)
      setRecovering(false)
      setStep('upload')
      setUploadError(s === 'expired'
        ? 'The previous bulk upload has expired. Please upload the file again.'
        : 'The previous bulk upload cannot be resumed. Please upload a corrected file.')
    }
    // s === 'importing' | 'parsing' | 'validating' → stay in the recovery
    // panel; the progress hook / Check status button drive the exit.
  }, [recovering, activeProjectId, batchId, batchQuery.isError, backendBatch, runImport])

  // While recovering an `importing` batch, react to live progress: a
  // socket `completed`/`error` transitions us out (authoritative replay
  // for completed).
  useEffect(() => {
    if (!recovering || recoveryHandledRef.current) return
    if (progress.status === 'completed') {
      recoveryHandledRef.current = true
      runImport({ silent: true })
    } else if (progress.status === 'error') {
      recoveryHandledRef.current = true
      setStep('review')
      setImportError(progress.message || 'The import was interrupted. It is safe to retry.')
      setImportErrorCode(progress.code || 'IMPORT_FAILED')
      setRecovering(false)
    }
  }, [recovering, progress.status, progress.message, progress.code, runImport])

  const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.key === step)
  const showErrorReport =
    !!importResult &&
    ((importResult.result?.failed ?? 0) > 0 || (validation?.invalid ?? 0) > 0)

  // Recovering an in-flight import after a refresh.
  if (recovering && !recoveryHandledRef.current) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center text-center gap-3 py-8" role="status" aria-live="polite">
          <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Resuming your bulk upload…</p>
            <p className="text-xs text-muted-foreground">
              {backendBatch?.status === 'importing'
                ? 'An import for this file is still running. This screen will update when it finishes.'
                : 'Checking the status of your previous upload.'}
            </p>
          </div>
          {backendBatch?.status === 'importing' && (
            <>
              <p className="text-xs text-muted-foreground tabular-nums">
                {progress.processed > 0 && progress.total > 0
                  ? `Imported ${progress.imported} · Failed ${progress.failed} · ${progress.processed} of ${progress.total} rows`
                  : `Imported ${backendBatch.counts?.imported ?? 0} · Failed ${backendBatch.counts?.failed ?? 0}`}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => batchQuery.refetch()} disabled={batchQuery.isFetching} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${batchQuery.isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
                Check status
              </Button>
            </>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={resetAll}>Start a new upload</Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="border-b border-border/60 px-6 py-4">
        <ol className="flex items-center gap-2 text-xs" aria-label="Bulk upload progress">
          {WIZARD_STEPS.map((s, i) => {
            const state = i < currentStepIndex ? 'done' : i === currentStepIndex ? 'current' : 'upcoming'
            return (
              <li key={s.key} className="flex items-center gap-2">
                <span
                  aria-current={state === 'current' ? 'step' : undefined}
                  className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 font-medium ${
                    state === 'current'
                      ? 'bg-primary text-primary-foreground'
                      : state === 'done'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </span>
                <span className={state === 'current' ? 'font-medium text-foreground' : 'text-muted-foreground'}>{s.label}</span>
                {i < WIZARD_STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-border" aria-hidden="true" />}
              </li>
            )
          })}
        </ol>
      </div>

      <div className="p-6">
        <h2 ref={headingRef} tabIndex={-1} className="sr-only">
          Bulk upload — step {currentStepIndex + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStepIndex]?.label}
        </h2>

        {step === 'upload' && (
          <UploadStep
            file={file}
            onFileChange={setFile}
            onValidate={handleValidate}
            validating={validateMutation.isPending}
            error={uploadError}
            onDownloadTemplate={handleDownloadTemplate}
            templateDownloading={templateMutation.isPending}
          />
        )}

        {step === 'review' && batchId && (
          <ReviewStep
            projectId={activeProjectId}
            batchId={batchId}
            validation={validation}
            mode={mode}
            onModeChange={handleModeChange}
            onImport={handleImport}
            importing={importMutation.isPending}
            progress={progress}
            importError={importError}
            importErrorCode={importErrorCode}
            onBack={resetAll}
          />
        )}

        {step === 'result' && batchId && importResult && (
          <ResultStep
            projectId={activeProjectId}
            batchId={batchId}
            result={importResult.result}
            schedulerEnabled={importResult.schedulerEnabled}
            warnings={importResult.warnings}
            replay={importResult.replay === true}
            showErrorReport={showErrorReport}
            onDownloadErrors={handleDownloadErrors}
            errorsDownloading={errorsMutation.isPending}
            onGoToTab={onGoToTab}
            onUploadAnother={resetAll}
          />
        )}
      </div>
    </Card>
  )
}

/** Maps the backend import error code to an actionable message. */
function importErrorMessage(code, err) {
  switch (code) {
    case 'IMPORT_ALREADY_IN_PROGRESS':
      return 'An import for this file is already running. Wait a moment, then reload this page to see the result.'
    case 'IMPORT_BATCH_NOT_READY':
      return 'This file is still being validated. Give it a moment and try again.'
    case 'IMPORT_BATCH_FAILED':
      return err?.message || 'This file could not be imported. Upload a corrected file.'
    case 'IMPORT_BATCH_EXPIRED':
      return 'This import has expired. Upload the file again to start over.'
    case 'IMPORT_FAILED':
      return 'The import did not finish. It is safe to try again.'
    case 'INVALID_MODE':
      return 'That import mode is not supported.'
    default:
      return err?.message || 'The import could not be completed.'
  }
}
