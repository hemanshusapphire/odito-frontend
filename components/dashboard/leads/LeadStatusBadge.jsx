"use client"

import { Badge } from '@/components/ui/badge'
import { STATUS_BADGE_VARIANT } from '@/lib/leadsDummyData'

/** Status pill for a lead - variant driven by STATUS_BADGE_VARIANT. */
export default function LeadStatusBadge({ status }) {
  return <Badge variant={STATUS_BADGE_VARIANT[status] || 'secondary'}>{status}</Badge>
}
