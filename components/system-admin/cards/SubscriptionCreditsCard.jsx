"use client"

import { UserCreditsCard } from "./UserCreditsCard"

/**
 * Identical needs to UserCreditsCard (Phase 2C) — same credits shape
 * ({limit,used,remaining}), same UsageCard underneath. Delegates instead of
 * re-implementing the usage bar a third time.
 */
export function SubscriptionCreditsCard({ credits }) {
  return <UserCreditsCard credits={credits} />
}
