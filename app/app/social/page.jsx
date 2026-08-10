"use client"

import { useState } from 'react'
import SocialPageHeader from '@/components/dashboard/social/SocialPageHeader'
import SocialTabs from '@/components/dashboard/social/SocialTabs'
import SocialPlatformSection from '@/components/dashboard/social/SocialPlatformSection'
import CreatePostDialog from '@/components/dashboard/social/CreatePostDialog'
import ConnectAccountDialog from '@/components/dashboard/social/ConnectAccountDialog'
import ToastStack from '@/components/shared/ToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'
import { PLATFORMS } from '@/lib/socialMediaDummyData'

/**
 * Social Media Management - Overview tab. Frontend-only: every metric,
 * chart series, and connection state comes from lib/socialMediaDummyData.js.
 * "Connect Account" flips a platform's `connected` flag in local state only
 * (no OAuth, no API) - same in-memory-only interactivity pattern used by
 * the Google Ads and Lead Management pages.
 */
export default function SocialMediaOverviewPage() {
  const [platforms, setPlatforms] = useState(PLATFORMS)
  const [refreshing, setRefreshing] = useState(false)
  const [postDialogOpen, setPostDialogOpen] = useState(false)
  const [connectDialogOpen, setConnectDialogOpen] = useState(false)
  const { toasts, notify, dismiss } = useToastQueue()

  function handleConnect(platformId) {
    const platform = platforms.find((p) => p.id === platformId)
    setPlatforms((prev) => prev.map((p) => (p.id === platformId ? { ...p, connected: true } : p)))
    if (platform) notify(`${platform.name} account connected`, 'success')
  }

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); notify('Social data refreshed', 'success') }, 900)
  }

  function handleCreatePost({ platformIds }) {
    const names = platforms.filter((p) => platformIds.includes(p.id)).map((p) => p.name).join(', ')
    notify(`Post published to ${names}`, 'success')
  }

  return (
    <div className="flex-1 space-y-6 pb-10">
      <SocialPageHeader
        onConnectAccount={() => setConnectDialogOpen(true)}
        onCreatePost={() => setPostDialogOpen(true)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <SocialTabs />

      <div className="flex flex-col gap-5">
        {platforms.map((platform) => (
          <SocialPlatformSection key={platform.id} platform={platform} onConnect={handleConnect} />
        ))}
      </div>

      <CreatePostDialog
        open={postDialogOpen}
        onOpenChange={setPostDialogOpen}
        platforms={platforms}
        onSubmit={handleCreatePost}
      />

      <ConnectAccountDialog
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        platforms={platforms}
        onConnect={handleConnect}
      />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
