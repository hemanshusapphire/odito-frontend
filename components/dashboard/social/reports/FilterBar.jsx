"use client"

import { Search, Download } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { REPORT_PLATFORMS } from '@/lib/socialReportsDummyData'

const ALL = '__all__'

const SORT_OPTIONS = [
  { value: 'followers', label: 'Followers / Likes' },
  { value: 'impressions', label: 'Impressions' },
  { value: 'engagement', label: 'Total Engagement' },
]

/** Search + platform filter + sort + export toolbar above the Social Stats table. */
export default function FilterBar({ search, onSearchChange, platform, onPlatformChange, sort, onSortChange, onExport }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search profiles..." className="pl-9 h-9 text-sm" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={platform || ALL} onValueChange={(v) => onPlatformChange(v === ALL ? '' : v)}>
          <SelectTrigger className="h-9 w-auto min-w-[130px] text-xs"><SelectValue placeholder="Platform" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Platform</SelectItem>
            {REPORT_PLATFORMS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="h-9 w-auto min-w-[150px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  )
}
