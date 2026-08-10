"use client"

import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ROLE_TABS } from '@/lib/wordpressUsersDummyData'

/** Administrators / Editors / Authors / Subscribers / Inactive tabs, each with a live count badge. */
export default function RoleTabs({ counts }) {
  return (
    <TabsList className="h-auto p-1 flex-wrap">
      {ROLE_TABS.map((tab) => (
        <TabsTrigger key={tab.key} value={tab.key} className="gap-1.5 px-3.5 py-1.5">
          {tab.label}
          <Badge variant="info" className="text-[10px] px-1.5">{counts[tab.key] ?? 0}</Badge>
        </TabsTrigger>
      ))}
    </TabsList>
  )
}
