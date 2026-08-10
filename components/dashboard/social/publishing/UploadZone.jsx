"use client"

import { useState } from 'react'
import { UploadCloud, FileSpreadsheet, X } from 'lucide-react'

/**
 * Drag-and-drop zone for CSV/Excel bulk import - no real parsing, file
 * selection only. The actual <input type="file"> lives in the parent
 * (BulkUploadCard) so the "Upload CSV"/"Upload Excel" toolbar buttons can
 * trigger the same picker this zone's click does.
 */
export default function UploadZone({ file, onFileSelected, onBrowseClick }) {
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) onFileSelected(dropped)
  }

  if (file) {
    return (
      <div className="rounded-2xl border-2 border-dashed p-8 flex flex-col items-center gap-3 text-center bg-muted/20">
        <span className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <FileSpreadsheet className="h-7 w-7" />
        </span>
        <div>
          <p className="text-sm font-semibold">{file.name}</p>
          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
        <button
          type="button"
          onClick={() => onFileSelected(null)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
        >
          <X className="h-3 w-3" />
          Remove file
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onBrowseClick}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`w-full rounded-2xl border-2 border-dashed p-10 flex flex-col items-center gap-3 text-center transition-colors ${
        dragging ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'
      }`}
    >
      <span className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <UploadCloud className="h-7 w-7" />
      </span>
      <div>
        <p className="text-sm font-semibold">Drag & drop your file here</p>
        <p className="text-xs text-muted-foreground mt-1">or click to browse — CSV or Excel, up to 10MB</p>
      </div>
    </button>
  )
}
