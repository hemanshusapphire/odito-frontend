"use client"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "1", label: "System Admin" },
  { value: "2", label: "Super Admin" },
  { value: "3", label: "Admin" },
  { value: "4", label: "Agency Admin" },
  { value: "5", label: "User" },
]

const SUBSCRIPTION_STATUS_OPTIONS = [
  { value: "all", label: "All Subscriptions" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "canceled", label: "Canceled" },
  { value: "past_due", label: "Past Due" },
]

const EMAIL_VERIFIED_OPTIONS = [
  { value: "all", label: "All" },
  { value: "true", label: "Verified" },
  { value: "false", label: "Not Verified" },
]

const ACCOUNT_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "lastLogin", label: "Last Login" },
  { value: "name", label: "Name" },
  { value: "email", label: "Email" },
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
 * Role / Subscription Status / Email Verified / Account Status filters plus
 * Sort — one reusable <FilterSelect> internally, no per-filter JSX
 * duplication. `filters` and `onChange(key, value)` are fully controlled by
 * the parent page (single source of truth for the query params sent to
 * useSystemAdminUsers).
 */
export function UserFilters({ filters, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect
        label="Role"
        value={filters.role}
        options={ROLE_OPTIONS}
        onChange={(v) => onChange("role", v)}
      />
      <FilterSelect
        label="Subscription Status"
        value={filters.subscriptionStatus}
        options={SUBSCRIPTION_STATUS_OPTIONS}
        onChange={(v) => onChange("subscriptionStatus", v)}
      />
      <FilterSelect
        label="Email Verified"
        value={filters.emailVerified}
        options={EMAIL_VERIFIED_OPTIONS}
        onChange={(v) => onChange("emailVerified", v)}
      />
      <FilterSelect
        label="Account Status"
        value={filters.accountStatus}
        options={ACCOUNT_STATUS_OPTIONS}
        onChange={(v) => onChange("accountStatus", v)}
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
