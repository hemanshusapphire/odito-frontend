"use client"

import { Card } from '@/components/ui/card'
import { History } from 'lucide-react'
import { formatRelativeTime } from '@/lib/formatRelativeTime'

// Backend (AnalyticsMapper.toActivityDTO) returns {id, text, timestamp} -
// raw ISO timestamps, no color (a display concern, assigned here) and no
// pre-formatted relative time (formatted here via the same util the
// Analytics/Business Profile headers already use for "Synced x ago").
const ACTIVITY_COLOR = { connected: '#3b82f6', last_sync: '#10b981' }
const DEFAULT_COLOR = '#64748b'

/**
 * Chronological feed of real sync/connection events for this property.
 * Same timeline pattern as business-profile/RecentActivityCard.jsx, kept as
 * a local copy rather than a cross-feature import so Analytics and Business
 * Profile stay independently deployable pieces that merely look alike.
 */
export default function RecentActivityCard({ activity = [] }) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Recent Analytics Activity</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Latest sync and connection events</p>

      {!activity.length ? (
        <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-8">
          <History className="h-8 w-8 opacity-40" />
          <p className="text-sm">No activity yet. Connect and select a property to get started.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {activity.map((item, i) => (
            <li key={item.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: ACTIVITY_COLOR[item.id] || DEFAULT_COLOR }} />
                {i < activity.length - 1 && <span className="w-px flex-1 bg-border mt-1.5" />}
              </div>
              <div className="pb-0.5 flex-1 flex items-center justify-between gap-3 min-w-0">
                <p className="text-xs text-foreground leading-relaxed">{item.text}</p>
                <p className="text-[11px] text-muted-foreground shrink-0">{formatRelativeTime(item.timestamp)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
