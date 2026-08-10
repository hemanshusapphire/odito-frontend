"use client"

import { Badge } from '@/components/ui/badge'
import { STATUS_STYLE } from '@/lib/publishingDummyData'

/** Shared Scheduled/Published/Draft/Failed pill, reused across every Publishing sub-tab. */
export default function StatusBadge({ status }) {
  const style = STATUS_STYLE[status] || { variant: 'secondary' }
  return <Badge variant={style.variant}>{status}</Badge>
}
