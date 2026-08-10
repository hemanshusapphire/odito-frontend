"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DetailRow } from "../shared/DetailRow"

const ROLE_LABELS = {
  1: "System Admin",
  2: "Super Admin",
  3: "Admin",
  4: "Agency Admin",
  5: "User",
}

function formatDateTime(value) {
  if (!value) return null
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function UserAccountCard({ user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Account</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailRow label="Name" value={`${user.firstName} ${user.lastName}`.trim()} />
        <DetailRow label="Email" value={user.email} />
        <DetailRow label="Role" value={ROLE_LABELS[user.roleId] || "User"} />
        <DetailRow label="Created" value={formatDateTime(user.createdAt)} />
        <DetailRow label="Last Login" value={formatDateTime(user.lastLogin) || "Never"} />
        <DetailRow
          label="Email Verified"
          value={
            <Badge variant={user.isEmailVerified ? "success" : "warning"}>
              {user.isEmailVerified ? "Verified" : "Unverified"}
            </Badge>
          }
        />
        <DetailRow
          label="Status"
          value={
            <Badge variant={user.isActive ? "success" : "critical"}>
              {user.isActive ? "Active" : "Suspended"}
            </Badge>
          }
        />
      </CardContent>
    </Card>
  )
}
