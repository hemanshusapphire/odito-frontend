"use client"

import { CalendarCheck2, Ban, CheckCircle2, CreditCard, Coins } from "lucide-react"
import { SystemStatCard } from "./SystemStatCard"

export function AuditSummaryCard({ summary }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <SystemStatCard icon={CalendarCheck2} label="Today's Actions" value={summary.todayActions} tone="blue" />
      <SystemStatCard icon={Ban} label="Suspensions" value={summary.suspensions} tone="red" />
      <SystemStatCard icon={CheckCircle2} label="Activations" value={summary.activations} tone="emerald" />
      <SystemStatCard icon={CreditCard} label="Plan Changes" value={summary.planChanges} tone="violet" />
      <SystemStatCard icon={Coins} label="Quota Changes" value={summary.quotaChanges} tone="cyan" />
    </div>
  )
}
