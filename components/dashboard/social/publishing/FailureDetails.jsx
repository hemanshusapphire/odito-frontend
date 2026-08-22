"use client"

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { AlertCircle } from 'lucide-react'

/**
 * "View error" affordance for a failed SocialPublication — shared by
 * PostsTable and PostHistoryTable so a failed post never shows only a bare
 * "Failed" badge with no way to see why. `failureReason` (already a safe,
 * specific, non-technical message the backend decided on — see
 * socialPublishingService.js's failPublication) is always shown as the
 * full detail; HEADLINES only adds a short, scannable summary on top of it
 * for the failure codes users can most directly act on.
 *
 * `failureCode` may be null on records created before this field existed
 * (see SocialPublication.js's own comment) — falls back to a generic,
 * still-platform-aware headline in that case, never breaking on an old
 * document.
 */
const HEADLINES = {
  INSTAGRAM_PERMISSION_MISSING: 'Instagram publishing permission is missing. Reconnect your Instagram account.',
  FACEBOOK_PERMISSION_MISSING: 'Facebook publishing permission is missing. Reconnect your Facebook Page.',
  INSTAGRAM_MEDIA_URL_UNREACHABLE: 'Instagram could not access the uploaded media. Publishing requires a publicly reachable HTTPS media URL.',
  FACEBOOK_MEDIA_URL_UNREACHABLE: 'Facebook could not access the uploaded media. Publishing requires a publicly reachable HTTPS media URL.',
  INSTAGRAM_MEDIA_INVALID: 'Instagram could not process this media. It may be corrupt or in an unsupported format.',
  FACEBOOK_MEDIA_INVALID: 'Facebook could not process this media. It may be corrupt or in an unsupported format.',
  INSTAGRAM_PROCESSING_TIMEOUT: 'Instagram is still processing this media. Try publishing again in a moment.',
  FACEBOOK_TOKEN_INVALID: 'Meta denied this request — the Page connection may need to be reconnected.',
  INSTAGRAM_TOKEN_INVALID: 'Meta denied this request — the Instagram connection may need to be reconnected.',
  FACEBOOK_RATE_LIMITED: 'Meta is rate-limiting requests for this Page right now. Try again shortly.',
  INSTAGRAM_RATE_LIMITED: 'Meta is rate-limiting requests for this account right now. Try again shortly.',
}

// Codes where retrying immediately can't possibly help — the underlying
// condition (missing permission, or media Meta can never reach) has to be
// fixed by the user first. Exported so PostsTable/PostHistoryTable can
// swap the Retry action for a "Reconnect required"/"Fix media URL" hint
// instead of a button that will just fail again the exact same way.
export const NOT_RETRYABLE_CODES = new Set([
  'FACEBOOK_PERMISSION_MISSING',
  'INSTAGRAM_PERMISSION_MISSING',
  'FACEBOOK_MEDIA_URL_UNREACHABLE',
  'INSTAGRAM_MEDIA_URL_UNREACHABLE',
])

function genericHeadline(platform) {
  const name = platform === 'instagram' ? 'Instagram' : platform === 'facebook' ? 'Facebook' : 'Meta'
  return `${name} rejected this post. View technical details for troubleshooting.`
}

export default function FailureDetails({ post }) {
  if (post.status !== 'failed' || !post.failureReason) return null
  const headline = HEADLINES[post.failureCode] || genericHeadline(post.platform)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="inline-flex items-center gap-1 text-[10.5px] font-medium text-destructive hover:underline">
          <AlertCircle className="h-3 w-3" />
          View error
        </button>
      </PopoverTrigger>
      <PopoverContent className="text-xs space-y-2" align="start">
        <p className="font-medium text-foreground">{headline}</p>
        <p className="text-muted-foreground">{post.failureReason}</p>
        {post.failureCode && (
          <p className="pt-1 border-t text-[10px] font-mono text-muted-foreground">{post.failureCode}</p>
        )}
      </PopoverContent>
    </Popover>
  )
}
