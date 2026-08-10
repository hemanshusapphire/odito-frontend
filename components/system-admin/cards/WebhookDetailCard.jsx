"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DetailRow } from "../shared/DetailRow"

const STATUS_VARIANT = {
  processing: "info",
  completed: "success",
  failed: "critical",
  ignored: "outline",
}

function formatDate(value) {
  if (!value) return null
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function formatDuration(ms) {
  if (ms == null) return "—"
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export function WebhookDetailCard({ webhook }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Webhook Event</CardTitle>
      </CardHeader>
      <CardContent>
        <DetailRow label="Event" value={<span className="font-mono text-xs">{webhook.eventType}</span>} />
        <DetailRow
          label="Status"
          value={
            <Badge variant={STATUS_VARIANT[webhook.status] || "secondary"} className="capitalize">
              {webhook.status}
            </Badge>
          }
        />
        <DetailRow label="Stripe Event" value={<span className="font-mono text-xs">{webhook.stripeEventId}</span>} />
        <DetailRow label="Processing Time" value={formatDuration(webhook.processingTimeMs)} />
        {webhook.error && (
          <DetailRow label="Error" value={<span className="text-destructive text-sm">{webhook.error}</span>} />
        )}
        <DetailRow label="Created" value={formatDate(webhook.createdAt)} />
        <DetailRow label="Processed" value={formatDate(webhook.processedAt) || "—"} />
      </CardContent>
    </Card>
  )
}
