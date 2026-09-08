"use client"

import { useRef, useState } from 'react'
import { UploadCloud, FileSpreadsheet, X, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  FILE_ACCEPT_ATTR, MAX_FILE_MB, formatBytes, quickFileCheck,
} from './bulkUploadConstants'

/**
 * Step 1 — pick a .csv / .xlsx file and send it for validation.
 *
 * Client-side extension/size checks give immediate feedback only; the
 * backend re-validates everything. No fake upload percentage — a stable
 * "Validating…" state instead.
 */
export default function UploadStep({
  file,
  onFileChange,
  onValidate,
  validating,
  error,
  onDownloadTemplate,
  templateDownloading,
}) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [clientError, setClientError] = useState(null)

  function pickFile(next) {
    setClientError(null)
    if (!next) {
      onFileChange(null)
      return
    }
    const check = quickFileCheck(next)
    if (!check.ok) {
      setClientError(check.message)
      onFileChange(null)
      return
    }
    onFileChange(next)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    if (validating) return
    pickFile(e.dataTransfer.files?.[0] || null)
  }

  function openPicker() {
    if (!validating) inputRef.current?.click()
  }

  const shownError = clientError || error

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Upload a spreadsheet</h3>
          <p className="text-sm text-muted-foreground">
            CSV or Excel, up to {MAX_FILE_MB} MB. One row per post — platform and content are required.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDownloadTemplate}
          disabled={templateDownloading}
          className="gap-2"
        >
          {templateDownloading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
          Download CSV template
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={FILE_ACCEPT_ATTR}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => pickFile(e.target.files?.[0] || null)}
      />

      {file ? (
        <div className="rounded-2xl border-2 border-dashed border-border/70 bg-muted/20 p-6 flex flex-col items-center gap-3 text-center">
          <span className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <FileSpreadsheet className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold break-all">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => pickFile(null)}
            disabled={validating}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive disabled:opacity-50"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Remove file
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload CSV or Excel file. Press Enter to browse, or drop a file here."
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              openPicker()
            }
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`w-full rounded-2xl border-2 border-dashed p-10 flex flex-col items-center gap-3 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            dragging ? 'border-primary bg-primary/5' : 'border-border/70 hover:bg-muted/30'
          }`}
        >
          <span className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <UploadCloud className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold">Drag &amp; drop your file here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse — .csv or .xlsx, up to {MAX_FILE_MB} MB</p>
          </div>
        </div>
      )}

      {shownError && (
        <p role="alert" className="text-sm text-destructive">{shownError}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="button" onClick={onValidate} disabled={!file || validating} aria-busy={validating} className="gap-2">
          {validating && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {validating ? 'Validating…' : 'Validate File'}
        </Button>
        {validating && (
          <span role="status" aria-live="polite" className="text-xs text-muted-foreground">
            Parsing and checking every row — keep this tab open.
          </span>
        )}
      </div>
    </div>
  )
}
