import { Check } from 'lucide-react'
import { ContentField, CONTENT_FIELD_CLASS } from './ContentField'
import { AIRegeneratePanel } from './AIRegeneratePanel'

const STATUS_BADGE = {
  pending: { label: 'Ready for approval', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  'needs-changes': { label: 'Needs changes', className: 'bg-amber-50 text-amber-700 border-amber-200' },
}

/** "Edit content" card - controlled form for the currently selected post. */
export function ContentEditor({ post, fields, onFieldChange, onRegenerate }) {
  const badge = STATUS_BADGE[post.status] || STATUS_BADGE.pending

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-slate-900">Edit content</h2>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badge.className}`}>
          <Check className="h-3.5 w-3.5" />
          {badge.label}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <ContentField label="Topic">
          <input
            type="text"
            value={fields.topic}
            onChange={(e) => onFieldChange('topic', e.target.value)}
            className={CONTENT_FIELD_CLASS}
          />
        </ContentField>

        <ContentField label="Caption">
          <textarea
            value={fields.caption}
            onChange={(e) => onFieldChange('caption', e.target.value)}
            rows={4}
            className={`${CONTENT_FIELD_CLASS} resize-none`}
          />
        </ContentField>

        <ContentField label="CTA">
          <input
            type="text"
            value={fields.cta}
            onChange={(e) => onFieldChange('cta', e.target.value)}
            className={CONTENT_FIELD_CLASS}
          />
        </ContentField>

        <ContentField label="Hashtags" helper="Add up to 10 relevant hashtags">
          <input
            type="text"
            value={fields.hashtags}
            onChange={(e) => onFieldChange('hashtags', e.target.value)}
            className={CONTENT_FIELD_CLASS}
          />
        </ContentField>

        <AIRegeneratePanel onRegenerate={onRegenerate} />
      </div>
    </div>
  )
}

export default ContentEditor
