"use client"

import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { SCHEDULING_HISTORY } from '@/lib/wordpressPluginsDummyData'

const STATUS_VARIANT = { Completed: 'success', Failed: 'critical', Cancelled: 'secondary', Running: 'info' }

function formatDuration(sec) {
  if (sec == null) return '—'
  return `${sec}s`
}

/** Scheduling History tab: past automatic/manual update runs. */
export default function SchedulingHistoryTable() {
  return (
    <Card className="p-6">
      <h3 className="text-sm font-semibold mb-4">Scheduling History</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Plugin</TableHead>
              <TableHead>Previous Version</TableHead>
              <TableHead>New Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Triggered By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SCHEDULING_HISTORY.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">{row.date}</TableCell>
                <TableCell className="font-medium">{row.plugin}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{row.previousVersion}</TableCell>
                <TableCell className="font-mono text-xs font-semibold text-primary">{row.newVersion}</TableCell>
                <TableCell><Badge variant={STATUS_VARIANT[row.status]} className="text-[10px]">{row.status}</Badge></TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{formatDuration(row.durationSec)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.triggeredBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
