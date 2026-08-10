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
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "ignored", label: "Ignored" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "status", label: "Status" },
  { value: "type", label: "Event Type" },
]

function FilterSelect({ label, value, options, onChange }) {
  return (
    <Select value={value || "all"} onValueChange={(v) => onChange(v === "all" ? "" : v)}>
      <SelectTrigger className="w-full sm:w-48" aria-label={label}>
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
 * `eventTypes` comes from the list endpoint's `filters.eventTypes`
 * (WebhookEvent.distinct('eventType') — no schema enum exists for this
 * field, so this is the only honest dynamic source; see
 * systemAdminOperationsService.js's listWebhooks).
 */
export function WebhookFilters({ filters, onChange, eventTypes = [] }) {
  const eventTypeOptions = [
    { value: "all", label: "All Event Types" },
    ...eventTypes.map((t) => ({ value: t, label: t })),
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
        label="Event Type"
        value={filters.eventType}
        options={eventTypeOptions}
        onChange={(v) => onChange("eventType", v)}
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
