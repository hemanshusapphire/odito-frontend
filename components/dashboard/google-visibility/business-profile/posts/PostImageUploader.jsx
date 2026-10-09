"use client"

import { useState, useRef, useEffect } from 'react'
import { UploadCloud, Image as ImageIcon, X, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import apiService from '@/lib/apiService'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024 // 8MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return ''
  const mb = bytes / (1024 * 1024)
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  const kb = bytes / 1024
  return `${Math.round(kb)} KB`
}

function isValidImageType(file) {
  if (file.type && ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return true
  }
  const name = file.name ? file.name.toLowerCase() : ''
  return ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))
}

export default function PostImageUploader({
  projectId,
  mediaUrl,
  onChange,
  onUploadingChange,
  disabled = false,
}) {
  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState('')
  const [uploadStatus, setUploadStatus] = useState('idle') // 'idle' | 'uploading' | 'success' | 'error'
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  // Clean up object URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl)
      }
    }
  }, [localPreviewUrl])

  // Sync uploading state with parent
  useEffect(() => {
    onUploadingChange?.(uploadStatus === 'uploading')
  }, [uploadStatus, onUploadingChange])

  function validateFile(file) {
    if (!isValidImageType(file)) {
      return 'Only JPG, PNG, and WEBP image files are supported.'
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return 'Image size exceeds the 8MB limit. Please choose a smaller image.'
    }
    return null
  }

  async function performUpload(file) {
    setUploadStatus('uploading')
    setUploadProgress(0)
    setErrorMessage('')

    try {
      const res = await apiService.uploadBusinessProfilePostMedia(
        projectId,
        file,
        (percent) => setUploadProgress(percent)
      )

      const uploadedUrl = res?.data?.url
      if (!uploadedUrl) {
        throw new Error('Upload succeeded but no public media URL was returned.')
      }

      setUploadStatus('success')
      onChange(uploadedUrl)
    } catch (err) {
      setUploadStatus('error')
      setErrorMessage(err?.message || 'Failed to upload image. Please try again.')
    }
  }

  function handleFileSelection(file) {
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setErrorMessage(validationError)
      setUploadStatus('error')
      return
    }

    // Clean up previous blob URL
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl)
    }

    const previewUrl = URL.createObjectURL(file)
    setSelectedFile(file)
    setLocalPreviewUrl(previewUrl)
    performUpload(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    if (disabled || uploadStatus === 'uploading') return

    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  function handleDragOver(e) {
    e.preventDefault()
    if (!disabled && uploadStatus !== 'uploading') {
      setDragOver(true)
    }
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setDragOver(false)
  }

  function handleInputChange(e) {
    const files = e.target?.files
    if (files && files.length > 0) {
      handleFileSelection(files[0])
    }
    // Reset file input value so selecting the same file again triggers change
    if (e.target) {
      e.target.value = ''
    }
  }

  function handleRemove() {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl)
      setLocalPreviewUrl('')
    }
    setSelectedFile(null)
    setUploadStatus('idle')
    setUploadProgress(0)
    setErrorMessage('')
    onChange('')
  }

  function handleRetry() {
    if (selectedFile) {
      performUpload(selectedFile)
    }
  }

  const activeDisplayUrl = localPreviewUrl || mediaUrl
  const hasImage = !!activeDisplayUrl

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || uploadStatus === 'uploading'}
        aria-label="Upload post image"
        data-testid="post-image-file-input"
      />

      {/* Error Banner */}
      {errorMessage && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p>{errorMessage}</p>
            {selectedFile && uploadStatus === 'error' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="h-6 text-[11px] px-2 gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <RefreshCw className="h-3 w-3" />
                Retry Upload
              </Button>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setErrorMessage('')}
            className="h-5 w-5 p-0 text-destructive/70 hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Image Preview or Dropzone */}
      {hasImage ? (
        <div className="relative rounded-lg border bg-muted/20 p-2.5 transition-all">
          <div className="flex items-start gap-3">
            {/* Thumbnail Preview */}
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md border bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeDisplayUrl}
                alt="Post attachment preview"
                className="h-full w-full object-cover"
                onError={() => {}}
              />
              {uploadStatus === 'uploading' && (
                <div className="absolute inset-0 bg-background/70 backdrop-blur-[1px] flex flex-col items-center justify-center p-1">
                  <Loader2 className="h-5 w-5 animate-spin text-primary mb-1" />
                  <span className="text-[10px] font-semibold text-primary">{uploadProgress}%</span>
                </div>
              )}
            </div>

            {/* Image Details & Actions */}
            <div className="flex-1 min-w-0 space-y-1.5 py-0.5">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <p className="text-xs font-medium truncate" title={selectedFile ? selectedFile.name : 'Post Image'}>
                  {selectedFile ? selectedFile.name : 'Attached Image'}
                </p>
              </div>

              {selectedFile?.size ? (
                <p className="text-[11px] text-muted-foreground">
                  {formatFileSize(selectedFile.size)} &middot; {selectedFile.type?.replace('image/', '').toUpperCase()}
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">Google Business Profile media</p>
              )}

              {/* Upload Status Indicator */}
              {uploadStatus === 'uploading' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Uploading to storage...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-200 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadStatus === 'success' && (
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Ready to publish</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || uploadStatus === 'uploading'}
                  className="h-7 text-xs px-2.5"
                >
                  Change Image
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled || uploadStatus === 'uploading'}
                  className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Dropzone State */
        <div
          role="button"
          tabIndex={0}
          onClick={() => !disabled && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
          } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
        >
          <div className="rounded-full bg-muted p-2.5 text-muted-foreground">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold">
              Click to upload an image or drag & drop
            </p>
            <p className="text-[11px] text-muted-foreground">
              Supports JPG, PNG, or WEBP up to 8MB
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
