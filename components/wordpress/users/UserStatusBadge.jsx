"use client"

import { Badge } from '@/components/ui/badge'
import { ShieldCheck } from 'lucide-react'

const STATUS_VARIANT = { active: 'success', inactive: 'secondary', pending: 'warning', blocked: 'critical' }
const STATUS_LABEL = { active: 'Active', inactive: 'Inactive', pending: 'Pending', blocked: 'Blocked' }

/** Status badge (Active/Inactive/Pending/Blocked) + an optional Two-Factor Enabled indicator. */
export default function UserStatusBadge({ user }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant={STATUS_VARIANT[user.status]} className="text-[10px]">{STATUS_LABEL[user.status]}</Badge>
      {user.twoFactorEnabled && (
        <Badge variant="info" className="text-[10px] gap-1">
          <ShieldCheck className="h-2.5 w-2.5" />
          2FA
        </Badge>
      )}
    </div>
  )
}
