"use client"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "status", label: "Status" },
]

export function formatBatchStatus(status) {
  if (!status) return ""
  return status.charAt(0).toUpperCase() + status.slice(1)
}

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
 * ODITO-OPS-001 — statuses come from the list endpoint's own
 * `filters.statuses` (VerificationBatch's schema enum, via
 * BATCH_STATUSES) — same "don't hardcode, read from the backend enum"
 * convention JobFilters already establishes for job types.
 */
export function BatchFilters({ filters, onChange, statuses = [] }) {
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    ...statuses.map((s) => ({ value: s, label: formatBatchStatus(s) })),
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect label="Status" value={filters.status} options={statusOptions} onChange={(v) => onChange("status", v)} />
      <FilterSelect label="Sort" value={filters.sort || "newest"} options={SORT_OPTIONS} onChange={(v) => onChange("sort", v || "newest")} />
      <label className="flex items-center gap-2 text-sm text-muted-foreground pl-1">
        <Checkbox
          checked={!!filters.stuckOnly}
          onCheckedChange={(checked) => onChange("stuckOnly", checked ? "true" : "")}
        />
        Stuck only
      </label>
    </div>
  )
}
