import { CircleCheck } from 'lucide-react'
import { SocialMediaImage } from './SocialMediaImage'

/** Green banner summarizing the approved content this screen is designing around. */
export function ApprovedContentBanner({ content }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 sm:flex-row sm:items-center">
      <SocialMediaImage imageId={content.imageId} className="h-16 w-16 shrink-0 rounded-xl" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-bold text-slate-900">{content.title}</h3>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            <CircleCheck className="h-3.5 w-3.5" />
            Content approved
          </span>
        </div>
        <p className="mt-1.5 text-sm text-slate-600">{content.description}</p>
        <p className="mt-1.5 text-sm text-violet-600">{content.hashtags.join(' ')}</p>
      </div>
    </div>
  )
}

export default ApprovedContentBanner
