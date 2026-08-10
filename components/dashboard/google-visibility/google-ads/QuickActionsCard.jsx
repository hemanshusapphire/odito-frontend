"use client"

import { Card } from '@/components/ui/card'
import { RefreshCw, Loader2, Zap, Sparkles, LayoutGrid } from 'lucide-react'

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Sidebar widget: shortcuts to the most common actions on this page. */
export default function QuickActionsCard({ refreshing, onRefresh }) {
  const actions = [
    {
      key: 'refresh',
      icon: refreshing ? Loader2 : RefreshCw,
      label: refreshing ? 'Refreshing…' : 'Refresh Data',
      iconClassName: refreshing ? 'animate-spin' : '',
      onClick: onRefresh,
    },
    {
      key: 'open',
      icon: Zap,
      label: 'Open Google Ads',
      href: 'https://ads.google.com',
    },
    {
      key: 'optimization',
      icon: Sparkles,
      label: 'Optimization Center',
      onClick: () => scrollToSection('google-ads-optimization-center'),
    },
    {
      key: 'campaigns',
      icon: LayoutGrid,
      label: 'Campaigns',
      onClick: () => scrollToSection('google-ads-campaign-overview'),
    },
  ]

  return (
    <Card className="p-4">
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Quick Actions</div>
      <div className="flex flex-col gap-2 mt-3">
        {actions.map((action) => {
          const Icon = action.icon
          const content = (
            <>
              <Icon className={`h-4 w-4 text-muted-foreground ${action.iconClassName || ''}`} />
              {action.label}
            </>
          )
          const className = "flex items-center gap-2.5 text-xs font-semibold text-foreground bg-muted/40 border rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/70"

          return action.href ? (
            <a key={action.key} href={action.href} target="_blank" rel="noreferrer" className={className}>
              {content}
            </a>
          ) : (
            <button key={action.key} type="button" onClick={action.onClick} className={className}>
              {content}
            </button>
          )
        })}
      </div>
    </Card>
  )
}
