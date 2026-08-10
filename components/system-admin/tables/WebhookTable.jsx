"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table"
import { WebhookRow } from "./WebhookRow"

const COLUMNS = ["Event Type", "Status", "Stripe Event", "Created", "Actions"]

export function WebhookTable({ webhooks }) {
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {webhooks.map((webhook) => (
            <WebhookRow key={webhook.id} webhook={webhook} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
