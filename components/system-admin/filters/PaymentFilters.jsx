"use client"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const PAYMENT_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "subscription", label: "Subscription" },
  { value: "additional_credits", label: "Additional Credits" },
  { value: "additional_pages", label: "Additional Pages" },
]

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
  { value: "canceled", label: "Canceled" },
]

const INVOICE_OPTIONS = [
  { value: "all", label: "All Invoices" },
  { value: "available", label: "Available" },
  { value: "unavailable", label: "Unavailable" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "amount", label: "Amount" },
  { value: "status", label: "Status" },
  { value: "type", label: "Type" },
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
 * Payment Type / Status / Invoice / Currency filters plus Sort. `currencies`
 * is NOT hardcoded — it's the distinct-currency list the list endpoint
 * itself returns (`response.data.filters.currencies`, computed by the same
 * aggregation as the rows), passed down by the page.
 */
export function PaymentFilters({ filters, onChange, currencies = [] }) {
  const currencyOptions = [
    { value: "all", label: "All Currencies" },
    ...currencies.map((c) => ({ value: c, label: c.toUpperCase() })),
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect
        label="Payment Type"
        value={filters.paymentType}
        options={PAYMENT_TYPE_OPTIONS}
        onChange={(v) => onChange("paymentType", v)}
      />
      <FilterSelect
        label="Status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(v) => onChange("status", v)}
      />
      <FilterSelect
        label="Invoice"
        value={filters.invoice}
        options={INVOICE_OPTIONS}
        onChange={(v) => onChange("invoice", v)}
      />
      <FilterSelect
        label="Currency"
        value={filters.currency}
        options={currencyOptions}
        onChange={(v) => onChange("currency", v)}
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
