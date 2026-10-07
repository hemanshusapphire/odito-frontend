"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useProject } from '@/contexts/ProjectContext'
import { StudioEntry } from '@/components/social-media/studio/StudioEntry'
import { StudioLoading } from '@/components/social-media/studio/StudioNotices'

/**
 * Social Media AI - Creative Studio. The real thing: it opens ONE real publication (?publicationId=, or ?itemId=&platform= from the
 * Content Calendar, or a choice of the project's posts) and shows its approved caption and hashtags, the Business Profile / Brand Kit, the
 * product photos and the three AI designs the existing design pipeline made for it. There is no static content, no mock design and no
 * local-only selection on this page - see components/social-media/studio/.
 */
function CreativeStudioContent() {
  const { activeProjectId } = useProject()
  const params = useSearchParams()
  const publicationId = params.get('publicationId')
  const itemId = params.get('itemId')
  const platform = params.get('platform')

  return (
    <div className="flex-1 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Creative Studio</h1>
        <p className="mt-1 text-sm text-slate-500">Choose the visual that fits your brand</p>
      </div>

      {!activeProjectId ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm" data-testid="no-project">
          <p className="text-sm font-semibold text-slate-700">No project selected</p>
          <p className="mt-1 text-sm text-slate-400">Select or create a project to use Creative Studio.</p>
        </div>
      ) : (
        <StudioEntry projectId={activeProjectId} publicationId={publicationId} itemId={itemId} platform={platform} />
      )}
    </div>
  )
}

// useSearchParams needs a Suspense boundary in the Next app router.
export default function CreativeStudioPage() {
  return (
    <Suspense fallback={<StudioLoading />}>
      <CreativeStudioContent />
    </Suspense>
  )
}
