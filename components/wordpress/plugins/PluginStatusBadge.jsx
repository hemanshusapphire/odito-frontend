"use client"

import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Crown, ShieldAlert } from 'lucide-react'

/** Renders every badge relevant to a plugin: Active/Inactive, Needs Update, Premium, Security Warning. */
export default function PluginStatusBadge({ plugin }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant={plugin.status === 'active' ? 'success' : 'secondary'} className="text-[10px] capitalize">
        {plugin.status}
      </Badge>
      {plugin.hasUpdate && (
        <Badge variant="warning" className="text-[10px] gap-1">
          <AlertTriangle className="h-2.5 w-2.5" />
          Needs Update
        </Badge>
      )}
      {plugin.isPremium && (
        <Badge variant="info" className="text-[10px] gap-1">
          <Crown className="h-2.5 w-2.5" />
          Premium
        </Badge>
      )}
      {plugin.hasSecurityWarning && (
        <Badge variant="critical" className="text-[10px] gap-1">
          <ShieldAlert className="h-2.5 w-2.5" />
          Security Warning
        </Badge>
      )}
    </div>
  )
}
