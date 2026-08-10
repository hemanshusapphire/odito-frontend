"use client"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

// Real CustomPlanRequest.status enum only (see the model file) — no
// fabricated 'negotiating'/'approved' options, since Phase 5 deliberately
// kept the enum to the three states the spec's CTA logic actually branches
// on.
const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
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

export function CustomPlanRequestFilters({ filters, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect
        label="Status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(v) => onChange("status", v)}
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
