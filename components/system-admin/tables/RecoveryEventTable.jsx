"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { RecoveryEventRow } from "./RecoveryEventRow"

const COLUMNS = ["Timestamp", "Reason", "Job Type", "Batch ID", "Actions"]

export function RecoveryEventTable({ events }) {
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <RecoveryEventRow key={event.id} event={event} />
          ))}
          {events.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-6">No recovery events recorded.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
