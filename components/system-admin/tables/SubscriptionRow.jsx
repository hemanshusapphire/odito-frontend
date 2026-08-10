"use client"

import Link from "next/link"
import { Eye, Settings2 } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const STATUS_VARIANT = {
  active: "success",
  past_due: "warning",
  paused: "warning",
  canceled: "critical",
  inactive: "outline",
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

function truncateId(id) {
  if (!id) return "—"
  return id.length > 14 ? `${id.slice(0, 14)}…` : id
}

export function SubscriptionRow({ subscription, onManage }) {
  const fullName = `${subscription.firstName || ""} ${subscription.lastName || ""}`.trim() || "—"
  const initials = `${subscription.firstName?.charAt(0) || ""}${subscription.lastName?.charAt(0) || ""}`.toUpperCase() || "U"

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={subscription.avatar} alt={fullName} />
            <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{subscription.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{subscription.plan?.name || "No plan"}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[subscription.status] || "outline"} className="capitalize">
          {subscription.status}
        </Badge>
      </TableCell>
      <TableCell className="tabular-nums text-muted-foreground">
        {subscription.credits?.remaining ?? 0}/{subscription.credits?.limit ?? 0}
      </TableCell>
      <TableCell className="tabular-nums text-muted-foreground">
        {subscription.pages?.remaining ?? 0}/{subscription.pages?.limit ?? 0}
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">
        {truncateId(subscription.stripeCustomerId)}
      </TableCell>
      <TableCell className="font-mono text-xs text-muted-foreground">
        {truncateId(subscription.stripeSubscriptionId)}
      </TableCell>
      <TableCell>
        {subscription.autoRenews ? (
          <Badge variant="success">Auto-renews</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">{formatDate(subscription.createdAt)}</TableCell>
      <TableCell className="text-muted-foreground">{formatDate(subscription.updatedAt)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8" aria-label="View subscription">
            <Link href={`/system-admin/subscriptions/${subscription.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Manage subscription"
            onClick={() => onManage(subscription)}
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
