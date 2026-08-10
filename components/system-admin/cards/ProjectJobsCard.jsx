"use client"

import { Cpu } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatJobType } from "../filters/JobFilters"

const STATUS_VARIANT = {
  pending: "outline",
  claimed: "info",
  processing: "info",
  retrying: "warning",
  completed: "success",
  failed: "critical",
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

/**
 * Reuses Job as-is (systemAdminProjectService's recentJobs, last 5) — same
 * status badge/label conventions as JobRow.jsx, no duplicated table.
 */
export function ProjectJobsCard({ jobs }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cpu className="h-4 w-4 text-muted-foreground" />
          Recent Jobs
        </CardTitle>
        <CardDescription>The 5 most recent pipeline jobs for this project.</CardDescription>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <div className="rounded-xl border p-6 text-center">
            <p className="text-muted-foreground text-sm">No jobs yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{formatJobType(job.jobType)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(job.createdAt)}</p>
                </div>
                <Badge variant={STATUS_VARIANT[job.status] || "secondary"} className="capitalize">
                  {job.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
