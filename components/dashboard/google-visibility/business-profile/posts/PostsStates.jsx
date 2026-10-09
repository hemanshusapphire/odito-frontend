"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText,
  SearchX,
  AlertTriangle,
  Lock,
  Plus,
  RefreshCw
} from 'lucide-react'

export function PostsListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-4 space-y-3">
          <Skeleton className="aspect-video w-full rounded-md" />
          <div className="flex justify-between">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex justify-between pt-2 border-t">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-14" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export function PostsEmptyState({ onCreatePost }) {
  return (
    <Card className="p-12 text-center border-dashed">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <FileText className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold">No Google Business Profile Posts Yet</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-6">
        Post updates, offers, announcements, and events directly to Google Search and Google Maps to engage local customers.
      </p>
      {onCreatePost && (
        <Button onClick={onCreatePost} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Your First Post
        </Button>
      )}
    </Card>
  )
}

export function PostsNoMatchState({ onResetFilters }) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
        <SearchX className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold">No posts match your filters</h3>
      <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
        Try adjusting your search query, topic filter, or status criteria.
      </p>
      {onResetFilters && (
        <Button variant="outline" size="sm" onClick={onResetFilters}>
          Reset all filters
        </Button>
      )}
    </Card>
  )
}

export function PostsUnavailableState({ status, reason, onRetry }) {
  const isRestricted = status === 'restricted'
  const isApiDisabled = status === 'api_disabled'

  return (
    <Card className="p-8 text-center max-w-xl mx-auto border-dashed">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-4">
        <Lock className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold">Google Posts Access Unavailable</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-4 leading-relaxed">
        {reason || (isRestricted
          ? 'Google limits direct post publishing to approved API partners under their API policy.'
          : isApiDisabled
            ? 'The Google My Business API is not enabled in your Google Cloud Console.'
            : 'Access to Google Business Profile posts is currently restricted by Google.')}
      </p>
      <div className="flex justify-center gap-3">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Check Again
          </Button>
        )}
      </div>
    </Card>
  )
}

export function PostsErrorState({ onRetry }) {
  return (
    <Card className="p-8 text-center border-destructive/20 bg-destructive/5 max-w-md mx-auto">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-destructive">Failed to Load Google Posts</h3>
      <p className="text-xs text-muted-foreground mt-1 mb-4">
        An error occurred while communicating with the Google Business Profile service.
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </Card>
  )
}
