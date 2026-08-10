"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function ProjectStatisticsCard({ statistics }) {
  const jobTotal = Object.values(statistics.jobs || {}).reduce((sum, n) => sum + n, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Statistics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{statistics.auditCount}</p>
          <p className="text-xs text-muted-foreground">Audits</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{jobTotal}</p>
          <p className="text-xs text-muted-foreground">Jobs</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{statistics.jobs?.completed ?? 0}</p>
          <p className="text-xs text-muted-foreground">Jobs Completed</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{statistics.jobs?.failed ?? 0}</p>
          <p className="text-xs text-muted-foreground">Jobs Failed</p>
        </div>
      </CardContent>
    </Card>
  )
}
