"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table"
import { JobRow } from "./JobRow"

const COLUMNS = ["Type", "Status", "Project", "User", "Attempts", "Created", "Actions"]

export function JobTable({ jobs }) {
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
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
