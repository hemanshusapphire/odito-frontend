"use client"

import { useRef } from 'react'
import { Loader2, Upload } from 'lucide-react'
import { DesignPreview } from './DesignPreview'
import { DesignGenerateControl } from './DesignGenerateControl'

/**
 * The post's DESIGN as it exists today: its media (an image or video that was
 * uploaded through Odito's own upload endpoint). A design is either an image Odito's AI drew for the
 * approved caption (DesignGenerateControl) or a file uploaded by hand — the same upload the post composer
 * uses. Whatever the media is, it is what the backend versions and what a
 * design approval is bound to: replacing it creates a new design version and
 * withdraws any earlier design approval.
 */
export function DesignApprovalPanel({ post, projectId = null, uploading = false, error = null, onReplace }) {
  const inputRef = useRef(null)
  const a = post.approval
  const hasMedia = post.media.length > 0
  const first = post.media[0]
  const canReplace = post.canEdit

  const designStatus = !a.managed
    ? null
    : a.state === 'design_approved'
      ? (a.designAutoApproved ? 'Approved automatically (design approval is not required)' : `Approved${a.designApprovedByName ? ` by ${a.designApprovedByName}` : ''}`)
      : a.state === 'design_review'
        ? (a.needsChanges ? 'Changes requested' : 'Waiting for approval')
        : a.state === 'content_approved'
          ? 'Not submitted yet'
          : 'Starts after content is approved'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5" data-testid="design-panel">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">Design</h2>
        {a.managed && <span className="text-xs font-medium text-slate-500">Version {a.designVersion}</span>}
      </div>
      {designStatus && <p className="mt-1 text-sm text-slate-500" data-testid="design-status">{designStatus}</p>}

      <div className="mt-4">
        {hasMedia && first.type === 'image' ? (
          <DesignPreview src={first.url} alt="Post design" />
        ) : hasMedia && first.type === 'video' ? (
          <video src={first.url} controls className="aspect-video w-full rounded-xl bg-slate-900" aria-label="Post design video" />
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
            <p className="text-sm font-medium text-slate-600">No image or video on this post</p>
            <p className="text-xs text-slate-400">It will be published as a text post{post.platform === 'instagram' ? ' — Instagram needs media' : ''}.</p>
          </div>
        )}
      </div>

      {projectId && <DesignGenerateControl projectId={projectId} post={post} />}

      {error && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {canReplace && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">{post.status === 'scheduled' ? 'Replacing the design removes the schedule and needs design approval again. ' : ''}Or upload the final image or video yourself.</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Uploading…' : hasMedia ? 'Replace design' : 'Add design'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            className="sr-only"
            aria-label="Upload design file"
            data-testid="design-file-input"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) onReplace(file)
            }}
          />
        </div>
      )}
    </div>
  )
}

export default DesignApprovalPanel
