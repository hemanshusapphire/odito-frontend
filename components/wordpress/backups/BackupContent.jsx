"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle } from 'lucide-react'
import { BACKUP_CONTENT } from '@/lib/wordpressBackupsDummyData'

/** Content tab: what's included in this backup, by component. */
export default function BackupContent() {
  const totalMb = BACKUP_CONTENT.filter((c) => c.included).reduce((sum, c) => sum + c.sizeMb, 0)

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Included</TableHead>
            <TableHead className="text-right">Size</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {BACKUP_CONTENT.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell>
                {row.included
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  : <XCircle className="h-4 w-4 text-muted-foreground/50" />}
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-muted-foreground">
                {row.included ? `${row.sizeMb} MB` : '—'}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant={row.included ? 'success' : 'secondary'} className="text-[10px]">
                  {row.included ? 'Included' : 'Excluded'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="text-xs text-muted-foreground text-right">
        Total included: <span className="font-mono font-semibold text-foreground">{(totalMb / 1024).toFixed(2)} GB</span>
      </div>
    </div>
  )
}
