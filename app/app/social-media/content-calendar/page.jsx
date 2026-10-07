"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ContentPlanSection } from '@/components/social-media/ContentPlanSection'
import { PublishedCalendarView } from '@/components/social-media/PublishedCalendarView'
import { useProject } from '@/contexts/ProjectContext'

const TABS = [
  { id: 'plan', label: 'Content plan' },
  { id: 'scheduled', label: 'Scheduled & published' },
]

/**
 * Social Media AI - Content Calendar. Two views of one idea:
 *  - Content plan (default): the PLAN. The user picks posts per week, platforms and dates and Odito plans what each post
 *    is about and writes it (caption, hashtags, per-platform copy) from the AI strategy (ContentPlanSection). Nothing here
 *    creates a design, a publication or a schedule.
 *  - Scheduled & published: the REAL posts of the scheduler backend for the visible week or month
 *    (PublishedCalendarView), unchanged.
 * Strategy = the brain, plan = this page, content / design generation, approval, scheduling and publishing = later steps.
 */
export default function ContentCalendarPage() {
  const { activeProjectId } = useProject()
  const [tab, setTab] = useState('plan')

  return (
    <div className="flex-1 space-y-6 pb-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Content Calendar</h1>
          <p className="mt-1 text-sm text-slate-500">Plan what to post, then follow what is scheduled and published.</p>
        </div>
        <Link
          href="/app/social-media/creative-studio"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800"
        >
          <Plus className="h-4 w-4" />
          Add content
        </Link>
      </div>

      <div className="flex items-center gap-6 overflow-x-auto border-b border-slate-200" role="tablist" aria-label="Content calendar views">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px shrink-0 border-b-2 pb-3 text-sm font-semibold transition-colors ${tab === t.id ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!activeProjectId ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm" data-testid="no-project">
          <p className="text-sm font-semibold text-slate-700">No project selected</p>
          <p className="mt-1 text-sm text-slate-400">Select or create a project to see its calendar.</p>
        </div>
      ) : tab === 'plan' ? (
        <ContentPlanSection projectId={activeProjectId} />
      ) : (
        <PublishedCalendarView projectId={activeProjectId} />
      )}
    </div>
  )
}
