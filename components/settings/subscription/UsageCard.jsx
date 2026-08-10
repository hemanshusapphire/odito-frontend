"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

/**
 * Generic usage card — reused for both Credits and Pages so the two
 * sections share one implementation instead of two near-identical cards.
 * `remaining`/`used`/`total` come straight from GET /subscription
 * (backend-calculated); the only math done here is the display percentage
 * for the progress bar, which the API doesn't return a value for.
 *
 * `actionLabel`/`onAction` are optional — when both are given, a single
 * primary Button renders in the footer (same Button/Card primitives every
 * other Subscription-page card already uses, just the "default"/filled
 * variant instead of PlanSummaryCard's "outline", to read as the stronger
 * of the two CTAs). Omitting them renders the card exactly as before.
 */
export default function UsageCard({ icon: Icon, title, description, remaining, used, total, actionLabel, onAction, actionIcon: ActionIcon }) {
  const percentUsed = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
  const isExhausted = remaining <= 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <span className={`text-3xl font-bold tabular-nums ${isExhausted ? "text-destructive" : "text-foreground"}`}>
            {remaining}
          </span>
          <span className="text-sm text-muted-foreground">remaining</span>
        </div>

        <Progress value={percentUsed} />

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{used} used</span>
          <span>{total} total</span>
        </div>
      </CardContent>

      {actionLabel && onAction && (
        <CardFooter className="border-t border-border/60 pt-4">
          <Button onClick={onAction} className="w-full gap-2">
            {ActionIcon && <ActionIcon className="h-4 w-4" />}
            {actionLabel}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
