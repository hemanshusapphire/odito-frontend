import { Info } from 'lucide-react'

/**
 * Soft info panel explaining how approval works for THIS project. `settings`
 * is the backend's own per-project configuration (null while it loads / if it
 * could not be loaded — then only the general rule is shown).
 */
export function ApprovalInfoCard({ settings = null }) {
  const notes = []
  if (settings && settings.contentApprovalRequired === false) notes.push('Content approval is turned off for this project — submitted posts skip straight to the design step.')
  if (settings && settings.designApprovalRequired === false) notes.push('Design approval is turned off for this project — approved content is ready to schedule.')

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
        <Info className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">Nothing publishes until it&apos;s approved.</p>
        <p className="mt-1 text-sm text-slate-500">
          Content is approved first, then the design. A post that is still in review can&apos;t be scheduled or published, and editing approved content or design sends it back for approval.
        </p>
        {notes.map((note) => (
          <p key={note} className="mt-1.5 text-sm text-slate-500" data-testid="approval-setting-note">{note}</p>
        ))}
      </div>
    </div>
  )
}

export default ApprovalInfoCard
