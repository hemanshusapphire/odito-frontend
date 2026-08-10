"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table"
import { SubscriptionRow } from "./SubscriptionRow"

const COLUMNS = [
  "User",
  "Plan",
  "Subscription Status",
  "Credits",
  "Pages",
  "Stripe Customer",
  "Stripe Subscription",
  "Renewal",
  "Created",
  "Updated",
  "Actions",
]

export function SubscriptionTable({ subscriptions, onManage }) {
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <SubscriptionRow key={subscription.id} subscription={subscription} onManage={onManage} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
