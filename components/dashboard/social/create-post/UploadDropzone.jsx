"use client"

import { useState } from 'react'
import { UploadCloud } from 'lucide-react'

// Matches mediaValidationService.js's real, server-enforced caps
// (MAX_IMAGE_BYTES / MAX_VIDEO_BYTES) and allowed video type (MP4 only —
// no video-decoding dependency exists in this stack to validate anything
// else) — this text must never promise more than the backend will
// actually accept.
const LIMITS = {
  image: { accept: 'image/jpeg,image/png,image/webp', maxFiles: 4, maxSizeMb: 8, helper: 'Images: up to 4 files (JPG/PNG/WEBP), 8MB each' },
  video: { accept: 'video/mp4', maxFiles: 1, maxSizeMb: 100, helper: 'Video: 1 MP4 file, up to 100MB' },
}

/** Drag-and-drop (+ click-to-browse) media zone — selected files are uploaded to a real, public URL by MediaUploader.jsx. */
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
