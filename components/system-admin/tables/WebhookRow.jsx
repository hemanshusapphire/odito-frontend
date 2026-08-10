"use client"

import Link from "next/link"
import { Eye } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const STATUS_VARIANT = {
  processing: "info",
  completed: "success",
  failed: "critical",
  ignored: "outline",
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function WebhookRow({ webhook }) {
  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{webhook.eventType}</TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[webhook.status] || "secondary"} className="capitalize">
          {webhook.status}
        </Badge>
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-48">{webhook.stripeEventId}</TableCell>
      <TableCell className="text-muted-foreground">{formatDate(webhook.createdAt)}</TableCell>
      <TableCell>
        <Button asChild variant="ghost" size="icon" className="h-8 w-8" aria-label="View webhook event">
          <Link href={`/system-admin/webhooks/${webhook.id}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}
