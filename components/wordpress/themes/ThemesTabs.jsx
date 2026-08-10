"use client"

import { TabsList, TabsTrigger } from '@/components/ui/tabs'

const TABS = [
  { value: 'themes', label: 'Themes' },
  { value: 'scheduling', label: 'Scheduling' },
  { value: 'history', label: 'Scheduling History' },
]

/** Themes / Scheduling / Scheduling History tab strip - must sit inside a <Tabs> root. */
export default function ThemesTabs() {
  return (
    <TabsList>
      {TABS.map((t) => <TabsTrigger key={t.value} value={t.value} className="px-4">{t.label}</TabsTrigger>)}
    </TabsList>
  )
}
