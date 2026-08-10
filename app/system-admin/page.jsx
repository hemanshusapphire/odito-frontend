"use client"

import {
  AlertTriangle,
  Users,
  UserCheck,
  BadgeCheck,
  CreditCard,
  DollarSign,
  FolderOpen,
  ClipboardList,
  Cpu,
  XCircle,
  Webhook,
} from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { SystemStatCard } from "@/components/system-admin/cards/SystemStatCard"
import { useSystemAdminDashboard } from "@/hooks/system-admin/dashboard"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function formatCurrency(amount) {
  return `$${(amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function SystemAdminDashboardPage() {
  const { data: response, isLoading, isError, error, refetch } = useSystemAdminDashboard()
  const stats = response?.data

  return (
    <>
      <AdminPagePlaceholder
        title="Dashboard"
        description="System-wide overview across users, subscriptions, revenue, and operations."
      />

      {isLoading && <DashboardSkeleton />}

      {isError && !isLoading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
          <p className="text-foreground font-medium">Couldn&apos;t load dashboard statistics</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || "Something went wrong while fetching System Admin statistics."}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <SystemStatCard icon={Users} label="Total Users" value={stats.users.total} tone="blue" />
          <SystemStatCard icon={UserCheck} label="Active Users" value={stats.users.active} tone="cyan" />
          <SystemStatCard icon={BadgeCheck} label="Verified Users" value={stats.users.verified} tone="emerald" />
          <SystemStatCard icon={CreditCard} label="Active Subscriptions" value={stats.subscriptions.active} tone="violet" />
          <SystemStatCard icon={DollarSign} label="Revenue" value={formatCurrency(stats.revenue.total)} tone="green" />
          <SystemStatCard icon={FolderOpen} label="Projects" value={stats.projects.total} tone="orange" />
          <SystemStatCard icon={ClipboardList} label="Audits" value={stats.audits.total} tone="amber" />
          <SystemStatCard icon={Cpu} label="Running Jobs" value={stats.jobs.running} tone="blue" />
          <SystemStatCard icon={XCircle} label="Failed Jobs" value={stats.jobs.failed} tone="red" />
          <SystemStatCard
            icon={Webhook}
            label="Webhook Health"
            value={stats.webhooks.completed}
            tone="emerald"
            breakdown={[
              { label: "Pending", value: stats.webhooks.pending },
              { label: "Failed", value: stats.webhooks.failed },
              { label: "Ignored", value: stats.webhooks.ignored },
            ]}
          />
        </div>
      )}
    </>
  )
}
