"use client"

import { FileText, ExternalLink, AlertTriangle } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { useBillingHistory } from "@/hooks/useDashboardQueries"

const TYPE_LABEL = {
  checkout: "Subscription",
  renewal: "Renewal",
  payment_failed: "Payment Failed",
  cancelled: "Cancelled",
  resumed: "Resumed",
  refunded: "Refunded",
  // One-time "Buy More Pages" purchases (Phase 16) — a new, additive event
  // type merged in from the PagePurchase collection alongside subscription
  // Transactions; see subscriptionController.js's getBillingHistory().
  page_pack: "Additional Pages",
  // One-time "Buy Credits" purchases (Phase 17) — same pattern, merged in
  // from the CreditPurchase collection.
  credit_pack: "Additional Credits",
}

const STATUS_VARIANT = {
  succeeded: "success",
  failed: "critical",
  canceled: "warning",
  // PagePurchase's own status vocabulary (paid/failed/refunded) — passed
  // through as-is rather than remapped onto Transaction's succeeded/
  // failed/canceled, so both sources can share this same lookup.
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

// Stripe amounts are always the currency's smallest unit (cents) — this
// view shows the plain decimal number; the adjacent Currency column
// carries the code, per the row layout Billing History was asked to show.
function formatAmount(amountInSmallestUnit) {
  if (amountInSmallestUnit == null) return "—"
  return (amountInSmallestUnit / 100).toFixed(2)
}

function BillingHistorySkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-full h-10 skeleton-base skeleton-shimmer rounded" />
      ))}
    </div>
  )
}

/**
 * Billing History — newest first, read-only. Every value comes straight
 * from GET /subscription/history; no Stripe id is ever present in the
 * response this renders (the backend already strips them — see
 * subscriptionController.js serializeTransaction()). No pagination
 * controls yet (single page, newest N rows) — the API and query hook are
 * already page-aware, so adding controls later needs no new fetch logic.
 */
export default function BillingHistoryCard() {
  const { data: response, isLoading, isError, error, refetch } = useBillingHistory()
  const transactions = response?.data?.transactions || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Billing History
        </CardTitle>
        <CardDescription>A record of checkouts, renewals, and payment events on your account.</CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading && <BillingHistorySkeleton />}

        {isError && !isLoading && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
            <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
            <p className="text-foreground font-medium">Couldn&apos;t load billing history</p>
            <p className="text-sm text-muted-foreground">
              {error?.message || "Something went wrong while fetching your billing history."}
            </p>
            <button
              onClick={() => refetch()}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && transactions.length === 0 && (
          <div className="rounded-xl border p-8 text-center space-y-2">
            <p className="text-muted-foreground">No billing history yet.</p>
          </div>
        )}

        {!isLoading && !isError && transactions.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(transaction.date)}</TableCell>
                  <TableCell className="tabular-nums">{formatAmount(transaction.amount)}</TableCell>
                  <TableCell className="uppercase text-muted-foreground">{transaction.currency || "—"}</TableCell>
                  <TableCell>
                    {TYPE_LABEL[transaction.type] || transaction.type}
                    {transaction.pagesPurchased != null && (
                      <div className="text-xs text-muted-foreground">
                        Purchased +{transaction.pagesPurchased} Pages
                      </div>
                    )}
                    {transaction.creditsPurchased != null && (
                      <div className="text-xs text-muted-foreground">
                        Purchased +{transaction.creditsPurchased} Credits
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[transaction.status] || "secondary"} className="capitalize">
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {transaction.invoiceUrl ? (
                      <a
                        href={transaction.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        View Invoice <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
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
