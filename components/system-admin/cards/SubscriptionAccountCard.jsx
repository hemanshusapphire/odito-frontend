"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DetailRow } from "../shared/DetailRow"

const ROLE_LABELS = {
  1: "System Admin",
  2: "Super Admin",
  3: "Admin",
  4: "Agency Admin",
  5: "User",
}

export function SubscriptionAccountCard({ account }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Account</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailRow label="Name" value={`${account.firstName} ${account.lastName}`.trim()} />
        <DetailRow label="Email" value={account.email} />
        <DetailRow label="Role" value={ROLE_LABELS[account.roleId] || "User"} />
      </CardContent>
    </Card>
  )
}
