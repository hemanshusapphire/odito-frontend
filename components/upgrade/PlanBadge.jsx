"use client"

import { Sparkles, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Small pill shown at the top of a PlanCard. Two kinds only — "popular"
 * (marketing emphasis) and "current" (the user's active plan) — kept as one
 * component with a `kind` prop rather than two near-identical files, since
 * they share every bit of layout/positioning, only color and icon differ.
 */
export default function PlanBadge({ kind = "popular", className }) {
  if (kind === "current") {
    return (
      <Badge
        variant="success"
        className={cn("absolute -top-3 left-1/2 -translate-x-1/2 gap-1 px-3 py-1 shadow-sm", className)}
      >
        <CheckCircle2 className="size-3" />
        Current Plan
      </Badge>
    )
  }

  return (
    <Badge
      className={cn(
        "absolute -top-3 left-1/2 -translate-x-1/2 gap-1 px-3 py-1 shadow-md",
        "bg-gradient-to-r from-primary to-secondary text-primary-foreground border-transparent",
        className
      )}
    >
      <Sparkles className="size-3" />
      Most Popular
    </Badge>
  )
}
