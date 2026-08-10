"use client"

import { Button } from '@/components/ui/button'
import { Loader2, Send, CalendarClock } from 'lucide-react'

/** Publish Now (primary) + Schedule (accent) actions, with a disabled/loading state. */
export default function ModalFooter({ disabled, loading, loadingAction, onPublishNow, onSchedule }) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
      <Button
        size="lg"
        onClick={onPublishNow}
        disabled={disabled || loading}
        className="gap-2 sm:min-w-[160px]"
      >
        {loading && loadingAction === 'publish' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Publish Now
      </Button>
      <Button
        variant="secondary"
        size="lg"
        onClick={onSchedule}
        disabled={disabled || loading}
        className="gap-2 sm:min-w-[160px]"
      >
        {loading && loadingAction === 'schedule' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
        Schedule
      </Button>
    </div>
  )
}
