"use client"

import { Layers } from 'lucide-react'
import { FEED_PLATFORMS } from '@/lib/socialFeedsDummyData'

/**
 * "All Feeds" + one tile per platform. Counts come straight from the
 * backend's real `summary` (GET /api/social/feeds — see
 * socialFeedService.js), never computed client-side from the current
 * post page, so they always reflect the FULL project total regardless of
 * which page/filter is active. Facebook/Instagram are real synced
 * counts; X/LinkedIn/TikTok are real zeros (not integrated yet), never a
 * fabricated trend or number — no dummy week-over-week trend is shown
 * anymore for that same reason. Doubles as a quick platform filter,
 * clicking a tile sets FeedFilters' platform value the same as picking
 * it from the dropdown would.
 */
export default function FeedStats({ summary, activePlatform, onSelectPlatform }) {
  const counts = summary || { all: 0, facebook: 0, instagram: 0, x: 0, linkedin: 0, tiktok: 0 }

  const tiles = [
    { id: 'all', name: 'All Feeds', icon: Layers, color: 'var(--primary)', count: counts.all },
    ...FEED_PLATFORMS.map((p) => ({ ...p, count: counts[p.id] || 0 })),
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {tiles.map((tile) => {
        const Icon = tile.icon
        const active = activePlatform === tile.id
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
            </div>
            <div className="text-xl font-bold tabular-nums font-mono">{tile.count}</div>
            <div className="text-xs text-muted-foreground truncate">{tile.name}</div>
          </button>
        )
      })}
    </div>
  )
}
