"use client"

import { FileText } from "lucide-react"
import UsageCard from "@/components/settings/subscription/UsageCard"

/**
 * Thin wrapper around the existing UsageCard — see UserCreditsCard.jsx for
 * why this delegates instead of re-implementing the usage bar.
 */
export function UserPagesCard({ pages }) {
  return (
    <UsageCard
      icon={FileText}
      title="Pages"
      description="Pages are used when URLs are approved for crawling."
      remaining={pages?.remaining ?? 0}
      used={pages?.used ?? 0}
      total={pages?.limit ?? 0}
    />
  )
}
