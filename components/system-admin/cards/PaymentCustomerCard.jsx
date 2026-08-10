"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DetailRow } from "../shared/DetailRow"

export function PaymentCustomerCard({ customer }) {
  if (!customer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">This user no longer exists.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Customer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <DetailRow label="Name" value={`${customer.firstName} ${customer.lastName}`.trim()} />
          <DetailRow label="Email" value={customer.email} />
        </div>
        <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
          <Link href={`/system-admin/subscriptions/${customer.id}`}>
            View Subscription
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
