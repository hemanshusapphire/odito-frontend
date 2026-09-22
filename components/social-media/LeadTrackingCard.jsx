import { BarChart3, Link2 } from 'lucide-react'

/** "Lead tracking" card showing connected website-forms integration status. */
export function LeadTrackingCard({ tracking }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-slate-500" />
          <h2 className="text-base font-bold text-slate-900">Lead tracking</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          {tracking.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">{tracking.description}</p>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
          <Link2 className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">{tracking.integration.label}</p>
          <p className="text-xs text-slate-400">{tracking.integration.connectedNote}</p>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
          {tracking.integration.status}
        </span>
      </div>

      <p className="mt-3 text-xs text-slate-400">{tracking.footerNote}</p>
    </div>
  )
}

export default LeadTrackingCard
