"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Puzzle, Palette, RefreshCw, ArrowRight } from 'lucide-react'
import { PLUGIN_UPDATES, THEME_UPDATES_COUNT, WORDPRESS_UPDATES_COUNT } from '@/lib/wordpressDummyData'

const STAT_TABS = [
  { key: 'plugins', label: 'Plugins', value: PLUGIN_UPDATES.length, icon: Puzzle },
  { key: 'themes', label: 'Themes', value: THEME_UPDATES_COUNT, icon: Palette },
  { key: 'wordpress', label: 'WordPress', value: WORDPRESS_UPDATES_COUNT, icon: RefreshCw },
]

/** Updates: plugin/theme/WordPress counts + a plugin update table with bulk actions. */
export default function UpdatesCard({ onNotify }) {
  const [selected, setSelected] = useState([])

  function toggle(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  function toggleAll(checked) {
    setSelected(checked ? PLUGIN_UPDATES.map((p) => p.id) : [])
  }

  const allSelected = selected.length === PLUGIN_UPDATES.length
  const someSelected = selected.length > 0 && !allSelected

  return (
    <Card className="p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Updates</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {STAT_TABS.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.key} className="rounded-xl border bg-muted/30 px-4 py-3.5 flex flex-col items-center gap-1.5 text-center">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold tabular-nums font-mono">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          )
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={someSelected ? 'indeterminate' : allSelected} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>Plugin Name</TableHead>
              <TableHead>Current Version</TableHead>
              <TableHead>Latest Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PLUGIN_UPDATES.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggle(p.id)} />
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{p.currentVersion}</TableCell>
                <TableCell className="font-mono text-xs text-primary font-semibold">{p.latestVersion}</TableCell>
                <TableCell>
                  <Badge variant={p.severity === 'warning' ? 'warning' : 'info'} className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Update available
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-primary"
                    onClick={() => onNotify(`${p.name} updated to ${p.latestVersion}`, 'success')}
                  >
                    Update
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="text-xs text-muted-foreground">
          {selected.length > 0 ? `${selected.length} selected` : 'None selected'}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onNotify('Selected updates ignored')}>Ignore</Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={selected.length === 0}
            onClick={() => { onNotify(`${selected.length} plugin(s) updated`, 'success'); setSelected([]) }}
          >
            Update Selected
          </Button>
          <Button
            size="sm"
            onClick={() => { onNotify('All plugins updated', 'success'); setSelected([]) }}
          >
            Update All
          </Button>
        </div>
      </div>
    </Card>
  )
}
