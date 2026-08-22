"use client"

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageIcon, Video, X, FileVideo, Loader2, AlertCircle, RotateCcw } from 'lucide-react'
import UploadDropzone from './UploadDropzone'
import apiService from '@/lib/apiService'

const LIMITS = { image: 4, video: 1 }

/**
 * Image/Video mode toggle + drop zone + preview cards. Each selected file
 * is uploaded immediately to POST /social/media/upload
 * (mediaStorageService.js on the backend) — files no longer stay
 * local-preview-only; `files[i].uploadedMedia` (`{url, type, ...}`) is the
 * real, public HTTPS URL the Facebook/Instagram adapters will hand to
 * Meta. The local `previewUrl` (a blob: URL) is ONLY ever used for the
 * on-screen thumbnail — it is never read by buildPayload()/submitted
 * anywhere (see CreatePostDialog.jsx), so a blob: URL can never end up in
 * MongoDB or in a request to Meta.
 *
 * `file` may be null for an entry seeded from an EXISTING, already-
 * uploaded publication (see EditPostDialog.jsx) — `previewUrl` is then the
 * real HTTPS media URL itself (fine as an <img src>), `status` is 'done',
 * and `uploadedMedia` is already populated; such an entry only ever gets
 * removed, never re-uploaded.
 */
export default function MediaUploader({ projectId, mode, onModeChange, files, onFilesChange }) {
  useEffect(() => () => {
    files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateFile(id, patch) {
    onFilesChange((current) => current.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }

  async function uploadOne(id, file) {
    updateFile(id, { status: 'uploading', error: null })
    try {
      const res = await apiService.uploadSocialMedia(projectId, file)
      updateFile(id, { status: 'done', uploadedMedia: res.data })
    } catch (err) {
      updateFile(id, { status: 'error', error: err?.message || 'Upload failed.' })
    }
  }

  function handleFilesSelected(selected) {
    const withPreviews = selected.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      status: 'uploading',
      uploadedMedia: null,
      error: null,
    }))
    // onFilesChange accepts either a value or an updater function (same
    // convention as React's own setState) so uploadOne's async callbacks
    // below always patch the LATEST files array, never a stale closure.
    onFilesChange((current) => [...current, ...withPreviews].slice(0, LIMITS[mode]))
    withPreviews.forEach((f) => uploadOne(f.id, f.file))
  }

  function retryUpload(f) {
    uploadOne(f.id, f.file)
  }

  function removeFile(id) {
    const target = files.find((f) => f.id === id)
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
    onFilesChange((current) => current.filter((f) => f.id !== id))
  }

  function switchMode(nextMode) {
    if (nextMode === mode) return
    files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl))
    onFilesChange([])
    onModeChange(nextMode)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => switchMode('image')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'image' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:text-foreground'
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Image
        </button>
        <button
          type="button"
          onClick={() => switchMode('video')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'video' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:text-foreground'
          }`}
        >
          <Video className="h-3.5 w-3.5" />
          Video
        </button>
      </div>

      {files.length < LIMITS[mode] && (
        <UploadDropzone mode={mode} onFilesSelected={handleFilesSelected} />
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <AnimatePresence initial={false}>
            {files.map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative rounded-lg overflow-hidden border bg-muted/30 aspect-square"
              >
                {f.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.previewUrl} alt={f.file?.name || 'attached image'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground p-2">
                    <FileVideo className="h-6 w-6" />
                    <span className="text-[10px] text-center truncate w-full">{f.file?.name || 'Video'}</span>
                  </div>
                )}

                {f.status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </div>
                )}
                {f.status === 'error' && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1.5 p-2 text-center">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <span className="text-[10px] text-white leading-tight">{f.error}</span>
                    <button
                      type="button"
                      onClick={() => retryUpload(f)}
                      className="inline-flex items-center gap-1 text-[10px] text-white bg-white/20 hover:bg-white/30 rounded px-1.5 py-0.5"
                    >
                      <RotateCcw className="h-2.5 w-2.5" /> Retry
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeFile(f.id)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
