"use client"

import { useState } from 'react'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import SocialTabs from '@/components/dashboard/social/SocialTabs'
import CreatePostDialog from '@/components/dashboard/social/CreatePostDialog'
import ToastStack from '@/components/shared/ToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'

import PublishingHeader from '@/components/dashboard/social/publishing/PublishingHeader'
import PublishingTabs from '@/components/dashboard/social/publishing/PublishingTabs'
import ScheduleCalendar from '@/components/dashboard/social/publishing/ScheduleCalendar'
import PostsTable from '@/components/dashboard/social/publishing/PostsTable'
import PostHistoryTable from '@/components/dashboard/social/publishing/PostHistoryTable'
import BulkUploadCard from '@/components/dashboard/social/publishing/BulkUploadCard'
import PostPlannerBoard from '@/components/dashboard/social/publishing/PostPlannerBoard'
import QuickActions from '@/components/dashboard/social/publishing/QuickActions'

import { PLATFORMS } from '@/lib/socialMediaDummyData'

/**
 * Social Media Management - Publishing tab. Frontend-only: Schedule/Posts/
 * Post History/Bulk Upload/Post Planner are all built over the static
 * PUBLISHING_POSTS/INITIAL_PLANNER_TASKS/UPLOAD_HISTORY arrays in
 * lib/publishingDummyData.js - no backend, no API, no React Query.
 */
export default function SocialPublishingPage() {
  const [activeTab, setActiveTab] = useState('schedule')
  const [refreshing, setRefreshing] = useState(false)
  const [postDialogOpen, setPostDialogOpen] = useState(false)
  const { toasts, notify, dismiss } = useToastQueue()

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); notify('Publishing data refreshed', 'success') }, 900)
  }

  function handleCreatePost({ platformIds }) {
    const names = PLATFORMS.filter((p) => platformIds.includes(p.id)).map((p) => p.name).join(', ')
    notify(`Post published to ${names}`, 'success')
  }

  function handleCompose(date) {
    setPostDialogOpen(true)
    notify(`Composing a new post for ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`)
  }

  return (
    <div className="flex-1 space-y-6 pb-10">
      <PublishingHeader
        onCreatePost={() => setPostDialogOpen(true)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onExport={() => notify('Exporting publishing data…', 'success')}
      />

      <SocialTabs />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <PublishingTabs />

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px] gap-5 items-start mt-4">
          <div className="min-w-0">
            <TabsContent value="schedule" className="mt-0">
              <ScheduleCalendar onCompose={handleCompose} />
            </TabsContent>

            <TabsContent value="posts" className="mt-0">
              <PostsTable
                onEdit={(post) => notify(`Editing "${post.title}"`)}
                onDuplicate={(post) => notify(`"${post.title}" duplicated`, 'success')}
                onDelete={(post) => notify(`"${post.title}" deleted`, 'danger')}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <PostHistoryTable onRetry={(post) => notify(`Retrying "${post.title}"…`)} />
            </TabsContent>

            <TabsContent value="bulk-upload" className="mt-0">
              <BulkUploadCard onImportComplete={(v) => notify(`${v.valid} posts imported successfully`, 'success')} />
            </TabsContent>

            <TabsContent value="planner" className="mt-0">
              <PostPlannerBoard onNotify={notify} />
            </TabsContent>
          </div>

          <QuickActions onCreatePost={() => setPostDialogOpen(true)} onGoToTab={setActiveTab} />
        </div>
      </Tabs>

      <CreatePostDialog
        open={postDialogOpen}
        onOpenChange={setPostDialogOpen}
        platforms={PLATFORMS}
        onSubmit={handleCreatePost}
      />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
