"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DetailRow } from "../shared/DetailRow"

const STATUS_VARIANT = { active: "success", past_due: "warning", paused: "warning", canceled: "critical", inactive: "outline" }

export function ProjectOwnerCard({ owner }) {
  if (!owner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Owner</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">This project's owner no longer exists.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Owner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <DetailRow label="Name" value={`${owner.firstName} ${owner.lastName}`.trim()} />
          <DetailRow label="Email" value={owner.email} />
          <DetailRow
            label="Subscription"
            value={
              <Badge variant={STATUS_VARIANT[owner.subscriptionStatus] || "outline"} className="capitalize">
                {owner.subscriptionStatus || "—"}
              </Badge>
            }
          />
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1 gap-1.5">
            <Link href={`/system-admin/users/${owner.id}`}>
              View User
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1 gap-1.5">
            <Link href={`/system-admin/subscriptions/${owner.id}`}>
              View Subscription
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
