"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table"
import { CustomPlanRequestRow } from "./CustomPlanRequestRow"

const COLUMNS = [
  "Status",
  "Company",
  "Contact",
  "Email",
  "Projects",
  "Credits",
  "Pages",
  "Submitted",
  "Actions",
]

export function CustomPlanRequestTable({ requests }) {
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
          {requests.map((request) => (
            <CustomPlanRequestRow key={request.id} request={request} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
