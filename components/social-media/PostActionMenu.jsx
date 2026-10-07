"use client"

import { MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Three-dot menu for a real post row. Which items appear is decided by the
 * mapped post's flags (see lib/socialMedia/postMapper.js — all derived from
 * the backend's status and its own `canRetry`), and the backend still
 * re-validates every action.
 */
export function PostActionMenu({ post, disabled = false, onEditSchedule, onView, onDuplicate, onCancel, onRetry, onDiscard }) {
  const showRetry = post.status === 'failed' && post.canRetry && !post.outcomeUnknown && !post.requiresReconnect
  const showDestructive = post.canCancel && post.status === 'scheduled'
  const showDiscard = post.status === 'failed' && post.canDelete

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Post options"
          disabled={disabled}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 border-slate-200 bg-white text-slate-700 shadow-lg">
        {post.canEditSchedule && (
          <DropdownMenuItem onClick={() => onEditSchedule(post.id)} className="text-sm focus:bg-violet-50 focus:text-violet-700">
            Edit schedule
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onView?.(post)} className="text-sm focus:bg-violet-50 focus:text-violet-700">
          View post
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDuplicate?.(post)} className="text-sm focus:bg-violet-50 focus:text-violet-700">
          Duplicate
        </DropdownMenuItem>
        {showDestructive && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onCancel?.(post)} className="text-sm text-red-500 focus:bg-red-50 focus:text-red-600">
              Cancel schedule
            </DropdownMenuItem>
          </>
        )}
        {(showRetry || showDiscard) && (
          <>
            <DropdownMenuSeparator />
            {showRetry && (
              <DropdownMenuItem onClick={() => onRetry?.(post)} className="text-sm focus:bg-violet-50 focus:text-violet-700">
                Retry
              </DropdownMenuItem>
            )}
            {showDiscard && (
              <DropdownMenuItem onClick={() => onDiscard?.(post)} className="text-sm text-red-500 focus:bg-red-50 focus:text-red-600">
                Discard
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default PostActionMenu
