"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table"
import { DeletedProjectRow } from "./DeletedProjectRow"

const COLUMNS = ["Project Name", "Owner", "Deleted At", "Deleted By", "Scheduled Purge", "Actions"]

export function DeletedProjectTable({ projects, onRestore, onPermanentDelete }) {
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
          {projects.map((project) => (
            <DeletedProjectRow
              key={project.id}
              project={project}
              onRestore={onRestore}
              onPermanentDelete={onPermanentDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
