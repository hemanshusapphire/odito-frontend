"use client"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { usePlans } from "@/hooks/useDashboardQueries"

// Real subscription.status enum only (see User.js) — no fabricated 'trial'
// option, since this schema has none.
const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "canceled", label: "Canceled" },
  { value: "past_due", label: "Past Due" },
]

const YES_NO_OPTIONS = [
  { value: "all", label: "All" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "plan", label: "Plan" },
  { value: "status", label: "Status" },
  { value: "updated", label: "Updated" },
  { value: "renewal", label: "Renewal" },
]

function FilterSelect({ label, value, options, onChange }) {
  return (
    <Select value={value || "all"} onValueChange={(v) => onChange(v === "all" ? "" : v)}>
      <SelectTrigger className="w-full sm:w-44" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * Plan / Status / Has Stripe Customer / Has Subscription filters plus Sort.
 * Plan options come from the existing usePlans() hook (GET /plans) instead
 * of a hardcoded list — only 'Starter' exists today, and this stays correct
 * automatically if Pro/Premium are ever added to config/plans.js.
 */
export function SubscriptionFilters({ filters, onChange }) {
  const { data: plansResponse } = usePlans()
  const plans = plansResponse?.data || []
  const planOptions = [
    { value: "all", label: "All Plans" },
    ...plans.map((plan) => ({ value: plan.id, label: plan.name })),
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect
        label="Plan"
        value={filters.plan}
        options={planOptions}
        onChange={(v) => onChange("plan", v)}
      />
      <FilterSelect
        label="Status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(v) => onChange("status", v)}
      />
      <FilterSelect
        label="Has Stripe Customer"
        value={filters.hasStripeCustomer}
        options={YES_NO_OPTIONS}
        onChange={(v) => onChange("hasStripeCustomer", v)}
      />
      <FilterSelect
        label="Has Subscription"
        value={filters.hasSubscription}
        options={YES_NO_OPTIONS}
        onChange={(v) => onChange("hasSubscription", v)}
      />
      <FilterSelect
        label="Sort"
        value={filters.sort || "newest"}
        options={SORT_OPTIONS}
        onChange={(v) => onChange("sort", v || "newest")}
      />
    </div>
  )
}
