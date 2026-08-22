"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { PencilLine } from 'lucide-react'

import AccountSelector from './create-post/AccountSelector'
import PostTextarea, { MAX_POST_CHARS } from './create-post/PostTextarea'
import MediaUploader from './create-post/MediaUploader'
import ScheduleSection from './create-post/ScheduleSection'
import ApprovalCheckbox from './create-post/ApprovalCheckbox'
import ModalFooter from './create-post/ModalFooter'
import { TIMEZONES } from './create-post/TimezoneSelect'
import { localScheduleToUtcIso } from '@/lib/scheduleTime'

// The REAL current date — not lib/leadsDummyData.js's TODAY_ISO, which is
// a fixed fake "today" (2026-07-31) baked into that demo dataset. Using
// it here would silently default every new post's schedule date to a
// date that is now in the past, which is exactly the kind of fabricated/
// wrong data this Publishing phase removes elsewhere.
function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const DEFAULT_SCHEDULE = () => ({ timezone: TIMEZONES[0].value, date: todayIso(), hour: '09', minute: '00', format: 'AM' })

/**
 * Create New Post modal - same prop contract every call site already used
 * (open/onOpenChange/platforms/onSubmit) so none of its three mount points
 * (social Overview/Feeds/Publishing pages) needed to change here. What
 * `onSubmit` actually DOES with the payload is now real for the
 * Publishing page (app/app/social/publishing/page.jsx creates a real
 * SocialPublication — draft, scheduled, or immediately published via
 * Meta); Overview/Feeds still only show a toast, which is honest since
 * neither of those pages has anywhere durable to put a new post. Media
 * selection is still local-preview-only (no upload pipeline exists yet —
 * see MediaUploader.jsx's own comment); a real submission with files
 * attached is rejected with a clear message rather than silently
 * discarding the media (see the Publishing page's handleCreatePost).
 *
 * `onSubmit` may return `false` (or resolve to `false`) to report a
 * complete failure — the dialog then stays OPEN with the user's text/
 * media/schedule exactly as they left it, instead of closing regardless
 * of outcome. Returning anything else (including `undefined`, what
 * Overview/Feeds' own trivial toast-only handlers still do) is treated as
 * success and closes+resets the dialog as before.
 *
 * `projectId` is required for real media uploads (MediaUploader.jsx posts
 * to /social/media/upload, which is project-scoped) — Overview/Feeds/
 * Publishing all pass their own `activeProjectId` through unchanged.
 */
