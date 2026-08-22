"use client"

import { useMemo, useState } from 'react'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import SocialTabs from '@/components/dashboard/social/SocialTabs'
import CreatePostDialog from '@/components/dashboard/social/CreatePostDialog'
import ToastStack from '@/components/shared/ToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'
import { useProject } from '@/contexts/ProjectContext'
import { useSocialAccountsStatus, useSocialPublishing, useCreateSocialPost } from '@/hooks/useDashboardQueries'
import apiService from '@/lib/apiService'

import PublishingHeader from '@/components/dashboard/social/publishing/PublishingHeader'
import PublishingTabs from '@/components/dashboard/social/publishing/PublishingTabs'
import ScheduleCalendar from '@/components/dashboard/social/publishing/ScheduleCalendar'
import PostsTable from '@/components/dashboard/social/publishing/PostsTable'
import PostHistoryTable from '@/components/dashboard/social/publishing/PostHistoryTable'
import BulkUploadCard from '@/components/dashboard/social/publishing/BulkUploadCard'
import PostPlannerBoard from '@/components/dashboard/social/publishing/PostPlannerBoard'
import QuickActions from '@/components/dashboard/social/publishing/QuickActions'

import { PLATFORMS } from '@/lib/socialMediaDummyData'

const META_PLATFORM_IDS = ['facebook', 'instagram']
// The calendar needs every post, not one page at a time — a per-project
// social calendar realistically has far fewer than this many posts, so a
// single wide, unfiltered fetch (bucketed by day client-side, see
// ScheduleCalendar.jsx) is simpler and correct without inventing a
// separate "give me everything in this date range across two possible
// date fields" backend query.
const CALENDAR_FETCH_LIMIT = 200

/**
 * Social Media Management - Publishing tab. Every dummy dataset
 * (lib/publishingDummyData.js's PUBLISHING_POSTS, hardcoded Drafts/
 * Scheduled Today/Pending Approval counts, fake Platform Status) is gone.
 * Schedule/Posts/Post History are real SocialPublication records
 * (see hooks/useDashboardQueries.js's useSocialPublishing and the
 * backend's socialPublishingService.js). Bulk Upload and Post Planner
 * have no real backing feature yet and show an honest "coming soon"
 * state instead of fabricated data (Phase 14/15's own explicit
 * allowance). Pending Approval is removed entirely — no approval
 * workflow exists in Odito.
 */
