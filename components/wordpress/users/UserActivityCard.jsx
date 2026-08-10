"use client"

import { Card } from '@/components/ui/card'
import { LogIn, ShieldAlert, UserPlus, KeyRound, Activity } from 'lucide-react'
import { USER_ACTIVITY_METRICS } from '@/lib/wordpressUsersDummyData'

const ROWS = [
  { key: 'todaysLogins', label: "Today's Logins", icon: LogIn },
  { key: 'failedLogins', label: 'Failed Logins', icon: ShieldAlert },
  { key: 'newRegistrations', label: 'New Registrations', icon: UserPlus },
  { key: 'passwordResets', label: 'Password Resets', icon: KeyRound },
  { key: 'activeSessions', label: 'Active Sessions', icon: Activity },
]

/** Today's logins, failed logins, new registrations, password resets, active sessions. */
export default function UserActivityCard() {
  return (
    <Card className="p-5 flex flex-col gap-3">
      <h3 className="text-sm font-semibold mb-1">User Activity</h3>
      {ROWS.map((row) => {
        const Icon = row.icon
        return (
          <div key={row.key} className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              {row.label}
            </span>
            <span className="font-mono font-semibold">{USER_ACTIVITY_METRICS[row.key]}</span>
          </div>
        )
      })}
    </Card>
  )
}
