"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table"
import { QueueTypeRow } from "./QueueTypeRow"

const COLUMNS = ["Job Type", "Pending", "Processing", "Retrying", "Failed", "Completed", "Retries", "Oldest Pending", "Longest Processing", "Actions"]

export function QueueTable({ rows }) {
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
          {rows.map((row) => (
            <QueueTypeRow key={row.jobType} row={row} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
