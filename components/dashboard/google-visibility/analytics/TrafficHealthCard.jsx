"use client"

import { Card } from '@/components/ui/card'
import ScoreRing from '@/components/ui/ScoreRing'

// Ring/text color per the backend's own status band (AnalyticsMapper's
// HEALTH_STATUS_BANDS - Strong/Good/Fair/Needs Attention, plus the
// Insufficient Data guard). The score/status/reasons themselves are NOT
// recomputed here - the backend is the single source of truth for the
// Health formula (see the Phase 3 doc comment in analyticsMapper.js); this
// component only decides how each status string is colored.
const STATUS_STYLE = {
  'Strong': { color: '#10b981', color2: '#34d399' },
  'Good': { color: '#10b981', color2: '#34d399' },
  'Fair': { color: '#f59e0b', color2: '#fbbf24' },
  'Needs Attention': { color: '#ef4444', color2: '#f87171' },
  'Insufficient Data': { color: '#64748b', color2: '#94a3b8' },
}

/**
 * Sidebar "overall traffic health" score. Reuses the existing ui/ScoreRing
 * primitive instead of building a second gauge component. `score` is
 * `null` and `status` is "Insufficient Data" when the connection is too
 * new for a reliable score - see analyticsMapper.js's toHealthDTO.
 */
export default function TrafficHealthCard({ score, status, reasons = [] }) {
  const hasScore = typeof score === 'number'
  const style = STATUS_STYLE[status] || STATUS_STYLE['Insufficient Data']

  return (
    <Card className="p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Traffic Health</h3>
      <div className="flex items-center gap-3.5 mt-3">
        <div className="relative shrink-0" style={{ width: 64, height: 64 }}>
          {hasScore ? (
            <>
              <ScoreRing val={score} color={style.color} color2={style.color2} size={64} />
              <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-base" style={{ color: style.color }}>
                {score}
              </div>
            </>
          ) : (
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
              —
            </div>
          )}
        </div>
        <div>
          <div className="text-sm font-bold text-foreground">{status || 'No data'}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Overall traffic score</div>
        </div>
      </div>

      {reasons.length > 0 && (
        <ul className="mt-3.5 space-y-1">
          {reasons.map((reason) => (
            <li key={reason} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/60 shrink-0 mt-1.5" />
              {reason}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
