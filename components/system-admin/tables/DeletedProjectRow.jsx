"use client"

import Link from "next/link"
import { MoreVertical, Eye, RotateCcw, Trash2 } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

function userLabel(user) {
  if (!user) return "—"
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
}

export function DeletedProjectRow({ project, onRestore, onPermanentDelete }) {
  return (
    <TableRow>
      <TableCell className="font-medium text-foreground truncate max-w-48">{project.projectName}</TableCell>
      <TableCell className="text-muted-foreground truncate max-w-40">{userLabel(project.owner)}</TableCell>
      <TableCell className="text-muted-foreground">{formatDate(project.deletedAt)}</TableCell>
      <TableCell className="text-muted-foreground truncate max-w-40">{userLabel(project.deletedBy)}</TableCell>
      <TableCell className="text-muted-foreground">{formatDate(project.scheduledPurgeAt)}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Deleted project actions">
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
            <DropdownMenuItem onClick={() => onRestore(project)} className="flex items-center gap-2 cursor-pointer">
              <RotateCcw className="h-4 w-4" />
              Restore
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onPermanentDelete(project)}
              className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete Permanently
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
