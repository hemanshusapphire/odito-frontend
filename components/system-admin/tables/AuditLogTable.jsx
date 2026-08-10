"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table"
import { AuditLogRow } from "./AuditLogRow"

const COLUMNS = ["Action", "Admin", "Target User", "Reason", "Created", "Actions"]

export function AuditLogTable({ auditLogs }) {
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
          {auditLogs.map((log) => (
            <AuditLogRow key={log.id} log={log} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
