"use client"

import { useState, useEffect } from 'react'
import { useProject } from '@/contexts/ProjectContext'
import {
  useBusinessProfileStatus,
  useBusinessProfileDetails,
  useBusinessProfilePosts,
  useCreateBusinessProfilePost,
  useUpdateBusinessProfilePost,
  useDeleteBusinessProfilePost,
  useSyncBusinessProfilePosts,
} from '@/hooks/useDashboardQueries'
import { useToastQueue } from '@/hooks/useToastQueue'
import ToastStack from '@/components/shared/ToastStack'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

import BusinessProfileLoadingState from '@/components/dashboard/google-visibility/business-profile/BusinessProfileLoadingState'
import BusinessProfileEmptyState from '@/components/dashboard/google-visibility/business-profile/BusinessProfileEmptyState'
import PostsHeader from '@/components/dashboard/google-visibility/business-profile/posts/PostsHeader'
import PostsKPIs from '@/components/dashboard/google-visibility/business-profile/posts/PostsKPIs'
import PostsToolbar from '@/components/dashboard/google-visibility/business-profile/posts/PostsToolbar'
import PostCard from '@/components/dashboard/google-visibility/business-profile/posts/PostCard'
import PostComposerDialog from '@/components/dashboard/google-visibility/business-profile/posts/PostComposerDialog'
import DeletePostDialog from '@/components/dashboard/google-visibility/business-profile/posts/DeletePostDialog'
import {
  PostsListSkeleton,
  PostsEmptyState,
  PostsNoMatchState,
  PostsUnavailableState,
  PostsErrorState,
} from '@/components/dashboard/google-visibility/business-profile/posts/PostsStates'

const PAGE_SIZE = 9

