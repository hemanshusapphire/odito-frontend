"use client"

import { useRouter, usePathname } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const TABS = [
  { value: 'overview', label: 'Overview', href: '/app/social' },
  { value: 'feeds', label: 'Feeds', href: '/app/social/feeds' },
  { value: 'publishing', label: 'Publishing', href: '/app/social/publishing' },
  { value: 'reports', label: 'Reports', href: '/app/social/reports' },
]

/**
 * In-page tab bar backed by real routes (each tab is its own page under
 * app/app/social/), reachable from the dedicated Social Media sidebar
 * section too. Built on the ShadCN Tabs primitive (not hand-rolled Link
 * pills) - `value` is derived from the current pathname, `onValueChange`
 * navigates instead of swapping a client-side panel.
 */
export default function SocialTabs() {
  const router = useRouter()
  const pathname = usePathname()
  const activeValue = TABS.find((t) => t.href === pathname)?.value || 'overview'

  return (
    <Tabs value={activeValue} onValueChange={(value) => router.push(TABS.find((t) => t.value === value).href)}>
      <TabsList>
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="px-4">{tab.label}</TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
