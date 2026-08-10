"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table"
import { ProjectRow } from "./ProjectRow"

const COLUMNS = [
  "Project Name",
  "Owner",
  "Website",
  "Status",
  "Pages",
  "Audit Status",
  "Created Date",
  "Last Audit",
  "Actions",
]

export function ProjectTable({ projects, onStartAudit, onDelete }) {
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
            <ProjectRow key={project.id} project={project} onStartAudit={onStartAudit} onDelete={onDelete} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
