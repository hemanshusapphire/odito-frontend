"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DetailRow } from "../shared/DetailRow"
import { formatAuditAction } from "../filters/AuditFilters"

function formatDate(value) {
  if (!value) return null
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function userLink(user) {
  if (!user) return "—"
  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
  return (
    <Link href={`/system-admin/users/${user.id}`} className="text-primary hover:underline">
      {name}
    </Link>
  )
}

function jsonBlock(value) {
  if (value == null) return <span className="text-muted-foreground">—</span>
  return (
    <pre className="max-w-full overflow-x-auto rounded-md bg-muted p-3 text-xs text-foreground">
      {JSON.stringify(value, null, 2)}
    </pre>
  )
}

export function AuditDetailCard({ log }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Audit Log Entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <DetailRow label="Action" value={<Badge variant="outline">{formatAuditAction(log.action)}</Badge>} />
          <DetailRow label="Admin" value={userLink(log.admin)} />
          <DetailRow label="Target User" value={userLink(log.targetUser)} />
          <DetailRow label="Reason" value={log.reason || "—"} />
          <DetailRow label="Timestamp" value={formatDate(log.createdAt)} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-sm font-medium text-muted-foreground">Before</p>
            {jsonBlock(log.before)}
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-muted-foreground">After</p>
            {jsonBlock(log.after)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
