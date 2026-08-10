"use client"

import { ShieldCheck } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"

function formatDate(value) {
  if (!value) return "Never"
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Account Information — read-only, entirely derived from AuthContext's
 * user (same object Personal Information reads/writes). No separate fetch.
 */
export default function AccountInformationCard() {
  const { user } = useAuth()

  const rows = [
    { label: "User ID", value: user?.id || "—" },
    { label: "Role", value: user?.roleName ? user.roleName.replace(/_/g, " ") : "—", capitalize: true },
    {
      label: "Email Verified",
      value: (
        <Badge variant={user?.isEmailVerified ? "success" : "warning"}>
          {user?.isEmailVerified ? "Verified" : "Not Verified"}
        </Badge>
      ),
    },
    {
      label: "Account Status",
      value: (
        <Badge variant={user?.isActive ? "success" : "critical"}>
          {user?.isActive ? "Active" : "Suspended"}
        </Badge>
      ),
    },
    { label: "Member Since", value: formatDate(user?.createdAt) },
    { label: "Last Login", value: formatDate(user?.lastLogin) },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          Account Information
        </CardTitle>
        <CardDescription>Read-only account details.</CardDescription>
      </CardHeader>

      <CardContent>
        <dl className="space-y-3 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className={`font-medium text-foreground ${row.capitalize ? "capitalize" : ""}`}>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
