"use client"

import { Check, X, AlertTriangle, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ROW_STATUS_META } from './bulkUploadConstants'

const ICONS = { check: Check, x: X, alert: AlertTriangle, minus: Minus }

/**
 * Status pill for one SocialImportRow. Always icon + text — never colour
 * alone — so it reads for screen readers and colour-blind users.
 */
export default function RowStatusPill({ status }) {
  const meta = ROW_STATUS_META[status] || { label: status || 'Unknown', tone: 'secondary', icon: 'minus' }
  const Icon = ICONS[meta.icon] || Minus
  return (
    <Badge variant={meta.tone} className="gap-1 font-medium">
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{meta.label}</span>
    </Badge>
  )
}
