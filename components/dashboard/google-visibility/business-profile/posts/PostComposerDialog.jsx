"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, AlertCircle, Image as ImageIcon, X } from 'lucide-react'
import PostImageUploader from './PostImageUploader'

const MAX_CHARS = 1500

function isValidHttpUrl(str) {
  try {
    const u = new URL(str)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function parseDateForInput(dateObj, timeObj) {
  if (!dateObj || !dateObj.year) return ''
  const pad = (n) => String(n).padStart(2, '0')
  const dateStr = `${dateObj.year}-${pad(dateObj.month)}-${pad(dateObj.day)}`
  const timeStr = timeObj && timeObj.hours !== undefined ? `T${pad(timeObj.hours)}:${pad(timeObj.minutes || 0)}` : 'T09:00'
  return `${dateStr}${timeStr}`
}

function parseInputToGoogleSchedule(datetimeString) {
  if (!datetimeString) return null
  const d = new Date(datetimeString)
  if (isNaN(d.getTime())) return null

  return {
    date: {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate()
    },
    time: {
      hours: d.getHours(),
      minutes: d.getMinutes(),
      seconds: 0,
      nanos: 0
    }
  }
}

export default function PostComposerDialog({
  open,
  onOpenChange,
  post = null, // null for create, object for edit
  projectId = '',
  onSubmit,
  isSubmitting = false
}) {
  const isEdit = !!post

  const [topicType, setTopicType] = useState('STANDARD')
  const [summary, setSummary] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [ctaType, setCtaType] = useState('ACTION_TYPE_UNSPECIFIED')
  const [ctaUrl, setCtaUrl] = useState('')

  // Event fields
  const [eventTitle, setEventTitle] = useState('')
  const [eventStart, setEventStart] = useState('')
  const [eventEnd, setEventEnd] = useState('')

  // Offer fields
  const [couponCode, setCouponCode] = useState('')
  const [redeemUrl, setRedeemUrl] = useState('')
  const [terms, setTerms] = useState('')

  const [formError, setFormError] = useState('')

  // Populate fields when editing or reset on open
  useEffect(() => {
    if (open) {
      setFormError('')
      if (post) {
        setTopicType(post.topic_type || 'STANDARD')
        setSummary(post.summary || '')
        setMediaUrl(post.media?.[0]?.source_url || post.media?.[0]?.google_url || '')
        setCtaType(post.call_to_action?.action_type || 'ACTION_TYPE_UNSPECIFIED')
        setCtaUrl(post.call_to_action?.url || '')

        if (post.event) {
          setEventTitle(post.event.title || '')
          setEventStart(parseDateForInput(post.event.schedule?.start_date, post.event.schedule?.start_time))
          setEventEnd(parseDateForInput(post.event.schedule?.end_date, post.event.schedule?.end_time))
        } else {
          setEventTitle('')
          setEventStart('')
          setEventEnd('')
        }

        if (post.offer) {
          setCouponCode(post.offer.coupon_code || '')
          setRedeemUrl(post.offer.redeem_online_url || '')
          setTerms(post.offer.terms_conditions || '')
        } else {
          setCouponCode('')
          setRedeemUrl('')
          setTerms('')
        }
      } else {
        setTopicType('STANDARD')
        setSummary('')
        setMediaUrl('')
        setCtaType('ACTION_TYPE_UNSPECIFIED')
        setCtaUrl('')
        setEventTitle('')
        setEventStart('')
        setEventEnd('')
        setCouponCode('')
        setRedeemUrl('')
        setTerms('')
      }
    }
  }, [open, post])

  function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    if (isUploadingImage) {
      setFormError('Please wait for the image to finish uploading.')
      return
    }

    const trimmedSummary = summary.trim()
    if (!trimmedSummary) {
      setFormError('Post text is required.')
      return
    }

    if (trimmedSummary.length > MAX_CHARS) {
      setFormError(`Post text cannot exceed ${MAX_CHARS} characters.`)
      return
    }

    if (mediaUrl && !isValidHttpUrl(mediaUrl)) {
      setFormError('Photo URL must be a valid http or https web link.')
      return
    }

    if (ctaType !== 'ACTION_TYPE_UNSPECIFIED' && ctaType !== 'CALL') {
      if (!ctaUrl || !isValidHttpUrl(ctaUrl)) {
        setFormError('A valid web link (http/https) is required for the call-to-action button.')
        return
      }
    }

    const payload = {
      summary: trimmedSummary,
      topicType,
      mediaUrl: mediaUrl.trim() || undefined,
      callToAction: ctaType !== 'ACTION_TYPE_UNSPECIFIED' ? {
        actionType: ctaType,
        url: ctaType === 'CALL' ? undefined : ctaUrl.trim()
      } : { actionType: 'ACTION_TYPE_UNSPECIFIED', url: null }
    }

    if (topicType === 'EVENT' || topicType === 'OFFER') {
      if (!eventTitle.trim()) {
        setFormError('Event title is required.')
        return
      }
      if (!eventStart || !eventEnd) {
        setFormError('Start date and end date are required for events and offers.')
        return
      }

      const parsedStart = parseInputToGoogleSchedule(eventStart)
      const parsedEnd = parseInputToGoogleSchedule(eventEnd)

      if (!parsedStart || !parsedEnd) {
        setFormError('Please enter valid start and end dates.')
        return
      }

      payload.event = {
        title: eventTitle.trim(),
        schedule: {
          startDate: parsedStart.date,
          startTime: parsedStart.time,
          endDate: parsedEnd.date,
          endTime: parsedEnd.time
        }
      }
    }

    if (topicType === 'OFFER') {
      payload.offer = {
        couponCode: couponCode.trim() || undefined,
        redeemOnlineUrl: redeemUrl.trim() || undefined,
        termsConditions: terms.trim() || undefined
      }
    }

    onSubmit(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Google Business Post' : 'Create Google Business Post'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update your post content directly on Google Business Profile.'
              : 'Publish an update, event, or offer to your Google Business Profile.'}
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Topic type picker (only selectable on new post creation) */}
          {!isEdit && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Post Type</Label>
              <Tabs value={topicType} onValueChange={setTopicType} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="STANDARD" className="text-xs">What's New</TabsTrigger>
                  <TabsTrigger value="EVENT" className="text-xs">Event</TabsTrigger>
                  <TabsTrigger value="OFFER" className="text-xs">Offer</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Event specific fields */}
          {(topicType === 'EVENT' || topicType === 'OFFER') && (
            <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
              <div className="space-y-1">
                <Label htmlFor="eventTitle" className="text-xs font-medium">Event Title *</Label>
                <Input
                  id="eventTitle"
                  placeholder="e.g. Summer Sale Launch or Workshop"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="eventStart" className="text-xs font-medium">Start Date & Time *</Label>
                  <Input
                    id="eventStart"
                    type="datetime-local"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="eventEnd" className="text-xs font-medium">End Date & Time *</Label>
                  <Input
                    id="eventEnd"
                    type="datetime-local"
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Offer specific fields */}
          {topicType === 'OFFER' && (
            <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="couponCode" className="text-xs font-medium">Coupon Code (optional)</Label>
                  <Input
                    id="couponCode"
                    placeholder="e.g. SAVE20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="redeemUrl" className="text-xs font-medium">Redeem URL (optional)</Label>
                  <Input
                    id="redeemUrl"
                    placeholder="https://example.com/redeem"
                    value={redeemUrl}
                    onChange={(e) => setRedeemUrl(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="terms" className="text-xs font-medium">Terms & Conditions (optional)</Label>
                <Input
                  id="terms"
                  placeholder="e.g. One per customer. Valid until stock lasts."
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          )}

          {/* Post description / body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <Label htmlFor="postSummary" className="font-semibold">Post Content *</Label>
              <span className={`tabular-nums ${summary.length > MAX_CHARS ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                {summary.length} / {MAX_CHARS}
              </span>
            </div>
            <Textarea
              id="postSummary"
              placeholder="What's new with your business? Share updates, details, promotions, or news with customers..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="min-h-[120px] text-xs resize-y"
            />
          </div>

          {/* Post Image Upload */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Post Image (optional)</Label>
            <PostImageUploader
              projectId={projectId}
              mediaUrl={mediaUrl}
              onChange={setMediaUrl}
              onUploadingChange={setIsUploadingImage}
              disabled={isSubmitting}
            />
          </div>

          {/* Call to Action button config */}
          <div className="space-y-2 rounded-lg border bg-muted/10 p-3">
            <Label className="text-xs font-semibold">Action Button (CTA)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="ctaType" className="text-[11px] text-muted-foreground">Button Type</Label>
                <Select value={ctaType} onValueChange={setCtaType}>
                  <SelectTrigger id="ctaType" className="h-8 text-xs">
                    <SelectValue placeholder="Select Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTION_TYPE_UNSPECIFIED">None</SelectItem>
                    <SelectItem value="BOOK">Book</SelectItem>
                    <SelectItem value="ORDER">Order online</SelectItem>
                    <SelectItem value="SHOP">Buy / Shop</SelectItem>
                    <SelectItem value="LEARN_MORE">Learn more</SelectItem>
                    <SelectItem value="SIGN_UP">Sign up</SelectItem>
                    <SelectItem value="CALL">Call now</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {ctaType !== 'ACTION_TYPE_UNSPECIFIED' && ctaType !== 'CALL' && (
                <div className="space-y-1">
                  <Label htmlFor="ctaUrl" className="text-[11px] text-muted-foreground">Button URL *</Label>
                  <Input
                    id="ctaUrl"
                    placeholder="https://yourwebsite.com/action"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isUploadingImage}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || isUploadingImage}
              className="gap-2"
            >
              {(isSubmitting || isUploadingImage) && <Loader2 className="h-4 w-4 animate-spin" />}
              {isUploadingImage
                ? 'Uploading Image...'
                : isSubmitting
                ? isEdit
                  ? 'Saving Changes...'
                  : 'Publishing to Google...'
                : isEdit
                ? 'Save Changes'
                : 'Publish to Google'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
