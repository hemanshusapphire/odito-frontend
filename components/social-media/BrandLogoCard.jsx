"use client"

import { useRef, useState } from 'react'
import { Loader2, Trash2, Upload } from 'lucide-react'
import { SocialMediaImage } from './SocialMediaImage'
import { SourceBadge } from './SourceBadge'
import { ErrorNote, SECONDARY_BUTTON } from './FormField'
import { useUploadSocialBrandLogo, useDeleteSocialBrandLogo } from '@/hooks/useSocialMediaAI'
import { describeApiError } from '@/lib/socialMedia/failureMessages'
import { hasValue } from '@/lib/socialMedia/businessProfile'
import { IMAGE_ACCEPT, imageFileProblem } from '@/lib/socialMedia/catalog'

/**
 * The brand logo. Precedence (decided by the backend): the logo the user uploads here, then the Google Business
 * Profile logo, then the website logo / favicon. The upload goes through the same media validation as product
 * images (JPEG / PNG / WEBP, 8 MB, re-encoded); removing it falls back to the automatic logo. The badge always says
 * where the logo in use came from.
 */
export function BrandLogoCard({ projectId, logo }) {
  const upload = useUploadSocialBrandLogo(projectId)
  const remove = useDeleteSocialBrandLogo(projectId)
  const inputRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [localError, setLocalError] = useState(null)

  const own = logo.source === 'social_override'
  const present = hasValue(logo)
  const busy = upload.isPending || remove.isPending
  const serverError = upload.isError ? describeApiError(upload.error, 'The logo upload failed.').message : remove.isError ? describeApiError(remove.error, 'Could not remove the logo.').message : null

  function onPick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const problem = imageFileProblem(file)
    setLocalError(problem)
    if (problem) return
    remove.reset()
    setProgress(0)
    upload.mutate({ file, onProgress: setProgress })
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="brand-logo">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900">Logo</h3>
        <SourceBadge source={logo.source} detail={logo.detail} />
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {own
          ? 'You uploaded this logo. Social AI and your designs use it.'
          : present
            ? 'Found automatically from your Google Business Profile or website. Upload your own logo to use it instead.'
            : 'No logo was found on your Google Business Profile or website. Upload your own to use one.'}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        {present ? (
          <SocialMediaImage src={logo.value} alt="Business logo" className="h-20 w-20 shrink-0 rounded-xl border border-slate-200" />
        ) : (
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400" aria-hidden>No logo</span>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className={SECONDARY_BUTTON}>
            {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {upload.isPending ? (progress >= 100 ? 'Processing…' : `Uploading ${progress}%`) : own ? 'Replace logo' : 'Upload logo'}
          </button>
          {own && (
            <button type="button" onClick={() => { setLocalError(null); upload.reset(); remove.mutate() }} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60">
              {remove.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Remove uploaded logo
            </button>
          )}
          <input ref={inputRef} type="file" accept={IMAGE_ACCEPT} onChange={onPick} className="hidden" aria-label="Choose a logo image" data-testid="brand-logo-input" />
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-400">JPEG, PNG or WEBP, up to 8 MB. SVG files are not supported.</p>
      <ErrorNote className="mt-3">{localError || serverError}</ErrorNote>
    </div>
  )
}

export default BrandLogoCard
