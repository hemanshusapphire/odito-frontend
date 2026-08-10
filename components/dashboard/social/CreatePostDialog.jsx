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
import { TODAY_ISO } from '@/lib/leadsDummyData'

const DEFAULT_SCHEDULE = { timezone: TIMEZONES[0].value, date: TODAY_ISO, hour: '09', minute: '00', format: 'AM' }

/**
 * Create New Post modal - redesigned UI over the same prop contract this
 * component has always had (open/onOpenChange/platforms/onSubmit), so none
 * of its three call sites (social Overview/Feeds/Publishing pages) needed
 * to change. Everything below is local component state: no React Hook
 * Form, no file upload pipeline, no scheduling API - this was already a
 * frontend-only mock composer, and stays one, just with the fuller
 * account-selection/media/scheduling UI the reference calls for.
 */
export default function CreatePostDialog({ open, onOpenChange, platforms, onSubmit }) {
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

  const canSubmit = text.trim().length > 0 && text.length <= MAX_POST_CHARS && selected.length > 0 && !loading

  function buildPayload(scheduledAt) {
    return {
      text: text.trim(),
      platformIds: selected,
      media: files.map((f) => f.file),
      mediaMode,
      noApprovalNeeded,
      scheduledAt,
    }
  }

  function submitWith(action, scheduledAt) {
    if (!canSubmit) return
    setLoading(true)
    setLoadingAction(action)
    setTimeout(() => {
      onSubmit(buildPayload(scheduledAt))
      handleOpenChange(false)
    }, 700)
  }

  function handlePublishNow() {
    submitWith('publish', null)
  }

  function handleSchedule() {
    const hour24 = schedule.format === 'PM' ? (Number(schedule.hour) % 12) + 12 : Number(schedule.hour) % 12
    const scheduledAt = `${schedule.date}T${String(hour24).padStart(2, '0')}:${schedule.minute}:00`
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

            <MediaUploader mode={mediaMode} onModeChange={setMediaMode} files={files} onFilesChange={setFiles} />

            <ScheduleSection schedule={schedule} onChange={setSchedule} />

            <ApprovalCheckbox checked={noApprovalNeeded} onChange={setNoApprovalNeeded} />
          </div>

          <div className="px-6 pb-6">
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
