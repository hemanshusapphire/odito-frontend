"use client"

import { History, StickyNote, RefreshCw, PlusCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

const TYPE_ICON = {
  created: PlusCircle,
  status_change: RefreshCw,
  note: StickyNote,
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    })
  } catch {
    return value
  }
}

/**
 * STEP 7 — Created / status changes / internal notes, merged into one
 * newest-first timeline (see systemAdminCustomPlanRequestService.js's
 * getCustomPlanRequestDetail, which builds `timelineEvents` server-side —
 * this component only renders, same "backend labels, frontend displays"
 * split SubscriptionTimelineCard.jsx already establishes for Transaction
 * events). Doubles as the internal-notes review surface — a note's full
 * text renders inline here rather than in a separate, redundant card.
 */
export function CustomPlanRequestTimelineCard({ events }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-4 w-4 text-muted-foreground" />
          Timeline
        </CardTitle>
        <CardDescription>Created, status changes, and internal notes — newest first.</CardDescription>
      </CardHeader>
      <CardContent>
        {(!events || events.length === 0) ? (
          <div className="rounded-xl border p-6 text-center">
            <p className="text-muted-foreground text-sm">No activity yet.</p>
          </div>
        ) : (
          <ol className="border-l border-border/60 pl-5">
            {events.map((event, i) => {
              const Icon = TYPE_ICON[event.type] || History
              return (
                <li key={i} className="relative pb-5 last:pb-0">
                  <span className="absolute -left-[21px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{event.label}</span>
                  </div>
                  {event.note && (
                    <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">{event.note}</p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(event.date)}
                    {event.by && ` · ${event.by.name}`}
                  </p>
                </li>
              )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
