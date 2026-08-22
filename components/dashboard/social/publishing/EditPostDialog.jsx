"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'
import PostTextarea, { MAX_POST_CHARS } from '../create-post/PostTextarea'
import MediaUploader from '../create-post/MediaUploader'

/**
 * Edit a draft or scheduled SocialPublication — content + media only
 * (platform and schedule are not editable here; re-scheduling is a
 * separate action). Saves through the EXISTING useUpdateSocialPost
 * mutation/PATCH endpoint (updatePublication in socialPublishingService.js)
 * — no new backend logic, this is a UI-only addition (Phase 7).
 *
 * Existing media is seeded into MediaUploader as already-`done` entries
 * (previewUrl = the real HTTPS url, uploadedMedia already populated) so
 * removing it needs no re-upload, and adding a new file goes through the
 * exact same real upload pipeline CreatePostDialog uses.
 */
export default function EditPostDialog({ post, projectId, open, onOpenChange, onSave }) {
  const [text, setText] = useState('')
  const [mediaMode, setMediaMode] = useState('image')
  const [files, setFiles] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !post) return
    setText(post.content || '')
    const existingMedia = post.media || []
    setMediaMode(existingMedia.some((m) => m.type === 'video') ? 'video' : 'image')
    setFiles(existingMedia.map((m, i) => ({
      id: `existing-${post.id}-${i}`,
      file: null,
      previewUrl: m.type === 'image' ? m.url : null,
      status: 'done',
      uploadedMedia: { url: m.url, type: m.type },
      error: null,
    })))
  }, [open, post])

  const mediaUploading = files.some((f) => f.status === 'uploading')
  const mediaHasError = files.some((f) => f.status === 'error')
  const canSave = text.trim().length > 0 && text.length <= MAX_POST_CHARS && !mediaUploading && !mediaHasError && !saving

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    try {
      const media = files.filter((f) => f.status === 'done').map((f) => ({ url: f.uploadedMedia.url, type: f.uploadedMedia.type }))
      const ok = await onSave(post.id, { content: text.trim(), media })
      if (ok !== false) onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">Edit this post&apos;s content and media, then save.</DialogDescription>

        <div className="flex flex-col gap-6 py-2">
          <PostTextarea value={text} onChange={setText} />
          <MediaUploader projectId={projectId} mode={mediaMode} onModeChange={setMediaMode} files={files} onFilesChange={setFiles} />
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button onClick={handleSave} disabled={!canSave} className="gap-2 mt-4">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
