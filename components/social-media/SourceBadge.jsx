import { sourceLabel } from '@/lib/socialMedia/businessProfile'

const STYLE = {
  social_override: 'border-violet-200 bg-violet-50 text-violet-700',
  google_business_profile: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  verified_business: 'border-sky-200 bg-sky-50 text-sky-700',
  seo_project: 'border-slate-200 bg-slate-50 text-slate-600',
  website_extraction: 'border-amber-200 bg-amber-50 text-amber-700',
  unavailable: 'border-slate-200 bg-white text-slate-400',
}

/** Where a business fact came from (the backend's `source` label). */
export function SourceBadge({ source, detail = null }) {
  return (
    <span
      data-testid="source-badge"
      data-source={source}
      title={detail ? `${sourceLabel(source)} — ${detail.replace(/_/g, ' ')}` : undefined}
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${STYLE[source] || STYLE.unavailable}`}
    >
      {sourceLabel(source)}
    </span>
  )
}

export default SourceBadge
