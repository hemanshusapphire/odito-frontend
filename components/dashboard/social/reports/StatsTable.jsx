"use client"

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import PlatformBadge from '../feeds/PlatformBadge'
import FeedPagination from '../feeds/FeedPagination'
import FilterBar from './FilterBar'
import EmptyReportState from './EmptyReportState'
import { STATS_ROWS } from '@/lib/socialReportsDummyData'

const PAGE_SIZE = 6

function dash(value, suffix = '') {
  return value == null ? '—' : `${value.toLocaleString()}${suffix}`
}

/** "Social Stats by Profile" - search/filter/sort toolbar + a hoverable, paginated table. */
export default function StatsTable({ onSync }) {
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('')
  const [sort, setSort] = useState('followers')
  const [page, setPage] = useState(1)

  const rows = useMemo(() => {
    let out = STATS_ROWS.filter((r) => {
      if (platform && r.platform.id !== platform) return false
      if (search && !r.profileName.toLowerCase().includes(search.toLowerCase()) && !r.platform.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    out = [...out].sort((a, b) => (b[sort] || 0) - (a[sort] || 0))
    return out
  }, [search, platform, sort])

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function updateFilter(setter, value) {
    setter(value)
    setPage(1)
  }

  return (
    <Card className="p-6 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold">Social Stats by Profile</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Followers, impressions and engagement per connected profile.</p>
      </div>

      <FilterBar
        search={search}
        onSearchChange={(v) => updateFilter(setSearch, v)}
        platform={platform}
        onPlatformChange={(v) => updateFilter(setPlatform, v)}
        sort={sort}
        onSortChange={setSort}
        onExport={() => {}}
      />

      {pageItems.length === 0 ? (
        <EmptyReportState onSync={onSync} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead className="text-right">Followers / Likes</TableHead>
                  <TableHead className="text-right">Followers Gained</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Messages Sent</TableHead>
                  <TableHead className="text-right">Total Engagement</TableHead>
                  <TableHead className="text-right">Engagement / Follower</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-semibold shrink-0">
                          {row.profileName.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                        </span>
                        <span className="font-medium truncate">{row.profileName}</span>
                      </div>
                    </TableCell>
                    <TableCell><PlatformBadge platform={row.platform} /></TableCell>
                    <TableCell className="text-right tabular-nums font-mono">{row.followers.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums font-mono text-muted-foreground">{dash(row.followersGained)}</TableCell>
                    <TableCell className="text-right tabular-nums font-mono">{row.impressions.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums font-mono text-muted-foreground">{dash(row.messagesSent)}</TableCell>
                    <TableCell className="text-right tabular-nums font-mono text-muted-foreground">{dash(row.totalEngagement)}</TableCell>
                    <TableCell className="text-right tabular-nums font-mono text-muted-foreground">{dash(row.engagementPerFollower, '%')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <FeedPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </Card>
  )
}
