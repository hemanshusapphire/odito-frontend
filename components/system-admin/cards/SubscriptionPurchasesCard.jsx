"use client"

import { UserRecentBillingCard } from "./UserRecentBillingCard"

const SUBSCRIPTION_TRANSACTION_TYPES = ["checkout", "renewal"]

/**
 * Merges the 3 backend-separated lists (recentTransactions filtered to
 * subscription payments, recentAdditionalCredits, recentAdditionalPages)
 * into the one flat shape UserRecentBillingCard (Phase 2C) already renders
 * — the exact same in-memory merge-then-sort pattern
 * getBillingHistory/getUserDetail already use, just done once here instead
 * of a second backend query. No new table JSX.
 */
export function SubscriptionPurchasesCard({ transactions, additionalCredits, additionalPages }) {
  const subscriptionPurchases = (transactions || [])
    .filter((t) => SUBSCRIPTION_TRANSACTION_TYPES.includes(t.type))
    .map((t) => ({ id: t.id, date: t.date, amount: t.amount, currency: t.currency, type: t.type, status: t.status }))

  const creditRecords = (additionalCredits || []).map((c) => ({
    id: c.id,
    date: c.date,
    amount: c.amount,
    currency: c.currency,
    type: "credit_pack",
    status: c.status,
  }))

  const pageRecords = (additionalPages || []).map((p) => ({
    id: p.id,
    date: p.date,
    amount: p.amount,
    currency: p.currency,
    type: "page_pack",
    status: p.status,
  }))

  const records = [...subscriptionPurchases, ...creditRecords, ...pageRecords]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)

  return (
    <UserRecentBillingCard
      records={records}
      title="Purchases"
      description="Recent subscription payments, additional credits, and additional pages."
    />
  )
}
