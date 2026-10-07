import Link from 'next/link'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { changeLabel } from '@/lib/socialMedia/aiStrategy'

/**
 * Shown when the live Business Profile no longer matches the profile this strategy was generated from.
 * The strategy stays fully viewable; nothing is regenerated automatically — the user chooses.
 */
export function StrategyProfileChangedBanner({ changes = [], busy = false, onRegenerate }) {
  return (
    <div role="alert" data-testid="profile-changed" className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700"><AlertTriangle className="h-4 w-4" /></span>
        <div>
          <p className="text-sm font-semibold text-amber-900">Your Business Profile has changed since this strategy was generated.</p>
          {changes.length > 0 && (
            <p className="mt-0.5 text-sm text-amber-800" data-testid="profile-changes">Changed: {changes.map(changeLabel).join(', ')}</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link href="/app/social-media/business-profile" className="rounded-lg border border-amber-300 bg-white px-3.5 py-2 text-sm font-semibold text-amber-900 shadow-sm transition-colors hover:bg-amber-100">
          Review changes
        </Link>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Regenerate strategy
        </button>
      </div>
    </div>
  )
}

export default StrategyProfileChangedBanner
