"use client"

import Link from "next/link"
import { Eye } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatAuditAction } from "../filters/AuditFilters"

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

function userLabel(user) {
  if (!user) return "—"
  return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
}

export function AuditLogRow({ log }) {
  return (
    <TableRow>
      <TableCell>
        <Badge variant="outline">{formatAuditAction(log.action)}</Badge>
      </TableCell>
      <TableCell className="text-muted-foreground truncate max-w-40">{userLabel(log.admin)}</TableCell>
      <TableCell className="text-muted-foreground truncate max-w-40">{userLabel(log.targetUser)}</TableCell>
      <TableCell className="text-muted-foreground truncate max-w-56">{log.reason || "—"}</TableCell>
      <TableCell className="text-muted-foreground">{formatDate(log.createdAt)}</TableCell>
      <TableCell>
        <Button asChild variant="ghost" size="icon" className="h-8 w-8" aria-label="View audit log entry">
          <Link href={`/system-admin/audit-logs/${log.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}
