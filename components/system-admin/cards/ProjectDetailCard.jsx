"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DetailRow } from "../shared/DetailRow"

const STATUS_VARIANT = { draft: "outline", active: "success", paused: "warning", error: "critical" }
const RUNNING_CRAWL_STATUSES = ["pending", "running", "discovered", "awaiting_url_selection", "crawled"]
const FAILED_CRAWL_STATUSES = ["failed", "cancelled"]

function crawlStatusVariant(crawlStatus) {
  if (crawlStatus === "completed") return "success"
  if (FAILED_CRAWL_STATUSES.includes(crawlStatus)) return "critical"
  if (RUNNING_CRAWL_STATUSES.includes(crawlStatus)) return "info"
  return "outline"
}

export function ProjectDetailCard({ project }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Project</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailRow label="Name" value={project.projectName} />
        <DetailRow
          label="Website"
          value={
            <a href={project.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {project.website}
            </a>
          }
        />
        <DetailRow label="Status" value={<Badge variant={STATUS_VARIANT[project.status] || "outline"} className="capitalize">{project.status}</Badge>} />
        <DetailRow
          label="Audit Status"
          value={
            <Badge variant={crawlStatusVariant(project.crawlStatus)} className="capitalize">
              {project.crawlStatus?.replace(/_/g, " ")}
            </Badge>
          }
        />
        <DetailRow label="Industry" value={project.industry} />
        <DetailRow label="Total Pages" value={project.totalPages} />
        <DetailRow label="Total Issues" value={project.totalIssues} />
      </CardContent>
    </Card>
  )
}
