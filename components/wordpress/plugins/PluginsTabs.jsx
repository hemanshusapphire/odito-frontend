"use client"

import { TabsList, TabsTrigger } from '@/components/ui/tabs'

const TABS = [
  { value: 'plugins', label: 'Plugins' },
  { value: 'scheduling', label: 'Scheduling' },
  { value: 'history', label: 'Scheduling History' },
]

/** Plugins / Scheduling / Scheduling History tab strip - must sit inside a <Tabs> root. */
export default function PluginsTabs() {
  return (
    <TabsList>
      {TABS.map((t) => <TabsTrigger key={t.value} value={t.value} className="px-4">{t.label}</TabsTrigger>)}
    </TabsList>
  )
}
