"use client"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "claimed", label: "Claimed" },
  { value: "processing", label: "Processing" },
  { value: "retrying", label: "Retrying" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "status", label: "Status" },
  { value: "type", label: "Type" },
]

export function formatJobType(type) {
  return type ? type.replace(/_/g, " ") : ""
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
 * Status is a fixed, small, real enum (6 values, same ones Step 4 lists) so
 * it's declared here directly — job types are NOT (`jobTypes` prop comes
 * from the list endpoint's `filters.jobTypes`, sourced from the Job
 * schema's own enum, never re-declared here).
 */
export function JobFilters({ filters, onChange, jobTypes = [] }) {
  const jobTypeOptions = [
    { value: "all", label: "All Types" },
    ...jobTypes.map((t) => ({ value: t, label: formatJobType(t) })),
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
        label="Job Type"
        value={filters.jobType}
        options={jobTypeOptions}
        onChange={(v) => onChange("jobType", v)}
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
