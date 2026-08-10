"use client"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
]

export function formatAuditAction(action) {
  if (!action) return ""
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

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
 * `actions` comes from SystemAdminAuditLog's own schema enum (filters.actions) —
 * `admins` comes from admins who actually have log entries (filters.admins,
 * grouped in the same aggregation as the list itself). Neither is
 * hardcoded here.
 */
export function AuditFilters({ filters, onChange, actions = [], admins = [] }) {
  const actionOptions = [
    { value: "all", label: "All Actions" },
    ...actions.map((a) => ({ value: a, label: formatAuditAction(a) })),
  ]
  const adminOptions = [
    { value: "all", label: "All Admins" },
    ...admins.map((a) => ({ value: a.id, label: a.name })),
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect
        label="Action"
        value={filters.action}
        options={actionOptions}
        onChange={(v) => onChange("action", v)}
      />
      <FilterSelect
        label="Admin"
        value={filters.admin}
        options={adminOptions}
        onChange={(v) => onChange("admin", v)}
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
