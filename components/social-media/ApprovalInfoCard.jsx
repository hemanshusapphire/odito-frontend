import { Info } from 'lucide-react'

/** Soft info panel explaining what happens right after content is approved. */
export function ApprovalInfoCard() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
        <Info className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">Design generation starts after content approval.</p>
        <p className="mt-1 text-sm text-slate-500">
          Once you approve this content, AI will create visual designs based on your copy.
        </p>
      </div>
    </div>
  )
}

export default ApprovalInfoCard