export default function CreatePostDialog({ open, onOpenChange, platforms, onSubmit, projectId }) {
  const [selected, setSelected] = useState(() => platforms.filter((p) => p.connected).map((p) => p.id))
  const [text, setText] = useState('')
  const [mediaMode, setMediaMode] = useState('image')
  const [files, setFiles] = useState([])
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE)
  const [noApprovalNeeded, setNoApprovalNeeded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingAction, setLoadingAction] = useState(null)

  function reset() {
    setSelected(platforms.filter((p) => p.connected).map((p) => p.id))
    setText('')
    setMediaMode('image')
    setFiles([])
    setSchedule(DEFAULT_SCHEDULE)
    setNoApprovalNeeded(false)
    setLoading(false)
    setLoadingAction(null)
  }

  function handleOpenChange(next) {
    if (!next) reset()
    onOpenChange(next)
  }

  function toggleAccount(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  // Instagram has no text-only post type at all — every real Instagram
  // publish requires media (see instagramAdapter.js's MEDIA_REQUIRED
  // check). This is surfaced as a non-blocking hint, not a hard submit
  // gate: Facebook + Instagram are both selected by default whenever both
  // are connected, and a hard block here would prevent the common
  // "post text to Facebook" case unless the user first manually deselects
  // Instagram every time. Submitting anyway is safe — the per-platform
  // loop in each page's onSubmit already reports Facebook's real success
  // alongside Instagram's real MEDIA_REQUIRED failure separately (see
  // publishing/page.jsx's "some succeeded, one failed" path), which is
  // more honest than an all-or-nothing block.
  const instagramNeedsMedia = selected.includes('instagram') && files.length === 0
  const mediaUploading = files.some((f) => f.status === 'uploading')
  const mediaHasError = files.some((f) => f.status === 'error')
  const canSubmit = text.trim().length > 0 && text.length <= MAX_POST_CHARS && selected.length > 0
    && !loading && !mediaUploading && !mediaHasError

  function buildPayload(scheduledAt) {
    return {
      text: text.trim(),
      platformIds: selected,
      // Only successfully-uploaded files ever reach the backend — never a
      // local blob: preview URL and never a still-uploading/failed file.
      media: files.filter((f) => f.status === 'done').map((f) => ({ url: f.uploadedMedia.url, type: f.uploadedMedia.type })),
      mediaMode,
      noApprovalNeeded,
      scheduledAt,
      // Recorded alongside scheduledAt (see socialPublishingService.js) so
      // the UI can later display the scheduled time back in the zone the
      // user actually picked, not just an ambiguous UTC instant.
      timezone: scheduledAt ? schedule.timezone : null,
    }
  }

  // `onSubmit` reports whether the submission actually succeeded (return
  // `false` for a complete failure/rejection — e.g. the Publishing page's
  // real handler when Meta/validation rejects every target platform, such
  // as a photo/video post before a media-upload pipeline exists). Only a
  // real success closes the dialog and clears the user's draft — a
  // rejected submission stays open with everything they typed/attached
  // still in place, and the toast `onSubmit` already shows explains why,
  // instead of silently discarding their post with no visible reason
  // (the exact bug this replaces: the dialog used to close unconditionally
  // even when nothing was ever sent to the backend).
  async function submitWith(action, scheduledAt) {
    if (!canSubmit) return
    setLoading(true)
    setLoadingAction(action)
    try {
      await new Promise((resolve) => setTimeout(resolve, 700))
      const result = await onSubmit(buildPayload(scheduledAt))
      if (result !== false) handleOpenChange(false)
    } finally {
      setLoading(false)
      setLoadingAction(null)
    }
  }

  function handlePublishNow() {
    submitWith('publish', null)
  }

  // Converts the local date/hour/minute/format picked in ScheduleSection,
  // interpreted in the IANA timezone the user selected, into an absolute
  // UTC ISO timestamp (see lib/scheduleTime.js). This used to build a
  // naive "YYYY-MM-DDTHH:mm:ss" string and hand it straight to the
  // backend's `new Date(...)`, which silently applied whatever timezone
  // the server process happened to be running in — never the timezone
  // shown in the dropdown — so every zone but the server's own produced a
  // wrong stored instant.
  function handleSchedule() {
    const scheduledAt = localScheduleToUtcIso(schedule)
    if (!scheduledAt) return // defensive: DatePicker/TimeSelector only ever produce valid values
    submitWith('schedule', scheduledAt)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto p-0 gap-0">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="flex flex-col"
        >
          <DialogHeader className="flex-row items-center justify-between space-y-0 px-6 py-5 border-b">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <PencilLine className="h-4.5 w-4.5" />
              </span>
              <DialogTitle className="text-xl">Create New Post</DialogTitle>
            </div>
          </DialogHeader>
          <DialogDescription className="sr-only">
            Compose a post, choose which connected accounts to publish it to, and publish now or schedule it for later.
          </DialogDescription>

          <div className="flex flex-col gap-6 px-6 py-6">
            <AccountSelector platforms={platforms} selected={selected} onToggle={toggleAccount} />

            <PostTextarea value={text} onChange={setText} />

            <MediaUploader projectId={projectId} mode={mediaMode} onModeChange={setMediaMode} files={files} onFilesChange={setFiles} />

            <ScheduleSection schedule={schedule} onChange={setSchedule} />

            <ApprovalCheckbox checked={noApprovalNeeded} onChange={setNoApprovalNeeded} />
          </div>

          <div className="px-6 pb-6">
            {instagramNeedsMedia && (
              <p className="text-xs text-destructive mb-3">Instagram requires a photo or video — add media above or deselect Instagram.</p>
            )}
            {mediaHasError && !instagramNeedsMedia && (
              <p className="text-xs text-destructive mb-3">Fix or remove the failed upload above before posting.</p>
            )}
            <ModalFooter
              disabled={!canSubmit}
              loading={loading}
              loadingAction={loadingAction}
              onPublishNow={handlePublishNow}
              onSchedule={handleSchedule}
            />
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
