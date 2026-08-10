"use client"

import Link from "next/link"
import { Eye } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const STATUS_VARIANT = {
  pending: "warning",
  contacted: "info",
  closed: "outline",
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function CustomPlanRequestRow({ request }) {
  return (
    <TableRow>
      <TableCell>
        <Badge variant={STATUS_VARIANT[request.status] || "outline"} className="capitalize">
          {request.status}
        </Badge>
      </TableCell>
      <TableCell className="font-medium text-foreground">{request.companyName}</TableCell>
      <TableCell className="text-muted-foreground">{request.contactName}</TableCell>
      <TableCell className="text-muted-foreground">{request.contactEmail}</TableCell>
      <TableCell className="tabular-nums text-muted-foreground">{request.projectCount ?? "—"}</TableCell>
      <TableCell className="tabular-nums text-muted-foreground">{request.requiredCredits ?? "—"}</TableCell>
      <TableCell className="tabular-nums text-muted-foreground">{request.requiredPages ?? "—"}</TableCell>
      <TableCell className="text-muted-foreground">{formatDate(request.createdAt)}</TableCell>
      <TableCell>
        <Button asChild variant="ghost" size="icon" className="h-8 w-8" aria-label="View request">
          <Link href={`/system-admin/custom-plan-requests/${request.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}
