"use client"

import { DollarSign, CreditCard, Coins, FileText, Clock, XCircle } from "lucide-react"
import { SystemStatCard } from "./SystemStatCard"

function formatCurrency(amount) {
  return `$${(amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * The 6 summary tiles shown above the payments table. Reuses the exact
 * same <SystemStatCard> the Dashboard (Phase 2B) already built for its
 * 10 stat cards — no new tile JSX, just a grid composing it 6 times from
 * one already-fetched summary object (useSystemAdminPaymentsSummary — a
 * single aggregation, computed once, never re-derived here).
 */
export function PaymentSummaryCard({ summary }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <SystemStatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(summary.totalRevenue)} tone="green" />
      <SystemStatCard icon={CreditCard} label="Subscriptions" value={formatCurrency(summary.subscriptionRevenue)} tone="blue" />
      <SystemStatCard icon={Coins} label="Additional Credits" value={formatCurrency(summary.additionalCreditsRevenue)} tone="violet" />
      <SystemStatCard icon={FileText} label="Additional Pages" value={formatCurrency(summary.additionalPagesRevenue)} tone="cyan" />
      <SystemStatCard icon={Clock} label="Pending Payments" value={summary.pendingPayments} tone="amber" />
      <SystemStatCard icon={XCircle} label="Failed Payments" value={summary.failedPayments} tone="red" />
    </div>
  )
}
