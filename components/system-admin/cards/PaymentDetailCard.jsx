"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DetailRow } from "../shared/DetailRow"

const TYPE_LABEL = {
  subscription: "Subscription",
  additional_credits: "Additional Credits",
  additional_pages: "Additional Pages",
}

const STATUS_VARIANT = {
  paid: "success",
  pending: "warning",
  failed: "critical",
  refunded: "secondary",
  canceled: "outline",
}

function formatAmount(cents) {
  if (cents == null) return "—"
  return (cents / 100).toFixed(2)
}

export function PaymentDetailCard({ payment }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailRow label="Amount" value={formatAmount(payment.amount)} />
        <DetailRow label="Currency" value={payment.currency?.toUpperCase()} />
        <DetailRow
          label="Status"
          value={
            <Badge variant={STATUS_VARIANT[payment.status] || "secondary"} className="capitalize">
              {payment.status}
            </Badge>
          }
        />
        <DetailRow label="Type" value={TYPE_LABEL[payment.paymentType] || payment.paymentType} />
      </CardContent>
    </Card>
  )
}
