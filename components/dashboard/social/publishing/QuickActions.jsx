"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, UploadCloud, FileText, CalendarClock, Clock3 } from 'lucide-react'
import { PLATFORMS } from '@/lib/socialMediaDummyData'
import { postCounts, scheduledTodayCount, INITIAL_PLANNER_TASKS } from '@/lib/publishingDummyData'

/** Right-side Quick Actions + Platform Status panel for the Publishing tab. */
export default function QuickActions({ onCreatePost, onGoToTab }) {
  const counts = postCounts()
  const pendingApproval = INITIAL_PLANNER_TASKS.filter((t) => t.status === 'Planned').length

  const stats = [
    { key: 'drafts', label: 'Drafts', value: counts.Draft, icon: FileText, onClick: () => onGoToTab('posts') },
    { key: 'scheduledToday', label: 'Scheduled Today', value: scheduledTodayCount(), icon: CalendarClock, onClick: () => onGoToTab('schedule') },
    { key: 'pendingApproval', label: 'Pending Approval', value: pendingApproval, icon: Clock3, onClick: () => onGoToTab('planner') },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Quick Actions</h4>
        <div className="flex flex-col gap-2">
          <Button size="sm" onClick={onCreatePost} className="gap-2 justify-start">
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
          <Button size="sm" variant="outline" onClick={() => onGoToTab('bulk-upload')} className="gap-2 justify-start">
            <UploadCloud className="h-4 w-4" />
            Bulk Upload
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-col gap-2.5">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.key}
                onClick={s.onClick}
                className="flex items-center justify-between rounded-lg bg-muted/30 hover:bg-muted/50 px-3 py-2.5 transition-colors text-left"
              >
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  {s.label}
                </span>
                <span className="font-mono font-bold text-sm">{s.value}</span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Platform Status</h4>
        <div className="flex flex-col gap-2">
          {PLATFORMS.map((p) => {
            const Icon = p.icon
            return (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" style={{ color: p.brandColor }} />
                  {p.name}
                </span>
                <Badge variant={p.connected ? 'success' : 'secondary'} className="text-[10px]">
                  {p.connected ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
