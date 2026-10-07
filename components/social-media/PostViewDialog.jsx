"use client"

import { ExternalLink } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { CALENDAR_PLATFORM_META } from '@/lib/socialMediaAIDummyData'
import { SocialMediaImage } from './SocialMediaImage'

const STATUS_LABEL = { scheduled: 'Scheduled', publishing: 'Publishing…', published: 'Published', failed: 'Failed', draft: 'Draft' }

/** Read-only detail view of one REAL post: full caption, media, schedule, status and (if any) the backend's failure explanation. */
export function PostViewDialog({ post, open, onOpenChange }) {
  if (!post) return null
  const platform = CALENDAR_PLATFORM_META[post.platform]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-slate-200 bg-white text-slate-800 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Post details</DialogTitle>
          <DialogDescription className="text-slate-500">
            {platform?.label || post.platform} · {STATUS_LABEL[post.status] || post.status}
          </DialogDescription>
        </DialogHeader>

        {post.imageSrc && <SocialMediaImage src={post.imageSrc} className="aspect-video w-full rounded-xl" />}
        {post.mediaType === 'video' && !post.imageSrc && (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">This post includes a video.</p>
        )}

        <p className="whitespace-pre-wrap break-words text-sm text-slate-700" data-testid="post-view-content">{post.content || '(no text)'}</p>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-slate-400">{post.status === 'published' ? 'Published' : 'Scheduled for'}</dt>
          <dd className="text-slate-700">{post.date || '—'} · {post.time || '—'}{post.zone ? ` ${post.zone}` : ''}</dd>
          {post.timezone && (<><dt className="text-slate-400">Timezone</dt><dd className="text-slate-700">{post.timezone}</dd></>)}
          {post.attempts > 0 && (<><dt className="text-slate-400">Attempts</dt><dd className="text-slate-700">{post.attempts}</dd></>)}
        </dl>

        {post.status === 'published' && post.permalink && (
          <a href={post.permalink} target="_blank" rel="noopener noreferrer" data-testid="view-on-facebook" className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-100">
            View on Facebook
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        {post.failure && (
          <div role="note" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <p className="font-semibold">{post.failure.headline}</p>
            {post.failure.detail && post.failure.detail !== post.failure.headline && <p className="mt-0.5 text-amber-800">{post.failure.detail}</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PostViewDialog
