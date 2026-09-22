"use client"

import { useState } from 'react'
import { Target } from 'lucide-react'
import { StrategyStatusCard } from '@/components/social-media/StrategyStatusCard'
import { ConnectedSources } from '@/components/social-media/ConnectedSources'
import { PostTypeSelector } from '@/components/social-media/PostTypeSelector'
import { PostTypeDistribution } from '@/components/social-media/PostTypeDistribution'
import { StrategyMixSummary } from '@/components/social-media/StrategyMixSummary'
import { BusinessSnapshot } from '@/components/social-media/BusinessSnapshot'
import { ContentPillarCard } from '@/components/social-media/ContentPillarCard'
import { StrategySettings } from '@/components/social-media/StrategySettings'
import { StrategyActions } from '@/components/social-media/StrategyActions'
import SocialMediaToastStack from '@/components/social-media/SocialMediaToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'
import { addPostType, removePostType, changeDistribution } from '@/lib/postTypeDistribution'
import {
  AI_STRATEGY_STATUS,
  CONNECTED_SOURCES,
  RECOMMENDED_STRATEGY,
  POST_TYPES,
  DEFAULT_SELECTED_POST_TYPE_IDS,
  DEFAULT_POST_TYPE_DISTRIBUTION,
  BUSINESS_SNAPSHOT,
  CONTENT_PILLARS,
  STRATEGY_SETTINGS,
} from '@/lib/socialMediaAIDummyData'

const POST_TYPE_IDS = POST_TYPES.map((pt) => pt.id)

/**
 * Social Media AI - AI Strategy. Entirely frontend-only, same as Overview
 * and Connect Accounts: every figure comes from lib/socialMediaAIDummyData.js,
 * no API calls, no real AI analysis, no backend. Post-type selection and
 * their distribution are local component state - the rebalancing math that
 * keeps the distribution at exactly 100% lives in lib/postTypeDistribution.js.
 */
export default function AIStrategyPage() {
  const [selectedIds, setSelectedIds] = useState(() => new Set(DEFAULT_SELECTED_POST_TYPE_IDS))
  const [distribution, setDistribution] = useState(DEFAULT_POST_TYPE_DISTRIBUTION)
  const { toasts, notify, dismiss } = useToastQueue()

  function handleTogglePostType(id) {
    const selectedArray = POST_TYPE_IDS.filter((pid) => selectedIds.has(pid))
    if (selectedIds.has(id)) {
      setDistribution(removePostType(distribution, selectedArray, id))
      setSelectedIds(new Set(selectedArray.filter((pid) => pid !== id)))
    } else {
      setDistribution(addPostType(distribution, selectedArray, id))
      setSelectedIds(new Set([...selectedArray, id]))
    }
  }

  function handleChangeDistribution(id, value) {
    const selectedArray = POST_TYPE_IDS.filter((pid) => selectedIds.has(pid))
    setDistribution(changeDistribution(distribution, selectedArray, id, value))
  }

  return (
    <div className="flex-1 space-y-6 pb-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Strategy</h1>
          <p className="mt-1 text-sm text-slate-500">A tailored social plan for your business</p>
        </div>
        <StrategyStatusCard
          status={AI_STRATEGY_STATUS}
          onClick={() => notify('Full analysis report is on the roadmap.', 'default')}
        />
      </div>

      <ConnectedSources sources={CONNECTED_SOURCES} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 rounded-2xl border border-violet-200 bg-violet-50/50 p-5 lg:col-span-2">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Target className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">{RECOMMENDED_STRATEGY.title}</h2>
              <p className="mt-0.5 text-sm text-slate-500">{RECOMMENDED_STRATEGY.subtitle}</p>
            </div>
          </div>

          <PostTypeSelector postTypes={POST_TYPES} selectedIds={selectedIds} onToggle={handleTogglePostType} />

          <PostTypeDistribution
            postTypes={POST_TYPES}
            selectedIds={selectedIds}
            distribution={distribution}
            onChange={handleChangeDistribution}
          />

          <StrategyMixSummary postTypes={POST_TYPES} selectedIds={selectedIds} distribution={distribution} />
        </div>

        <BusinessSnapshot
          items={BUSINESS_SNAPSHOT}
          onSelectItem={(item) => notify(`Editing "${item.label}" is on the roadmap.`, 'default')}
        />
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">Your content pillars</h2>
        <p className="mt-1 text-sm text-slate-500">Your content mix based on the selected post types.</p>

        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {CONTENT_PILLARS.map((pillar) => (
            <ContentPillarCard key={pillar.id} pillar={pillar} />
          ))}
        </div>
      </div>

      <StrategySettings items={STRATEGY_SETTINGS}>
        <StrategyActions onAdjust={() => notify('Strategy adjustment tools are on the roadmap.', 'default')} />
      </StrategySettings>

      <SocialMediaToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
