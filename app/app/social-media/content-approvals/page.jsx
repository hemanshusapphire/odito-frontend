"use client"

import { useEffect, useMemo, useState } from 'react'
import { ApprovalTabs } from '@/components/social-media/ApprovalTabs'
import { ApprovalPostList } from '@/components/social-media/ApprovalPostList'
import { ContentEditor } from '@/components/social-media/ContentEditor'
import { PostBrief } from '@/components/social-media/PostBrief'
import { ApprovalInfoCard } from '@/components/social-media/ApprovalInfoCard'
import { ApprovalActionBar } from '@/components/social-media/ApprovalActionBar'
import SocialMediaToastStack from '@/components/social-media/SocialMediaToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'
import { APPROVAL_POSTS, APPROVAL_TABS } from '@/lib/socialMediaAIDummyData'

const REGENERATED_CAPTIONS = [
  "Here's a fresh angle: lead with the outcome your audience cares about most, then back it up with one clear, specific benefit.",
  'Try a punchier hook: open with a bold, benefit-driven line, then follow with a simple next step for the reader.',
  "A warmer take: speak directly to the reader's situation first, then show how this makes things easier for them.",
]

function toDraft(post) {
  return { topic: post.topic, caption: post.caption, cta: post.cta, hashtags: post.hashtags.join(' ') }
}

function parseHashtags(text) {
  return text.split(/\s+/).map((t) => t.trim()).filter(Boolean).slice(0, 10)
}

/**
 * Social Media AI - Content Approvals. Entirely frontend-only, same as the
 * rest of the module: every post comes from lib/socialMediaAIDummyData.js,
 * no API calls, no real AI regeneration or design generation. Approving or
 * saving a draft only ever updates local component state.
 */
export default function ContentApprovalsPage() {
  const [posts, setPosts] = useState(APPROVAL_POSTS)
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedPostId, setSelectedPostId] = useState(APPROVAL_POSTS[0]?.id ?? null)
  const { toasts, notify, dismiss } = useToastQueue()

  const filteredPosts = useMemo(() => posts.filter((p) => p.status === activeTab), [posts, activeTab])
  const selectedPost = useMemo(() => posts.find((p) => p.id === selectedPostId) || null, [posts, selectedPostId])

  const [draftFields, setDraftFields] = useState(() => (selectedPost ? toDraft(selectedPost) : null))
  useEffect(() => {
    setDraftFields(selectedPost ? toDraft(selectedPost) : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPost?.id])

  function handleTabChange(tabId) {
    setActiveTab(tabId)
    const firstOfTab = posts.find((p) => p.status === tabId)
    setSelectedPostId(firstOfTab?.id ?? null)
  }

  function handleFieldChange(field, value) {
    setDraftFields((prev) => ({ ...prev, [field]: value }))
  }

  function handleRegenerate(instruction) {
    const alt = REGENERATED_CAPTIONS[Math.floor(Math.random() * REGENERATED_CAPTIONS.length)]
    setDraftFields((prev) => ({ ...prev, caption: alt }))
    notify(instruction?.trim() ? `Regenerated with your note: "${instruction.trim()}"` : 'Content regenerated.', 'success')
  }

  function handleSaveDraft() {
    if (!selectedPost || !draftFields) return
    const { topic, caption, cta, hashtags } = draftFields
    setPosts((prev) =>
      prev.map((p) => (p.id === selectedPost.id ? { ...p, topic, caption, cta, hashtags: parseHashtags(hashtags) } : p))
    )
    notify('Draft saved.', 'default')
  }

  function handleApprove() {
    if (!selectedPost || !draftFields) return
    const { topic, caption, cta, hashtags } = draftFields
    const approvedId = selectedPost.id
    const wasVisibleInActiveTab = selectedPost.status === activeTab

    setPosts((prev) =>
      prev.map((p) =>
        p.id === approvedId ? { ...p, topic, caption, cta, hashtags: parseHashtags(hashtags), status: 'approved' } : p
      )
    )
    notify(`"${selectedPost.title}" approved. AI will start generating designs.`, 'success')

    if (wasVisibleInActiveTab) {
      const remaining = posts.filter((p) => p.status === activeTab && p.id !== approvedId)
      setSelectedPostId(remaining[0]?.id ?? null)
    }
  }

  return (
    <div className="flex-1 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Content Approvals</h1>
        <p className="mt-1 text-sm text-slate-500">Approve the words before AI creates the visuals</p>
      </div>

      <ApprovalTabs tabs={APPROVAL_TABS} posts={posts} activeTab={activeTab} onChange={handleTabChange} />

      {selectedPost && draftFields ? (
        <>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
            <ApprovalPostList posts={filteredPosts} selectedPostId={selectedPostId} onSelectPost={setSelectedPostId} />

            <ContentEditor post={selectedPost} fields={draftFields} onFieldChange={handleFieldChange} onRegenerate={handleRegenerate} />

            <div className="flex flex-col gap-5">
              <PostBrief post={selectedPost} />
              <ApprovalInfoCard />
            </div>
          </div>

          <ApprovalActionBar key={selectedPostId} postStatus={selectedPost.status} onSaveDraft={handleSaveDraft} onApprove={handleApprove} />
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-16 text-center">
          <p className="text-base font-semibold text-slate-800">You&apos;re all caught up</p>
          <p className="text-sm text-slate-500">Nothing left in this tab right now.</p>
        </div>
      )}

      <SocialMediaToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
