"use client"

import { Search, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ROLES } from '@/lib/wordpressUsersDummyData'

const ALL = '__all__'

/** Role filter + search, plus a "showing X / Y users, Load All" info banner. */
export default function UsersToolbar({ role, onRoleChange, search, onSearchChange, visibleCount, totalCount, onLoadAll }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Select value={role || ALL} onValueChange={(v) => onRoleChange(v === ALL ? '' : v)}>
          <SelectTrigger className="h-9 w-auto min-w-[150px] text-xs">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Roles</SelectItem>
            {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search users..." className="pl-9 h-9 text-sm" />
        </div>
      </div>

      {visibleCount < totalCount && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-2.5">
          <span className="inline-flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Currently showing {visibleCount} / {totalCount} users.
          </span>
          <Button size="sm" variant="secondary" onClick={onLoadAll}>Load All Users</Button>
        </div>
      )}
    </div>
  )
}
