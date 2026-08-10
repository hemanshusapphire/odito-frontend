"use client"

import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Crown, GitBranch } from 'lucide-react'

/** Renders every badge relevant to a theme: Active/Inactive, Update Available, Premium, Child Theme. */
export default function ThemeStatusBadge({ theme }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant={theme.status === 'active' ? 'success' : 'secondary'} className="text-[10px] capitalize">
        {theme.status}
      </Badge>
      {theme.hasUpdate && (
        <Badge variant="warning" className="text-[10px] gap-1">
          <AlertTriangle className="h-2.5 w-2.5" />
          Update Available
        </Badge>
      )}
      {theme.isPremium && (
        <Badge variant="info" className="text-[10px] gap-1">
          <Crown className="h-2.5 w-2.5" />
          Premium
        </Badge>
      )}
      {theme.parentTheme && (
        <Badge variant="outline" className="text-[10px] gap-1">
          <GitBranch className="h-2.5 w-2.5" />
          Child Theme
        </Badge>
      )}
    </div>
  )
}
