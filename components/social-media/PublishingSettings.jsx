"use client"

import { useState } from 'react'
import { PlatformSelector } from './PlatformSelector'
import { PublishingRules } from './PublishingRules'
import { DEFAULT_PUBLISHING_PLATFORMS } from '@/lib/socialMediaAIDummyData'

/** "Publishing" settings tab - default platforms + the shared approval/publishing rules. */
export function PublishingSettings({ rules, onToggleRule, onTimezoneChange, persistedKeys = null, disabledKeys = [] }) {
  const [defaultPlatforms, setDefaultPlatforms] = useState(() => new Set(DEFAULT_PUBLISHING_PLATFORMS))

  function togglePlatform(id) {
    setDefaultPlatforms((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Publishing</h2>
        <p className="mt-1 text-sm text-slate-500">Choose where content publishes by default.</p>

        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Default publishing platforms</p>
          <PlatformSelector platforms={['facebook', 'instagram']} selected={defaultPlatforms} onToggle={togglePlatform} />
        </div>
      </div>

      <PublishingRules rules={rules} onToggle={onToggleRule} onTimezoneChange={onTimezoneChange} persistedKeys={persistedKeys} disabledKeys={disabledKeys} />
    </div>
  )
}

export default PublishingSettings
