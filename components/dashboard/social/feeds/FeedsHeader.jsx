"use client"

import { Link2, RefreshCw, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ActiveAccountBadge from '../ActiveAccountBadge'

/**
 * Page header for the Feeds tab: title/subtitle + the same active-account
 * indicator Social Media Overview shows (ActiveAccountBadge, fed by the
 * identical useFacebookAccounts source of truth — no separate/duplicated
 * account state for this page) + Connect Account/Refresh/Create New Post
 * actions. No Switch Account button here — switching lives on Overview;
 * Feeds only displays whichever account is currently active.
 */
export default function FeedsHeader({ activeAccountName, activeAccountPicture, onConnectAccount, onRefresh, refreshing, onCreatePost }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feeds</h1>
        <p className="text-muted-foreground max-w-lg text-sm">
          View all posts published across your connected social media platforms.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap justify-end">
        <ActiveAccountBadge name={activeAccountName} picture={activeAccountPicture} />
        <Button variant="outline" size="sm" onClick={onConnectAccount} className="gap-2">
          <Link2 className="h-4 w-4" />
          Connect Account
        </Button>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing} className="gap-2">
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
        <Button size="sm" onClick={onCreatePost} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Post
        </Button>
      </div>
    </div>
  )
}
