"use client"

import Link from "next/link"
import { Eye, Ban, CheckCircle2 } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const ROLE_LABELS = {
  1: "System Admin",
  2: "Super Admin",
  3: "Admin",
  4: "Agency Admin",
  5: "User",
}

const SUBSCRIPTION_BADGE_VARIANT = {
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

/**
 * One table row. Suspend/Activate are surfaced here as buttons but the
 * confirmation dialogs themselves live once at the page level (not per-row)
 * — `onSuspend`/`onActivate` just tell the parent which user to open the
 * shared dialog for.
 */
export function UserRow({ user, onSuspend, onActivate }) {
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "—"
  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U"

  return (
    <TableRow>
      <TableCell>
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.avatar} alt={fullName} />
          <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell className="font-medium text-foreground">{fullName}</TableCell>
      <TableCell className="text-muted-foreground">{user.email}</TableCell>
      <TableCell>
        <Badge variant={user.roleId <= 3 ? "info" : "outline"}>
          {ROLE_LABELS[user.roleId] || "User"}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={SUBSCRIPTION_BADGE_VARIANT[user.subscription?.status] || "outline"}>
          {user.subscription?.plan || "No plan"}
        </Badge>
      </TableCell>
      <TableCell className="tabular-nums text-muted-foreground">
        {user.credits?.remaining ?? 0}/{user.credits?.limit ?? 0}
      </TableCell>
      <TableCell className="tabular-nums text-muted-foreground">
        {user.pages?.remaining ?? 0}/{user.pages?.limit ?? 0}
      </TableCell>
      <TableCell>
        <Badge variant={user.isEmailVerified ? "success" : "warning"}>
          {user.isEmailVerified ? "Verified" : "Unverified"}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={user.isActive ? "success" : "critical"}>
          {user.isActive ? "Active" : "Suspended"}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
      <TableCell className="text-muted-foreground">{formatDate(user.lastLogin)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8" aria-label="View user">
            <Link href={`/system-admin/users/${user.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {user.isActive ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              aria-label="Suspend user"
              onClick={() => onSuspend(user)}
            >
              <Ban className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-emerald-500 hover:text-emerald-500"
              aria-label="Activate user"
              onClick={() => onActivate(user)}
            >
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
