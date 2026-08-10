"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Icon-only accent — the value/label stay in neutral ink (text-foreground/
// text-muted-foreground) so color always carries identity via the icon
// chip, never the number itself. Each pair is tuned for both themes
// (Tailwind's 600 step reads correctly on the light card surface, 400 on
// the dark one) rather than relying on this app's --chart-1..5 tokens,
// which aren't colorful in light mode (chart-1/2 resolve to black/gray).
const TONE_STYLES = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  green: "bg-green-500/10 text-green-600 dark:text-green-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
}

/**
 * Every dashboard stat card renders through this one component — no
 * per-card JSX duplication. `breakdown` is optional: a few secondary
 * label/value pairs shown under the headline number (used by the Webhook
 * Health card to surface pending/failed/ignored alongside completed).
 *
 * `tone` is optional — omit it to get the original neutral/muted icon
 * (every pre-existing caller that doesn't pass it renders unchanged).
 */
export function SystemStatCard({ icon: Icon, label, value, breakdown, tone }) {
  const toneClass = tone && TONE_STYLES[tone]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
          {Icon && (
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                toneClass || "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
          )}
          {label}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <span className="text-3xl font-bold tabular-nums text-foreground">{value}</span>

        {breakdown && breakdown.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {breakdown.map((item) => (
              <span key={item.label} className="flex items-center gap-1">
                <span className="font-medium text-foreground">{item.value}</span>
                {item.label}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
