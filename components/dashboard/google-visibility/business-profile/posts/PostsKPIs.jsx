"use client"

import { Card } from '@/components/ui/card'
import { FileText, Radio, Eye, MousePointerClick } from 'lucide-react'

export default function PostsKPIs({ summary = {} }) {
  const {
    totalPosts = 0,
    livePosts = 0,
    totalViews = 0,
    totalActions = 0,
    postsWithMetrics
  } = summary

  // No post has had its views/clicks measured yet -> show "—", not a misleading 0.
  // (`postsWithMetrics` undefined = older API: keep showing the numbers.)
  const metricsKnown = postsWithMetrics === undefined || postsWithMetrics > 0 || totalPosts === 0
  const notMeasured = 'Not measured yet - sync to load'

  const cards = [
    {
      title: 'Total Posts',
      value: totalPosts.toLocaleString(),
      subtitle: 'Published & archived posts',
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Live Posts',
      value: livePosts.toLocaleString(),
      subtitle: 'Currently visible on Google',
      icon: Radio,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    },
    {
      title: 'Search Views',
      value: metricsKnown ? totalViews.toLocaleString() : '—',
      subtitle: metricsKnown ? 'Direct views across Search & Maps' : notMeasured,
      icon: Eye,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10'
    },
    {
      title: 'Action Clicks',
      value: metricsKnown ? totalActions.toLocaleString() : '—',
      subtitle: metricsKnown ? 'Clicks on call-to-action buttons' : notMeasured,
      icon: MousePointerClick,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="p-4 flex items-center justify-between">
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
              <p className="text-2xl font-bold tracking-tight tabular-nums">{card.value}</p>
              <p className="text-[11px] text-muted-foreground truncate">{card.subtitle}</p>
            </div>
            <div className={`h-11 w-11 rounded-lg ${card.bgColor} ${card.color} flex items-center justify-center shrink-0`}>
              <Icon className="h-5 w-5" />
            </div>
          </Card>
        )
      })}
    </div>
  )
}
