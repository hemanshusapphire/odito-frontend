"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, UploadCloud, FileText, CalendarClock } from 'lucide-react'

/**
 * Right-side Quick Actions + Platform Status panel for the Publishing
 * tab. `counts` (drafts/scheduledToday) and `platformStatus` come from
 * app/app/social/publishing/page.jsx, sourced from the real
 * useSocialPublishing/useSocialAccountsStatus queries — never computed
 * from a static array here. Pending Approval is gone entirely: no
 * approval workflow exists in Odito, so a fabricated "6" would be exactly
 * the kind of made-up metric this phase removes.
 */
export default function QuickActions({ onCreatePost, onGoToTab, counts, platformStatus, onReconnectForPublishing }) {
  const stats = [
    { key: 'drafts', label: 'Drafts', value: counts?.drafts ?? 0, icon: FileText, onClick: () => onGoToTab('posts') },
    { key: 'scheduledToday', label: 'Scheduled Today', value: counts?.scheduledToday ?? 0, icon: CalendarClock, onClick: () => onGoToTab('schedule') },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Quick Actions</h4>
        <div className="flex flex-col gap-2">
          <Button size="sm" onClick={onCreatePost} className="gap-2 justify-start">
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
          <Button size="sm" variant="outline" onClick={() => onGoToTab('bulk-upload')} className="gap-2 justify-start">
            <UploadCloud className="h-4 w-4" />
            Bulk Upload
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-col gap-2.5">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.key}
                onClick={s.onClick}
                className="flex items-center justify-between rounded-lg bg-muted/30 hover:bg-muted/50 px-3 py-2.5 transition-colors text-left"
              >
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  {s.label}
                </span>
                <span className="font-mono font-bold text-sm">{s.value}</span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card className="p-4">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Platform Status</h4>
        <div className="flex flex-col gap-2">
          {(platformStatus || []).map((p) => {
            const Icon = p.icon
            // Connected does not necessarily mean publish-ready — a
            // Page/account authorized before pages_manage_posts/
            // instagram_content_publish existed can read (analytics,
            // overview) but cannot actually post. Surfacing this
            // distinction (rather than a misleading plain "Connected")
            // is what tells a real user why Publish Now/Schedule keeps
            // failing even though the platform shows as connected.
            const needsPublishingReconnect = p.connected && p.publishingReady === false
            return (
              <div key={p.id} className="flex flex-col gap-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" style={{ color: p.brandColor }} />
                    {p.name}
                  </span>
                  <Badge variant={p.connected ? (needsPublishingReconnect ? 'warning' : 'success') : 'secondary'} className="text-[10px]">
                    {p.connected ? (needsPublishingReconnect ? 'Read Only' : 'Connected') : 'Not Connected'}
                  </Badge>
                </div>
                {needsPublishingReconnect && (
                  <div className="pl-5.5 flex flex-col gap-1">
                    <p className="text-[10.5px] text-muted-foreground leading-snug">
                      Connected for analytics/read access, but publishing permission is required.
                    </p>
                    <button
                      type="button"
                      onClick={onReconnectForPublishing}
                      className="self-start text-[10.5px] font-medium text-primary hover:underline"
                    >
                      Reconnect for Publishing
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
