"use client"

import { Card } from '@/components/ui/card'
import { RefreshCw, DatabaseBackup, ShieldCheck, Palette, Rocket, LogIn } from 'lucide-react'
import { RECENT_ACTIVITY } from '@/lib/wordpressDummyData'

const ICON = { update: RefreshCw, backup: DatabaseBackup, security: ShieldCheck, theme: Palette, wordpress: Rocket, login: LogIn }

/** Chronological timeline of recent site events. */
export default function RecentActivityCard() {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
      <ul className="flex flex-col gap-4">
        {RECENT_ACTIVITY.map((item, i) => {
          const Icon = ICON[item.type] || RefreshCw
          return (
            <li key={item.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
                {i < RECENT_ACTIVITY.length - 1 && <span className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className="pb-0.5 flex-1 flex items-center justify-between gap-3 min-w-0">
                <p className="text-xs text-foreground leading-relaxed">{item.text}</p>
                <p className="text-[11px] text-muted-foreground shrink-0 whitespace-nowrap">{item.time}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
