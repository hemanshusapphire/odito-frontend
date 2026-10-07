import { AlertTriangle, Check, Loader2, Sparkles, XCircle } from 'lucide-react'

const TONES = {
  success: { box: 'border-emerald-100 bg-emerald-50', icon: 'bg-emerald-500 text-white', sub: 'text-emerald-700', Icon: Check },
  warning: { box: 'border-amber-200 bg-amber-50', icon: 'bg-amber-500 text-white', sub: 'text-amber-700', Icon: AlertTriangle },
  error: { box: 'border-red-200 bg-red-50', icon: 'bg-red-500 text-white', sub: 'text-red-700', Icon: XCircle },
  working: { box: 'border-violet-200 bg-violet-50', icon: 'bg-violet-500 text-white', sub: 'text-violet-700', Icon: Loader2, spin: true },
  neutral: { box: 'border-slate-200 bg-slate-50', icon: 'bg-slate-400 text-white', sub: 'text-slate-500', Icon: Sparkles },
}

/**
 * Status card at the top-right of AI Strategy. `view` is derived from the SERVER's state
 * (lib/socialMedia/aiStrategy.js statusView) — it never claims "complete" on its own.
 */
export function StrategyStatusCard({ view }) {
  const tone = TONES[view.tone] || TONES.neutral
  const { Icon } = tone
  return (
    <div className={`flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 ${tone.box}`} data-testid="strategy-status" data-tone={view.tone} role="status">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone.icon}`}>
        <Icon className={`h-4 w-4 ${tone.spin ? 'animate-spin' : ''}`} strokeWidth={2.5} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-slate-900" data-testid="strategy-status-title">{view.title}</span>
        <span className={`block text-xs ${tone.sub}`}>{view.subtitle}</span>
      </span>
    </div>
  )
}

export default StrategyStatusCard
