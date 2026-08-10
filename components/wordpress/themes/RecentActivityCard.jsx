"use client"

import { Card } from '@/components/ui/card'
import { THEME_ACTIVITY } from '@/lib/wordpressThemesDummyData'

/** Timeline of recent theme events (installed/activated/updated/customized/deleted). */
export default function RecentActivityCard() {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
      <ul className="flex flex-col gap-4">
        {THEME_ACTIVITY.map((item, i) => (
          <li key={item.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
              {i < THEME_ACTIVITY.length - 1 && <span className="w-px flex-1 bg-border mt-1.5" />}
            </div>
            <div className="pb-0.5 flex-1 flex items-center justify-between gap-3 min-w-0">
              <p className="text-xs text-foreground leading-relaxed">{item.text}</p>
              <p className="text-[11px] text-muted-foreground shrink-0 whitespace-nowrap">{item.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
