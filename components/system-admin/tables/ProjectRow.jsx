"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreVertical, Eye, Cpu, Play, Trash2 } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

const STATUS_VARIANT = {
  draft: "outline",
  active: "success",
  paused: "warning",
  error: "critical",
}

const RUNNING_CRAWL_STATUSES = ["pending", "running", "discovered", "awaiting_url_selection", "crawled"]
const FAILED_CRAWL_STATUSES = ["failed", "cancelled"]

function crawlStatusVariant(crawlStatus) {
  if (crawlStatus === "completed") return "success"
  if (FAILED_CRAWL_STATUSES.includes(crawlStatus)) return "critical"
  if (RUNNING_CRAWL_STATUSES.includes(crawlStatus)) return "info"
  return "outline"
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function ProjectRow({ project, onStartAudit, onDelete }) {
  const router = useRouter()
  const ownerLabel = project.owner
    ? `${project.owner.firstName || ""} ${project.owner.lastName || ""}`.trim() || project.owner.email
    : "—"

  return (
    <TableRow>
      <TableCell className="font-medium text-foreground truncate max-w-48">{project.projectName}</TableCell>
      <TableCell className="text-muted-foreground truncate max-w-40">{ownerLabel}</TableCell>
      <TableCell className="text-muted-foreground truncate max-w-48">
        <a href={project.website} target="_blank" rel="noopener noreferrer" className="hover:text-foreground hover:underline">
          {project.website}
        </a>
      </TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[project.status] || "outline"} className="capitalize">
          {project.status}
        </Badge>
      </TableCell>
      <TableCell className="tabular-nums text-muted-foreground">{project.totalPages}</TableCell>
      <TableCell>
        <Badge variant={crawlStatusVariant(project.crawlStatus)} className="capitalize">
          {project.crawlStatus?.replace(/_/g, " ")}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">{formatDate(project.createdAt)}</TableCell>
      <TableCell className="text-muted-foreground">{formatDate(project.lastAudit?.startedAt)}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Project actions">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/system-admin/projects/${project.id}`} className="flex items-center gap-2 cursor-pointer">
                <Eye className="h-4 w-4" />
                View Project
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/system-admin/jobs?search=${encodeURIComponent(project.projectName)}`)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Cpu className="h-4 w-4" />
              View Jobs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStartAudit(project)} className="flex items-center gap-2 cursor-pointer">
              <Play className="h-4 w-4" />
              Start Audit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(project)}
              className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
