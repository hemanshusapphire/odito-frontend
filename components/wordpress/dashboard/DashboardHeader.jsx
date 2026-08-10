"use client"

import { ExternalLink, RefreshCw, RotateCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { SITES, WP_VERSION } from '@/lib/wordpressDummyData'

/** Dashboard page header: title, website selector, WP version, Open WordPress/Sync/Refresh actions. */
export default function DashboardHeader({ siteId, onSiteChange, onSync, syncing, onRefresh, refreshing }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Select value={siteId} onValueChange={onSiteChange}>
            <SelectTrigger className="h-8 w-auto min-w-[180px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SITES.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">WordPress:</span>
          <Badge variant="outline" className="font-mono text-xs">{WP_VERSION}</Badge>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap justify-end">
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <a href="#" onClick={(e) => e.preventDefault()}>
            <ExternalLink className="h-4 w-4" />
            Open WordPress
          </a>
        </Button>
        <Button variant="outline" size="sm" onClick={onSync} disabled={syncing} className="gap-2">
          {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
          {syncing ? 'Syncing…' : 'Sync'}
        </Button>
        <Button size="sm" onClick={onRefresh} disabled={refreshing} className="gap-2">
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>
    </div>
  )
}
