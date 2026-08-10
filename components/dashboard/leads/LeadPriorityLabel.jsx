"use client"

import { Star } from 'lucide-react'
import { PRIORITY_COLOR_CLASS } from '@/lib/leadsDummyData'

/** Compact "★ Medium" / "☆ Low" priority indicator, matching the mockup. */
export default function LeadPriorityLabel({ priority }) {
  const colorClass = PRIORITY_COLOR_CLASS[priority] || 'text-muted-foreground'
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${colorClass}`}>
      <Star className="h-3 w-3" fill={priority === 'Low' ? 'none' : 'currentColor'} />
      {priority}
    </span>
  )
}
