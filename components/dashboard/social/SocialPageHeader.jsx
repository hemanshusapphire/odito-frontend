"use client"

import { Link2, Repeat, Plus, RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ActiveAccountBadge from './ActiveAccountBadge'

/**
 * Page header: title/subtitle + (when a Facebook Page is connected) the
 * currently ACTIVE account's name/avatar + Connect Account / Switch
 * Account / Refresh / Create New Post actions. `activeAccountName` is
 * read from the exact same source as SwitchAccountDialog's own "Currently
 * connected" line and the modal's in-card Active badge (useFacebookAccounts,
 * account.isActive) — never a separate/hardcoded value, so this can never
 * drift out of sync with the modal or with which Page's data the
 * Overview cards are actually showing. Switch Account only renders once
 * there's at least one connected Facebook Page to switch between —
 * `showSwitchAccount` is driven by the real, DB-sourced connection status,
 * not shown unconditionally.
 */
export default function SocialPageHeader({ activeAccountName, activeAccountPicture, onConnectAccount, onSwitchAccount, showSwitchAccount, onCreatePost, onRefresh, refreshing }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Social Media Management</h1>
        <p className="text-muted-foreground max-w-lg text-sm">
          Monitor and publish across all your connected social channels from one place.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap justify-end">
        <ActiveAccountBadge name={activeAccountName} picture={activeAccountPicture} />
        <Button variant="outline" size="sm" onClick={onConnectAccount} className="gap-2">
          <Link2 className="h-4 w-4" />
          Connect Account
        </Button>
        {showSwitchAccount && (
          <Button variant="outline" size="sm" onClick={onSwitchAccount} className="gap-2">
            <Repeat className="h-4 w-4" />
            Switch Account
          </Button>
        )}
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
