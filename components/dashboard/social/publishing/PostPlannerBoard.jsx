"use client"

import { Card } from '@/components/ui/card'
import { CalendarRange } from 'lucide-react'

/**
 * Post Planner previously showed a fully fake weekly board (drag/drop
 * between days, fabricated topics/campaigns/assignees, no persistence of
 * any kind). There is no real content-planning workflow in Odito yet
 * (no Campaign or team-assignment model exists), so this is now an honest
 * "coming soon" state rather than fabricated planning data.
 */
export default function PostPlannerBoard() {
  return (
    <Card className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
        <CalendarRange className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold mb-1.5">Post Planner is coming soon</h3>
      <p className="text-muted-foreground text-sm max-w-sm">
        Weekly content planning with campaigns and team assignments isn't available yet. Use Schedule to plan individual posts in the meantime.
      </p>
    </Card>
  )
}
