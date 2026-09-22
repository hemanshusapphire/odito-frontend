export const CONTENT_FIELD_CLASS =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition-colors focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 hover:border-slate-300'

/** Labeled field shell shared by every Edit Content input/textarea. */
export function ContentField({ label, helper, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {helper && <p className="mt-1.5 text-xs text-slate-400">{helper}</p>}
    </div>
  )
}

export default ContentField
