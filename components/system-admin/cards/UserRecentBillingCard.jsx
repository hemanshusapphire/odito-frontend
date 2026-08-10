"use client"

import { Receipt } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

// Same label/variant maps BillingHistoryCard.jsx uses (private to that
// file) — duplicated here as the small per-file lookup this codebase
// already does elsewhere (e.g. SUBSCRIPTION_STATUSES in User.js vs.
// adminSubscriptionController.js) rather than exporting an unrelated
// component's internal constants.
const TYPE_LABEL = {
  checkout: "Subscription",
  renewal: "Renewal",
  payment_failed: "Payment Failed",
  cancelled: "Cancelled",
  resumed: "Resumed",
  refunded: "Refunded",
  upgraded: "Upgraded",
  downgraded: "Downgraded",
  page_pack: "Additional Pages",
  credit_pack: "Additional Credits",
}

const STATUS_VARIANT = {
  succeeded: "success",
  failed: "critical",
  canceled: "warning",
  paid: "success",
  refunded: "secondary",
}

function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  } catch {
    return dateString
  }
}

function formatAmount(amountInSmallestUnit) {
  if (amountInSmallestUnit == null) return "—"
  return (amountInSmallestUnit / 100).toFixed(2)
}

/**
 * Last 5 billing records only — read-only, no invoice links, no
 * pagination. Payment management (refunds, invoice access, etc.) is
 * explicitly out of scope for this phase.
 */
export function UserRecentBillingCard({
  records,
  title = "Recent Billing",
  description = "The 5 most recent payment events on this account.",
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="rounded-xl border p-6 text-center">
            <p className="text-muted-foreground text-sm">No billing history yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(record.date)}</TableCell>
                  <TableCell className="tabular-nums">{formatAmount(record.amount)}</TableCell>
                  <TableCell className="uppercase text-muted-foreground">{record.currency || "—"}</TableCell>
                  <TableCell>{TYPE_LABEL[record.type] || record.type}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[record.status] || "secondary"} className="capitalize">
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
