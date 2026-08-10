"use client"

/**
 * Ranked name + progress-bar + value list. Shared by TopCountriesCard and
 * BrowserOSCard (browsers/OS use the same shape twice). Deliberately
 * replaces the reference HTML's fake dot-scatter "world map" (hardcoded
 * per-country pixel coordinates - exactly the kind of dummy positioning
 * logic this build avoids) with a plain ranked list, which is both more
 * honest without real geo data and closer to how Datadog/Vercel-style
 * analytics dashboards actually present country/browser/OS breakdowns.
 */
export default function RankedBarList({ items = [], barColor = 'var(--primary)', valueSuffix = '' }) {
  if (!items.length) return null
  const max = Math.max(...items.map((i) => i.value), 1)

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => {
        const pct = Math.round((item.value / max) * 100)
        return (
          <div key={item.key} className="flex items-center gap-2.5 text-xs">
            {item.leading && <span className="shrink-0 leading-none">{item.leading}</span>}
            <span className="w-[92px] shrink-0 truncate text-foreground font-medium">{item.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
            </div>
            <span className="w-12 shrink-0 text-right font-mono tabular-nums text-muted-foreground">
              {item.value.toLocaleString()}{valueSuffix}
            </span>
          </div>
        )
      })}
    </div>
  )
}
