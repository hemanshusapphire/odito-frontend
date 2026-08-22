"use client"

import { Badge } from '@/components/ui/badge'

// Matches SocialPublication's real STATUSES enum (backend model) exactly
// — draft/scheduled/publishing/published/failed/cancelled. No longer
// sourced from lib/publishingDummyData.js's fabricated Scheduled/
// Published/Draft/Failed set.
const STATUS_STYLE = {
  draft: { variant: 'secondary', label: 'Draft', dot: '#94A3B8' },
  scheduled: { variant: 'info', label: 'Scheduled', dot: '#5B8DEF' },
  publishing: { variant: 'info', label: 'Publishing…', dot: '#5B8DEF' },
  published: { variant: 'success', label: 'Published', dot: '#34D399' },
  failed: { variant: 'critical', label: 'Failed', dot: '#F1665F' },
  cancelled: { variant: 'secondary', label: 'Cancelled', dot: '#94A3B8' },
}

/** Shared status pill, reused across every Publishing sub-tab. */
export default function StatusBadge({ status }) {
  const style = STATUS_STYLE[status] || { variant: 'secondary', label: status }
  return <Badge variant={style.variant}>{style.label}</Badge>
}

export { STATUS_STYLE }
