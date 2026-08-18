"use client"

import { Badge } from '@/components/ui/badge'
import { STATUS_BADGE_VARIANT, STATUS_LABELS } from '@/lib/leadsConstants'

/** Status pill for a lead — variant + label driven by the real backend enum. */
export default function LeadStatusBadge({ status }) {
  return <Badge variant={STATUS_BADGE_VARIANT[status] || 'secondary'}>{STATUS_LABELS[status] || status}</Badge>
}
