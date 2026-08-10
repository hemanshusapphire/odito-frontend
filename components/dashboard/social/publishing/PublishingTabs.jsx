"use client"

import { TabsList, TabsTrigger } from '@/components/ui/tabs'

const TABS = [
  { value: 'schedule', label: 'Schedule' },
  { value: 'posts', label: 'Posts' },
  { value: 'history', label: 'Post History' },
  { value: 'bulk-upload', label: 'Bulk Upload' },
  { value: 'planner', label: 'Post Planner' },
]

/**
 * Secondary tab strip inside Publishing - must be rendered as a child of a
 * <Tabs> root (see app/app/social/publishing/page.jsx), which owns the
 * active-tab state and the matching <TabsContent> panels.
 */
export default function PublishingTabs() {
  return (
    <TabsList className="h-auto p-1 flex-wrap">
      {TABS.map((tab) => (
        <TabsTrigger key={tab.value} value={tab.value} className="px-4 py-1.5">{tab.label}</TabsTrigger>
      ))}
    </TabsList>
  )
}