export default function BusinessProfilePostsPage() {
  const { activeProjectId: projectId } = useProject()
  const { toasts, notify, dismiss } = useToastQueue()

  // Connection & selection gating
  const statusQuery = useBusinessProfileStatus(projectId)
  const status = statusQuery.data?.data
  const connected = !!status?.connected
  const selected = connected && !!status?.serviceEnabled
  const isReconnect = status?.connectionStatus === 'expired' || status?.connectionStatus === 'revoked'

  const detailsQuery = useBusinessProfileDetails(projectId, { enabled: selected })
  const details = detailsQuery.data?.data

  // Filters and pagination state
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [topicType, setTopicType] = useState('ALL')
  const [postState, setPostState] = useState('ALL')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Reset page when filters change
  const handleTopicTypeChange = (val) => {
    setTopicType(val)
    setPage(1)
  }

  const handleStateChange = (val) => {
    setPostState(val)
    setPage(1)
  }

  const handleSortChange = (val) => {
    setSort(val)
    setPage(1)
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setSearch('')
    setTopicType('ALL')
    setPostState('ALL')
    setSort('newest')
    setPage(1)
  }

  // Posts query
  const postsQuery = useBusinessProfilePosts(
    projectId,
    {
      page,
      limit: PAGE_SIZE,
      topicType,
      state: postState,
      search,
      sort,
    },
    { enabled: selected }
  )

  const postsData = postsQuery.data?.data
  const postsList = postsData?.posts || []
  const pagination = postsData?.pagination || { page: 1, limit: PAGE_SIZE, total: 0, pages: 0 }
  const summary = postsData?.summary || { totalPosts: 0, livePosts: 0, totalViews: 0, totalActions: 0 }

  // Mutations
  const createMutation = useCreateBusinessProfilePost(projectId)
  const updateMutation = useUpdateBusinessProfilePost(projectId)
  const deleteMutation = useDeleteBusinessProfilePost(projectId)
  const syncMutation = useSyncBusinessProfilePosts(projectId)

  // Modals state
  const [composerOpen, setComposerOpen] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleOpenCreate = () => {
    setEditingPost(null)
    setComposerOpen(true)
  }

  const handleOpenEdit = (post) => {
    setEditingPost(post)
    setComposerOpen(true)
  }

  const handleOpenDelete = (post) => {
    setDeleteTarget(post)
  }

  const handleComposerSubmit = (payload) => {
    if (editingPost) {
      updateMutation.mutate(
        { postId: editingPost.google_post_id, postData: payload },
        {
          onSuccess: () => {
            notify('Local post updated successfully.', 'success')
            setComposerOpen(false)
            setEditingPost(null)
          },
          onError: (err) => {
            notify(err?.message || 'Failed to update post.', 'danger')
          },
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          notify('Local post published to Google.', 'success')
          setComposerOpen(false)
        },
        onError: (err) => {
          notify(err?.message || 'Failed to create post on Google.', 'danger')
        },
      })
    }
  }

  const handleDeleteConfirm = (postId) => {
    deleteMutation.mutate(postId, {
      onSuccess: () => {
        notify('Post removed from Google Business Profile.', 'success')
        setDeleteTarget(null)
      },
      onError: (err) => {
        notify(err?.message || 'Failed to delete post.', 'danger')
      },
    })
  }

  const handleSyncPosts = () => {
    syncMutation.mutate(undefined, {
      onSuccess: (res) => {
        const count = res?.data?.postCount ?? 0
        notify(`Posts synced successfully (${count} total).`, 'success')
      },
      onError: (err) => {
        notify(err?.message || 'Failed to sync posts.', 'danger')
      },
    })
  }

  // Render logic for loading / connect / select
  if (statusQuery.isLoading) {
    return <div className="flex-1"><BusinessProfileLoadingState /></div>
  }

  if (statusQuery.isError) {
    return (
      <div className="flex-1 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Google Business Profile Posts</h1>
        </div>
        <div className="max-w-md mx-auto mt-10 text-center text-sm text-muted-foreground">
          Couldn't load your Business Profile connection status. Please refresh the page.
        </div>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="flex-1 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Google Business Profile Posts</h1>
          <p className="text-muted-foreground">
            Connect your Google Business Profile to publish updates, events, and offers.
          </p>
        </div>
        <BusinessProfileEmptyState variant={isReconnect ? 'reconnect' : 'connect'} />
      </div>
    )
  }

  if (!selected) {
    return (
      <div className="flex-1 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Google Business Profile Posts</h1>
          <p className="text-muted-foreground">
            Please select a location on the Google Business Profile overview page before managing posts.
          </p>
        </div>
        <BusinessProfileEmptyState variant="connect" />
      </div>
    )
  }

  const isRestrictedOrUnavailable = postsData?.available === false && postsData?.status !== 'unknown'
  const hasActiveFilters = Boolean(search || topicType !== 'ALL' || postState !== 'ALL')

  return (
    <div className="flex-1 space-y-6 pb-12">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <PostsHeader
        businessName={details?.businessName}
        lastSyncedAt={status?.lastSyncAt}
        syncing={syncMutation.isPending}
        onSync={handleSyncPosts}
        onCreatePost={handleOpenCreate}
      />

      {/* KPI summary cards */}
      <PostsKPIs summary={summary} />

      {/* Toolbar with Search and Filters */}
      <PostsToolbar
        search={searchInput}
        onSearchChange={setSearchInput}
        topicType={topicType}
        onTopicTypeChange={handleTopicTypeChange}
        state={postState}
        onStateChange={handleStateChange}
        sort={sort}
        onSortChange={handleSortChange}
      />

      {/* Main Content Area */}
      {isRestrictedOrUnavailable ? (
        <PostsUnavailableState
          status={postsData.status}
          reason={postsData.reason}
          onRetry={() => postsQuery.refetch()}
        />
      ) : postsQuery.isError ? (
        <PostsErrorState onRetry={() => postsQuery.refetch()} />
      ) : postsQuery.isLoading && !postsData ? (
        <PostsListSkeleton />
      ) : postsList.length === 0 ? (
        hasActiveFilters ? (
          <PostsNoMatchState onResetFilters={handleResetFilters} />
        ) : (
          <PostsEmptyState onCreatePost={handleOpenCreate} />
        )
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {postsList.map((post) => (
              <PostCard
                key={post.google_post_id}
                post={post}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>

          {/* Pagination controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
              <span>
                Showing <strong className="text-foreground">{((page - 1) * PAGE_SIZE) + 1}</strong> to{' '}
                <strong className="text-foreground">{Math.min(page * PAGE_SIZE, pagination.total)}</strong> of{' '}
                <strong className="text-foreground">{pagination.total}</strong> posts
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || postsQuery.isFetching}
                  className="gap-1 h-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <span className="px-2 font-medium text-foreground">
                  Page {page} of {pagination.pages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page >= pagination.pages || postsQuery.isFetching}
                  className="gap-1 h-8"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <PostComposerDialog
        open={composerOpen}
        onOpenChange={setComposerOpen}
        post={editingPost}
        projectId={projectId}
        onSubmit={handleComposerSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <DeletePostDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        post={deleteTarget}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
