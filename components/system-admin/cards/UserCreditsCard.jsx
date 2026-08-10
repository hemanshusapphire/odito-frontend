"use client"

import { Coins } from "lucide-react"
import UsageCard from "@/components/settings/subscription/UsageCard"

/**
 * Thin wrapper around the existing UsageCard (used on the user-facing
 * Settings > Subscription page) — no new usage-bar JSX, read-only (no
 * action button) since quota modification is out of scope for this phase.
 */
export function UserCreditsCard({ credits }) {
  return (
    <UsageCard
      icon={Coins}
      title="Credits"
      description="1 credit is used each time a project is created."
      remaining={credits?.remaining ?? 0}
      used={credits?.used ?? 0}
      total={credits?.limit ?? 0}
    />
  )
}
