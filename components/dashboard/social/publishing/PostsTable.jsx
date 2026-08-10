"use client"

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Search, MoreVertical, Pencil, Copy, Trash2, FileText } from 'lucide-react'
import StatusBadge from './StatusBadge'
import FeedPagination from '../feeds/FeedPagination'
import { PUBLISHING_POSTS, PUBLISHING_PLATFORMS, PUBLISHING_STATUSES } from '@/lib/publishingDummyData'

const ALL = '__all__'
const PAGE_SIZE = 8

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

/** Modern posts table: search + platform/status filters + pagination. */
export default function PostsTable({ onEdit, onDuplicate, onDelete }) {
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return PUBLISHING_POSTS.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
      if (platform && p.platform !== platform) return false
      if (status && p.status !== status) return false
      return true
    }).sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))
  }, [search, platform, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function updateFilter(setter, value) {
    setter(value)
    setPage(1)
  }

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => updateFilter(setSearch, e.target.value)} placeholder="Search posts..." className="pl-9 h-9 text-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={platform || ALL} onValueChange={(v) => updateFilter(setPlatform, v === ALL ? '' : v)}>
            <SelectTrigger className="h-9 w-auto min-w-[130px] text-xs"><SelectValue placeholder="Platform" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Platform</SelectItem>
              {PUBLISHING_PLATFORMS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status || ALL} onValueChange={(v) => updateFilter(setStatus, v === ALL ? '' : v)}>
            <SelectTrigger className="h-9 w-auto min-w-[130px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Status</SelectItem>
              {PUBLISHING_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        {pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-14">
            <FileText className="h-8 w-8 opacity-40" />
            <p className="text-sm">No posts match your filters.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Preview</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Caption</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((post) => {
                const p = PUBLISHING_PLATFORMS.find((pl) => pl.id === post.platform)
                const Icon = p.icon
                return (
                  <TableRow key={post.id}>
                    <TableCell>
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${p.color}18`, color: p.color }}>
                        <Icon className="h-4 w-4" />
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.name}</TableCell>
                    <TableCell className="max-w-xs truncate font-medium">{post.title}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap text-xs">{formatDateTime(post.scheduledAt)}</TableCell>
                    <TableCell><StatusBadge status={post.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{post.author}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(post)} className="gap-2"><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDuplicate(post)} className="gap-2"><Copy className="h-4 w-4" />Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onDelete(post)} variant="destructive" className="gap-2"><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <FeedPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </Card>
  )
}
