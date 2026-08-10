"use client"

import { useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FileText, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, UploadCloud } from 'lucide-react'
import UploadZone from './UploadZone'
import { UPLOAD_HISTORY } from '@/lib/publishingDummyData'

const TEMPLATE_CSV = 'platform,title,scheduled_at,campaign,author\nfacebook,"Example post title",2026-08-10T09:00:00,New Patient Welcome,Ananya Rao\n'

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'publishing-bulk-upload-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

/** Deterministic mock validation summary derived from the file's own name/size - no real parsing. */
function mockValidation(file) {
  const rows = Math.max(4, Math.round((file.size % 4000) / 90) + 6)
  const warnings = rows > 15 ? 2 : rows > 8 ? 1 : 0
  return { rows, valid: rows - warnings, warnings }
}

const HISTORY_STATUS_VARIANT = { Imported: 'success', Failed: 'critical' }

/** Bulk CSV/Excel post import - drag & drop, mock validation, simulated import progress, recent history. */
export default function BulkUploadCard({ onImportComplete }) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [imported, setImported] = useState(false)

  const validation = file ? mockValidation(file) : null

  function handleFileSelected(next) {
    setFile(next)
    setImporting(false)
    setProgress(0)
    setImported(false)
  }

  function handleImport() {
    setImporting(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 18
        if (next >= 100) {
          clearInterval(interval)
          setImporting(false)
          setImported(true)
          onImportComplete?.(validation)
          return 100
        }
        return next
      })
    }, 220)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
      <Card className="p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Bulk Upload</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Import many posts at once from a CSV or Excel file.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
            />
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="gap-2">
              <FileText className="h-4 w-4" />
              Upload CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Upload Excel
            </Button>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>
        </div>

        <UploadZone file={file} onFileSelected={handleFileSelected} onBrowseClick={() => inputRef.current?.click()} />

        {validation && !imported && (
          <div className="rounded-xl border bg-muted/30 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Validation Summary</span>
              <span className="text-muted-foreground text-xs">{validation.rows} rows detected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />{validation.valid} ready to import</Badge>
              {validation.warnings > 0 && (
                <Badge variant="warning" className="gap-1"><AlertTriangle className="h-3 w-3" />{validation.warnings} need review</Badge>
              )}
            </div>

            {importing || progress > 0 ? (
              <div className="flex flex-col gap-1.5">
                <Progress value={progress} />
                <span className="text-xs text-muted-foreground">{progress < 100 ? `Importing… ${progress}%` : 'Import complete'}</span>
              </div>
            ) : (
              <Button size="sm" onClick={handleImport} className="gap-2 w-fit">
                <UploadCloud className="h-4 w-4" />
                Import {validation.valid} Posts
              </Button>
            )}
          </div>
        )}

        {imported && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center gap-2.5 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {validation.valid} posts imported successfully.
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold mb-3">Recent Uploads</h3>
        <div className="flex flex-col gap-2.5">
          {UPLOAD_HISTORY.map((u) => (
            <div key={u.id} className="rounded-lg border bg-muted/20 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium truncate">{u.fileName}</span>
                <Badge variant={HISTORY_STATUS_VARIANT[u.status]} className="text-[10px] shrink-0">{u.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                <span>{u.rows} rows &middot; {u.uploadedBy}</span>
                <span>{new Date(u.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
