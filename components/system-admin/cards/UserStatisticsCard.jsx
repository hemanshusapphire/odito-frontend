"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function UserStatisticsCard({ statistics }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Statistics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{statistics.projectCount}</p>
          <p className="text-xs text-muted-foreground">Projects</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{statistics.auditCount}</p>
          <p className="text-xs text-muted-foreground">Audits</p>
        </div>
      </CardContent>
    </Card>
  )
}
