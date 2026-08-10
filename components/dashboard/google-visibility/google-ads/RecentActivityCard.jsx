"use client"

import { Card } from '@/components/ui/card'
import { History } from 'lucide-react'
import { useGoogleAdsActivity } from '@/hooks/useDashboardQueries'
import GoogleAdsCardState from './GoogleAdsCardState'
import { formatRelativeTime } from '@/lib/formatRelativeTime'

/** Chronological feed of account activity - reads GET /google-ads/activity (merged sync/recommendation/budget-alert/campaign/optimization events). */
export default function RecentActivityCard({ projectId, ready }) {
  const { data, isLoading, isError, refetch } = useGoogleAdsActivity(projectId, { limit: 8 }, { enabled: !!ready })
  const items = data?.data || []
  const status = isLoading ? 'loading' : isError ? 'error' : items.length === 0 ? 'empty' : 'ready'

  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold">Recent Activity</h3>

      {status !== 'ready' ? (
        <div className="mt-4">
          <GoogleAdsCardState status={status} icon={History} message="No recent activity." onRetry={refetch} height="py-8" />
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {items.map((item, i) => (
            <li key={item.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: item.color }} />
                {i < items.length - 1 && <span className="w-px flex-1 bg-border mt-1.5" />}
              </div>
              <div className="pb-0.5 flex-1 flex items-center justify-between gap-3 min-w-0">
                <p className="text-xs text-foreground leading-relaxed">{item.text}</p>
                <p className="text-[11px] text-muted-foreground shrink-0">{formatRelativeTime(item.timestamp)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
