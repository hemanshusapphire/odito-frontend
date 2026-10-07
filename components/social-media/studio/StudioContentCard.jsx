"use client"

import Link from 'next/link'
import { FileText } from 'lucide-react'
import { APPROVAL_STATE_LABEL } from '@/lib/socialMedia/studio'

const PLATFORM_LABEL = { facebook: 'Facebook', instagram: 'Instagram' }

/**
 * The approved content the designs are made for - the REAL publication's caption and hashtags, its content / design versions, its
 * approval state, and the product or service it is about. Read-only: the words are edited and approved in Content Approvals.
 */
export function StudioContentCard({ studio }) {
  const { content, product, service, plan } = studio
  const approval = APPROVAL_STATE_LABEL[content.approvalState] || 'Not in approval'
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="studio-content" aria-label="Approved content">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700" data-testid="studio-platform">{PLATFORM_LABEL[content.platform] || content.platform}</span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700" data-testid="studio-approval">{approval}</span>
          <span className="text-xs text-slate-400" data-testid="studio-versions">Content v{content.contentVersion} · Design v{content.designVersion}</span>
        </div>
        <Link href="/app/social-media/content-approvals" className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:text-violet-800">
          <FileText className="h-4 w-4" aria-hidden />View content details
        </Link>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-800" data-testid="studio-caption">{content.caption || 'This post has no caption.'}</p>

      {content.hashtags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" data-testid="studio-hashtags" aria-label="Hashtags">
          {content.hashtags.map((tag) => <li key={tag} className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700">{tag}</li>)}
        </ul>
      )}

      {(product || service || plan) && (
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500" data-testid="studio-about">
          {plan?.topic && <div className="flex gap-1.5"><dt className="font-semibold text-slate-600">Topic</dt><dd>{plan.topic}</dd></div>}
          {product && <div className="flex gap-1.5"><dt className="font-semibold text-slate-600">Product</dt><dd data-testid="studio-product-name">{product.name}</dd></div>}
          {service?.name && <div className="flex gap-1.5"><dt className="font-semibold text-slate-600">Service</dt><dd data-testid="studio-service-name">{service.name}</dd></div>}
        </dl>
      )}
    </section>
  )
}

export default StudioContentCard
