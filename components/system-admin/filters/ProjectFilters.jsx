"use client"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

// Real SeoProject.status enum only — draft/active/paused/error.
const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "error", label: "Error" },
]

// Real User.subscription.status enum (no schema enum exists for it on
// SeoProject — this filters by the PROJECT'S OWNER's subscription).
const SUBSCRIPTION_OPTIONS = [
  { value: "all", label: "All Subscriptions" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "canceled", label: "Canceled" },
  { value: "past_due", label: "Past Due" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name" },
  { value: "lastAudit", label: "Last Audit" },
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
 * Status / Industry / Subscription filters plus Sort. `industries` comes
 * from the list endpoint's `filters.industries` (SeoProject.industry has
 * no schema enum, so distinct values from real data is the only honest
 * dynamic source).
 */
export function ProjectFilters({ filters, onChange, industries = [] }) {
  const industryOptions = [
    { value: "all", label: "All Industries" },
    ...industries.map((i) => ({ value: i, label: i })),
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect
        label="Status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(v) => onChange("status", v)}
      />
      <FilterSelect
        label="Industry"
        value={filters.industry}
        options={industryOptions}
        onChange={(v) => onChange("industry", v)}
      />
      <FilterSelect
        label="Subscription"
        value={filters.subscriptionStatus}
        options={SUBSCRIPTION_OPTIONS}
        onChange={(v) => onChange("subscriptionStatus", v)}
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
