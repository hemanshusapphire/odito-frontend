"use client"

import { Badge } from '@/components/ui/badge'
import { FileEdit, Sparkles, CheckCircle2, ShieldCheck, UploadCloud, Globe, AlertTriangle } from 'lucide-react'
import { draftStatusLabel } from '@/lib/aiCampaignConstants'

/**
 * Draft lifecycle badge. Phase 3 never publishes — this only reflects the
 * status the backend reports. `generating` / `publishing` / `published`
 * are shown but carry no action here.
 */
const CONFIG = {
  draft: { variant: 'secondary', Icon: FileEdit },
  ready: { variant: 'secondary', Icon: FileEdit },
  generating: { variant: 'info', Icon: Sparkles },
  validated: { variant: 'success', Icon: ShieldCheck },
  publishing: { variant: 'warning', Icon: UploadCloud },
  published: { variant: 'success', Icon: Globe },
  failed: { variant: 'critical', Icon: AlertTriangle },
}

export default function DraftStatusBadge({ status, className }) {
  const { variant, Icon } = CONFIG[status] || CONFIG.draft
  return (
    <Badge variant={variant} className={className}>
      <Icon className="h-3 w-3" />
      {draftStatusLabel(status)}
    </Badge>
  )
}

/**
 * The clearer "this is not live" marker for the workspace header — always
 * says the draft lives in Odito, not Google Ads.
 */
export function OditoDraftMarker({ status }) {
  const isPublishStage = status === 'publishing' || status === 'published'
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${isPublishStage ? 'bg-emerald-500' : 'bg-muted-foreground/50'}`} />
      {isPublishStage ? 'Published to Google Ads' : 'Odito draft · not published to Google Ads'}
    </span>
  )
}
