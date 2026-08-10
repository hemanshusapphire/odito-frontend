"use client"

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageIcon, Video, X, FileVideo } from 'lucide-react'
import UploadDropzone from './UploadDropzone'

const LIMITS = { image: 4, video: 1 }

/**
 * Image/Video mode toggle + drop zone + local preview cards. Files never
 * leave the browser - image previews use URL.createObjectURL, revoked on
 * removal/unmount; there is no upload pipeline behind this.
 */
export default function MediaUploader({ mode, onModeChange, files, onFilesChange }) {
  useEffect(() => () => {
    files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFilesSelected(selected) {
    const withPreviews = selected.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }))
    onFilesChange([...files, ...withPreviews].slice(0, LIMITS[mode]))
  }

  function removeFile(id) {
    const target = files.find((f) => f.id === id)
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
    onFilesChange(files.filter((f) => f.id !== id))
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
                  <img src={f.previewUrl} alt={f.file.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground p-2">
                    <FileVideo className="h-6 w-6" />
                    <span className="text-[10px] text-center truncate w-full">{f.file.name}</span>
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
