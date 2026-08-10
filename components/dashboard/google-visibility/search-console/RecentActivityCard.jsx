"use client"

import { Card } from '@/components/ui/card'
import { History } from 'lucide-react'

/**
 * Chronological feed of real Odito sync events (see
 * lib/searchConsoleActivity.js) - Google exposes no general activity/audit
 * log API for Search Console, so this is never fabricated: an event only
 * appears once its underlying sync has actually run. Mirrors
 * business-profile/RecentActivityCard.jsx.
 */
export default function RecentActivityCard({ activity }) {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Recent Search Console Activity</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Latest sync activity for this property</p>

      {!activity?.length ? (
        <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-8">
          <History className="h-8 w-8 opacity-40" />
          <p className="text-sm">No activity yet. Run "Sync Now" to get started.</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {activity.map((item, i) => (
            <li key={item.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: item.color }} />
                {i < activity.length - 1 && <span className="w-px flex-1 bg-border mt-1.5" />}
              </div>
              <div className="pb-0.5 flex-1 flex items-center justify-between gap-3 min-w-0">
                <p className="text-xs text-foreground leading-relaxed">{item.text}</p>
                <p className="text-[11px] text-muted-foreground shrink-0">{item.timestamp}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
