"use client"

import { useState } from 'react'
import { UploadCloud } from 'lucide-react'

const LIMITS = {
  image: { accept: 'image/*', maxFiles: 4, maxSizeMb: 5, helper: 'Images: up to 4 files, 5MB each' },
  video: { accept: 'video/*', maxFiles: 1, maxSizeMb: 500, helper: 'Video: 1 file, up to 500MB' },
}

/** Drag-and-drop (+ click-to-browse) media zone - no upload pipeline, just local file selection. */
export default function UploadDropzone({ mode, onFilesSelected }) {
  const [dragging, setDragging] = useState(false)
  const limits = LIMITS[mode]

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.length) onFilesSelected(Array.from(e.dataTransfer.files))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 px-4 text-center cursor-pointer transition-colors ${
          dragging ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'
        }`}
      >
        <input
          type="file"
          accept={limits.accept}
          multiple={mode === 'image'}
          className="hidden"
          onChange={(e) => e.target.files?.length && onFilesSelected(Array.from(e.target.files))}
        />
        <UploadCloud className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium">Drag files here or click to upload</p>
      </label>
      <p className="text-[11px] text-muted-foreground text-center">{limits.helper} &middot; Max file size {limits.maxSizeMb}MB</p>
    </div>
  )
}
