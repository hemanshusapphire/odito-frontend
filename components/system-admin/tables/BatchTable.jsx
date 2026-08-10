"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table"
import { BatchRow } from "./BatchRow"

const COLUMNS = ["Batch ID", "Status", "Project", "User", "URLs", "Stage", "Duration", "Created", "Actions"]

export function BatchTable({ batches }) {
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
          {batches.map((batch) => (
            <BatchRow key={batch.batchId} batch={batch} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
