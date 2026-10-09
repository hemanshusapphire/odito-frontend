"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Tag,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  MousePointerClick,
  AlertCircle,
  Clock,
  Sparkles,
  Ticket
} from 'lucide-react'

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return ''
  }
}

function formatScheduleDate(dateObj, timeObj) {
  if (!dateObj || !dateObj.year) return ''
  const pad = (n) => String(n).padStart(2, '0')
  const dateStr = `${dateObj.year}-${pad(dateObj.month)}-${pad(dateObj.day)}`
  if (timeObj && timeObj.hours !== undefined) {
    return `${dateStr} at ${pad(timeObj.hours)}:${pad(timeObj.minutes || 0)}`
  }
  return dateStr
}

const TOPIC_CONFIG = {
  STANDARD: { label: "What's New", variant: 'default', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  EVENT: { label: 'Event', variant: 'secondary', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  OFFER: { label: 'Special Offer', variant: 'outline', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  ALERT: { label: 'Alert', variant: 'destructive', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
}

const STATE_CONFIG = {
  LIVE: { label: 'Live', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  PROCESSING: { label: 'Processing', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  REJECTED: { label: 'Rejected', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  LOCAL_POST_STATE_UNSPECIFIED: { label: 'Published', className: 'bg-muted text-muted-foreground' }
}

const CTA_LABELS = {
  BOOK: 'Book',
  ORDER: 'Order online',
  SHOP: 'Buy / Shop',
  LEARN_MORE: 'Learn more',
  SIGN_UP: 'Sign up',
  CALL: 'Call now',
  ACTION_TYPE_UNSPECIFIED: 'Visit'
}

export default function PostCard({ post, onEdit, onDelete }) {
  const [imgError, setImgError] = useState(false)

  const topic = TOPIC_CONFIG[post.topic_type] || TOPIC_CONFIG.STANDARD
  const state = STATE_CONFIG[post.state] || STATE_CONFIG.LIVE
  const firstMedia = post.media?.[0]
  const imageUrl = firstMedia?.google_url || firstMedia?.source_url

  const cta = post.call_to_action
  const hasCta = cta && cta.action_type && cta.action_type !== 'ACTION_TYPE_UNSPECIFIED'

  return (
    <Card className="flex flex-col justify-between overflow-hidden transition-all hover:shadow-md border">
      <div>
        {/* Media banner if present */}
        {imageUrl && !imgError && (
          <div className="relative aspect-video w-full overflow-hidden bg-muted/40 border-b">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={post.summary?.slice(0, 40) || 'Post image'}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="p-4 space-y-3">
          {/* Header row: Topic badge, Status badge, Date */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${topic.color}`}>
                {topic.label}
              </span>

              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${state.className}`}>
                {state.label}
              </span>
            </div>

            <span className="text-muted-foreground text-[11px] flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(post.create_time)}
            </span>
          </div>

          {/* Rejection notice if state is REJECTED */}
          {post.state === 'REJECTED' && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Post rejected by Google</p>
                <p className="text-[11px] text-destructive/80 mt-0.5">
                  {post.rejection_reason || 'This post violates Google Business Profile content guidelines.'}
                </p>
              </div>
            </div>
          )}

          {/* Event details if EVENT */}
          {post.event && post.event.title && (
            <div className="rounded-md bg-purple-500/5 border border-purple-500/15 p-2.5 space-y-1">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {post.event.title}
              </p>
              {post.event.schedule && (
                <p className="text-[11px] text-muted-foreground">
                  {formatScheduleDate(post.event.schedule.start_date, post.event.schedule.start_time)}
                  {' — '}
                  {formatScheduleDate(post.event.schedule.end_date, post.event.schedule.end_time)}
                </p>
              )}
            </div>
          )}

          {/* Offer details if OFFER */}
          {post.offer && (post.offer.coupon_code || post.offer.terms_conditions) && (
            <div className="rounded-md bg-amber-500/5 border border-amber-500/15 p-2.5 space-y-1.5 text-xs">
              {post.offer.coupon_code && (
                <div className="flex items-center gap-1.5">
                  <Ticket className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-[11px] text-muted-foreground">Coupon:</span>
                  <code className="px-1.5 py-0.5 bg-amber-500/10 rounded font-mono font-bold text-amber-600 dark:text-amber-400">
                    {post.offer.coupon_code}
                  </code>
                </div>
              )}
              {post.offer.terms_conditions && (
                <p className="text-[11px] text-muted-foreground italic">
                  Terms: {post.offer.terms_conditions}
                </p>
              )}
            </div>
          )}

          {/* Summary / Body text */}
          {post.summary && (
            <p className="text-sm text-foreground/90 whitespace-pre-wrap line-clamp-4 leading-relaxed">
              {post.summary}
            </p>
          )}

          {/* Call to Action button link */}
          {hasCta && cta.url && (
            <div className="pt-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 font-medium"
                asChild
              >
                <a href={cta.url} target="_blank" rel="noopener noreferrer">
                  {CTA_LABELS[cta.action_type] || 'Visit'}
                  <ExternalLink className="h-3 w-3 ml-0.5 opacity-70" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Insights and Actions */}
      <div className="border-t bg-muted/20 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Performance metrics from Google */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1 text-[11px]" title="Search views">
            <Eye className="h-3.5 w-3.5 text-blue-500" />
            <span className="font-semibold text-foreground">{(post.views_search || 0).toLocaleString()}</span>
            <span>views</span>
          </div>

          <div className="flex items-center gap-1 text-[11px]" title="Button clicks">
            <MousePointerClick className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-semibold text-foreground">{(post.actions_call_to_action || 0).toLocaleString()}</span>
            <span>clicks</span>
          </div>
        </div>

        {/* Buttons: Search link, Edit, Delete */}
        <div className="flex items-center gap-1">
          {post.search_url && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="View on Google Search"
              asChild
            >
              <a href={post.search_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(post)}
            title="Edit post"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(post)}
            title="Delete post"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
