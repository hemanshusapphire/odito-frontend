"use client"

import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Shared loading/error/empty block for Google Ads dashboard card bodies
 * (Phase 7.2) - one implementation instead of every card re-inventing its
 * own skeleton/error/empty markup. Cards render this in place of their real
 * content whenever `status` isn't 'ready'; the "has data" branch stays in
 * each card since that part is genuinely unique per widget.
 *
 * Distinguishes the three non-happy states Phase 6 asked for (loading / API
 * error / no data) - "disconnected account" isn't a per-card state here
 * because page.jsx already gates the entire dashboard body behind
 * connected+selected+ready before any of these cards ever mount.
 */
export default function GoogleAdsCardState({ status, icon: Icon, message, height = 'py-10', onRetry }) {
  if (status === 'loading') {
    return (
      <div className={height}>
        <Skeleton className="h-full w-full min-h-[64px]" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className={`flex flex-col items-center justify-center text-center gap-2 text-muted-foreground ${height}`}>
        <AlertTriangle className="h-8 w-8 opacity-40 text-red-500" />
        <p className="text-sm">{message || 'Something went wrong loading this data.'}</p>
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry} className="gap-1.5 mt-1">
            <RotateCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        )}
      </div>
    )
  }

  // 'empty'
  return (
    <div className={`flex flex-col items-center justify-center text-center gap-2 text-muted-foreground ${height}`}>
      {Icon && <Icon className="h-8 w-8 opacity-40" />}
      <p className="text-sm">{message}</p>
    </div>
  )
}
