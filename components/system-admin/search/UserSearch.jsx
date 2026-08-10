"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

/**
 * Debounced search box — no existing useDebounce hook in this codebase
 * (confirmed by audit), so the 300ms debounce lives inline here rather than
 * introducing a new generic hook for a single call site.
 */
export function UserSearch({ value, onChange, placeholder = "Search by name or email..." }) {
  const [draft, setDraft] = useState(value || "")

  useEffect(() => {
    setDraft(value || "")
  }, [value])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (draft !== value) onChange(draft)
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  )
}
