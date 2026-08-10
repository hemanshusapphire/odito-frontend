"use client"

import { ClipboardList } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

/**
 * Reuses AuditRun as-is (systemAdminProjectService's recentAudits, last 5)
 * — no new audit-history model or duplicated query.
 */
export function ProjectAuditsCard({ audits }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          Recent Audits
        </CardTitle>
        <CardDescription>The 5 most recent audit runs for this project.</CardDescription>
      </CardHeader>
      <CardContent>
        {audits.length === 0 ? (
          <div className="rounded-xl border p-6 text-center">
            <p className="text-muted-foreground text-sm">No audits yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {audits.map((audit) => (
              <div key={audit.id} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-foreground">Audit #{audit.auditNumber}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(audit.startedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {audit.websiteScore != null ? audit.websiteScore.toFixed(1) : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">{audit.totalIssues ?? 0} issues</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
