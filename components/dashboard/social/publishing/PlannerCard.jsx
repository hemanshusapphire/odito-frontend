"use client"

import { Badge } from '@/components/ui/badge'
import { GripVertical } from 'lucide-react'
import { PUBLISHING_PLATFORMS, PLANNER_STATUS_VARIANT } from '@/lib/publishingDummyData'

const PRIORITY_DOT = { High: 'bg-destructive', Medium: 'bg-amber-500', Low: 'bg-slate-400' }

/** One draggable planner task card - platform, topic, campaign, priority, status, assignee. */
export default function PlannerCard({ task, onDragStart }) {
  const platform = PUBLISHING_PLATFORMS.find((p) => p.id === task.platform)
  const Icon = platform.icon

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="rounded-xl border bg-card p-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: platform.color }}>
          <Icon className="h-3.5 w-3.5" />
          {platform.name}
        </span>
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
      </div>

      <p className="text-sm font-medium leading-snug">{task.topic}</p>
      <p className="text-[11px] text-muted-foreground truncate">{task.campaign}</p>

      <div className="flex items-center justify-between gap-2 mt-1">
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
          {task.priority}
        </span>
        <Badge variant={PLANNER_STATUS_VARIANT[task.status]} className="text-[10px]">{task.status}</Badge>
      </div>

      <div className="text-[11px] text-muted-foreground border-t pt-1.5 mt-0.5">{task.assignee}</div>
    </div>
  )
}
