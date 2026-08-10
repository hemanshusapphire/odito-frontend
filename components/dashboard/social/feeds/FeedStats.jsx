"use client"

import { useMemo } from 'react'
import { Layers, TrendingUp, TrendingDown } from 'lucide-react'
import { FEED_PLATFORMS, FEED_TRENDS } from '@/lib/socialFeedsDummyData'

/**
 * "All Feeds" + one tile per platform, each showing a live post count for
 * the current (unfiltered) post set, a small dummy trend, and doubling as
 * a quick platform filter - clicking a tile sets FeedFilters' platform
 * value the same as picking it from the dropdown would.
 */
export default function FeedStats({ posts, activePlatform, onSelectPlatform }) {
  const counts = useMemo(() => {
    const byPlatform = {}
    for (const p of posts) byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1
    return byPlatform
  }, [posts])

  const tiles = [
    { id: 'all', name: 'All Feeds', icon: Layers, color: 'var(--primary)', count: posts.length, trend: null },
    ...FEED_PLATFORMS.map((p) => ({ ...p, count: counts[p.id] || 0, trend: FEED_TRENDS[p.id] })),
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {tiles.map((tile) => {
        const Icon = tile.icon
        const active = activePlatform === tile.id
        const up = tile.trend?.startsWith('+')
        return (
          <button
            key={tile.id}
            onClick={() => onSelectPlatform(tile.id)}
            className={`text-left rounded-xl border px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md ${
              active ? 'border-primary bg-primary/5 shadow-sm' : 'bg-card hover:border-muted-foreground/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${tile.color}18`, color: tile.color }}>
                <Icon className="h-4 w-4" />
              </span>
              {tile.trend && (
                <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${up ? 'text-emerald-500' : 'text-destructive'}`}>
                  {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {tile.trend}
                </span>
              )}
            </div>
            <div className="text-xl font-bold tabular-nums font-mono">{tile.count}</div>
            <div className="text-xs text-muted-foreground truncate">{tile.name}</div>
          </button>
        )
      })}
    </div>
  )
}
