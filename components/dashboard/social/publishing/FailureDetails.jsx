"use client"

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { AlertCircle } from 'lucide-react'
import { FAILURE_HEADLINES } from '@/lib/socialMedia/failureMessages'

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
// The code -> headline map lives in lib/socialMedia/failureMessages.js so every
// social UI (this popover and the Social Media AI module) shares one source.
const HEADLINES = FAILURE_HEADLINES

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
  // Expired authentication: retrying fails identically until reconnected.
  'FACEBOOK_TOKEN_INVALID',
  'INSTAGRAM_TOKEN_INVALID',
  'ACCOUNT_RECONNECT_REQUIRED',
  // The post may already be live — the backend refuses to re-send until it
  // has verified that (see socialPublishingService.js gateUnknownOutcome).
  'PUBLISH_OUTCOME_UNKNOWN',
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
