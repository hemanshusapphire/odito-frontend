"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DetailRow } from "../shared/DetailRow"

function formatUptime(seconds) {
  if (seconds == null) return "—"
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m ${seconds % 60}s`
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

function SchedulerStatus({ label, health }) {
  return (
    <DetailRow
      label={label}
      value={
        <div className="flex flex-col items-end gap-0.5">
          <Badge variant={health.enabled && health.running ? "success" : "critical"}>
            {health.enabled ? (health.running ? "Running" : "Not Running") : "Disabled"}
          </Badge>
          {health.lastRun && (
            <span className="text-xs text-muted-foreground">Last tick {formatDate(health.lastRun.at)}</span>
          )}
        </div>
      }
    />
  )
}

/**
 * ODITO-OPS-001 §4 — Worker Health. Node's own uptime/scheduler state is
 * real (getSchedulerHealth() reads live module state, unmodified by any
 * behavior change). Python has no persisted heartbeat — `apparentlyOnline`/
 * `isStale` are a heuristic derived from the most recent job claim, labeled
 * as such rather than presented as a certainty.
 */
export function WorkerHealthCard({ health }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Node</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailRow label="Process Uptime" value={formatUptime(health.node.uptimeSeconds)} />
          <SchedulerStatus label="Stale Lock Scheduler" health={health.node.staleLockScheduler} />
          <SchedulerStatus label="Batch Recovery Scheduler" health={health.node.verificationBatchRecoveryScheduler} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Python Workers</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailRow
            label="Status"
            value={
              <Badge variant={health.python.isStale ? "critical" : "success"}>
                {health.python.isStale ? "Stale / Possibly Offline" : "Online"}
              </Badge>
            }
          />
          <DetailRow label="Last Poll (heuristic)" value={formatDate(health.python.lastPollAt)} />
          <DetailRow label="Jobs Processed (24h)" value={health.python.jobsProcessedLast24h} />
          <DetailRow
            label="Avg Processing Time"
            value={health.python.averageProcessingMs != null ? `${Math.round(health.python.averageProcessingMs / 1000)}s` : "—"}
          />
        </CardContent>
      </Card>
    </div>
  )
}