export default function SocialPublishingPage() {
  const [activeTab, setActiveTab] = useState('schedule')
  const [postDialogOpen, setPostDialogOpen] = useState(false)
  const { toasts, notify, dismiss } = useToastQueue()
  const { activeProjectId } = useProject()

  const statusQuery = useSocialAccountsStatus(activeProjectId)
  const facebook = statusQuery.data?.data?.facebook
  const instagram = statusQuery.data?.data?.instagram

  const calendarQuery = useSocialPublishing(activeProjectId, { sort: 'newest', page: 1, limit: CALENDAR_FETCH_LIMIT })
  const createMutation = useCreateSocialPost(activeProjectId)

  const counts = calendarQuery.data?.data?.counts

  // Real platform status: Facebook/Instagram from the real connection
  // query; X/LinkedIn/TikTok stay "Not Connected" — no OAuth integration
  // exists for them, so anything else would be a fabricated status.
  const platformStatus = useMemo(() => PLATFORMS.map((p) => {
    if (p.id === 'facebook') return { ...p, connected: facebook?.connected === true, publishingReady: facebook?.publishingReady === true }
    if (p.id === 'instagram') return { ...p, connected: instagram?.connected === true, publishingReady: instagram?.publishingReady === true }
    return { ...p, connected: false, publishingReady: false }
  }), [facebook, instagram])

  // Starts a REAL fresh OAuth authorization attempt (auth_type=rerequest —
  // see metaOAuthService.js) rather than reusing whatever session Meta
  // already has for this app, which is what silently let every
  // previously-connected Page/Instagram account keep a token missing
  // pages_manage_posts/instagram_content_publish no matter how many times
  // "Connect" was clicked. The existing connection is left completely
  // untouched unless/until this new authorization actually succeeds
  // (selectMetaPage upserts, it never deletes first).
  async function handleReconnectForPublishing() {
    if (!activeProjectId) {
      notify('Select a project before reconnecting.', 'error')
      return
    }
    try {
      const res = await apiService.getMetaConnectUrl(activeProjectId, 'social', true)
      if (res?.data?.url) {
        window.location.href = res.data.url
        return
      }
      notify('Failed to start the reconnect flow.', 'error')
    } catch (err) {
      notify(err?.message || 'Failed to start the reconnect flow.', 'error')
    }
  }

  function accountIdFor(platformId) {
    if (platformId === 'facebook') return facebook?.connected ? facebook.socialAccountId : null
    if (platformId === 'instagram') return instagram?.connected ? instagram.socialAccountId : null
    return null
  }

  // Returns false on a complete failure so CreatePostDialog keeps the
  // dialog OPEN with the user's text/media/schedule intact instead of
  // closing regardless of outcome — the actual bug behind "I attached a
  // photo, clicked Publish Now, the modal closed, and nothing was ever
  // created": this function already correctly refused the submission and
  // showed an error toast, but the dialog closed anyway, so the rejection
  // was easy to miss and looked identical to a silent success.
  //
  // `media` is already `[{url, type}]` by the time it reaches here —
  // CreatePostDialog's MediaUploader uploads each file to
  // POST /social/media/upload up front and only ever includes files whose
  // upload actually succeeded (see CreatePostDialog.jsx's buildPayload).
  // There is no artificial "photo/video not supported" rejection here
  // anymore now that a real upload pipeline + Facebook/Instagram media
  // publishing exist end to end.
  async function handleCreatePost({ text, platformIds, media, scheduledAt, timezone }) {
    if (!activeProjectId) {
      notify('Select a project before creating a post.', 'error')
      return false
    }
    const targets = platformIds.filter((id) => META_PLATFORM_IDS.includes(id))
    if (targets.length === 0) {
      notify('Select at least one connected Facebook or Instagram account.', 'error')
      return false
    }

    let succeeded = 0
    let lastError = null
    for (const platform of targets) {
      const socialAccountId = accountIdFor(platform)
      if (!socialAccountId) {
        lastError = `${platform === 'instagram' ? 'Instagram' : 'Facebook'} is not connected.`
        continue
      }
      try {
        const res = await createMutation.mutateAsync({
          platform, socialAccountId, content: text, media, scheduledAt: scheduledAt || undefined, timezone: scheduledAt ? timezone : undefined, publishNow: !scheduledAt,
        })
        if (res?.data?.publishError) {
          lastError = res.data.publishError.message
        } else {
          succeeded += 1
        }
      } catch (err) {
        lastError = err?.message || 'Failed to create that post.'
      }
    }

    if (succeeded === targets.length) {
      notify(scheduledAt ? 'Post scheduled.' : 'Post published.', 'success')
      return true
    }
    if (succeeded > 0) {
      notify(`Some posts succeeded, but one failed: ${lastError || 'unknown error'}`, 'error')
      return true
    }
    notify(lastError || 'Failed to create that post.', 'error')
    return false
  }

  function handleCompose() {
    setPostDialogOpen(true)
  }

  return (
    <div className="flex-1 space-y-6 pb-10">
      <PublishingHeader
        onCreatePost={() => setPostDialogOpen(true)}
        onRefresh={() => calendarQuery.refetch()}
        refreshing={calendarQuery.isFetching}
        onExport={() => notify('Export is not available yet.', 'error')}
      />

      <SocialTabs />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <PublishingTabs />

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px] gap-5 items-start mt-4">
          <div className="min-w-0">
            <TabsContent value="schedule" className="mt-0">
              <ScheduleCalendar posts={calendarQuery.data?.data?.data || []} isLoading={calendarQuery.isLoading} onCompose={handleCompose} />
            </TabsContent>

            <TabsContent value="posts" className="mt-0">
              <PostsTable notify={notify} />
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <PostHistoryTable notify={notify} />
            </TabsContent>

            <TabsContent value="bulk-upload" className="mt-0">
              <BulkUploadCard />
            </TabsContent>

            <TabsContent value="planner" className="mt-0">
              <PostPlannerBoard />
            </TabsContent>
          </div>

          <QuickActions onCreatePost={() => setPostDialogOpen(true)} onGoToTab={setActiveTab} counts={counts} platformStatus={platformStatus} onReconnectForPublishing={handleReconnectForPublishing} />
        </div>
      </Tabs>

      <CreatePostDialog
        open={postDialogOpen}
        onOpenChange={setPostDialogOpen}
        platforms={platformStatus}
        onSubmit={handleCreatePost}
        projectId={activeProjectId}
      />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
