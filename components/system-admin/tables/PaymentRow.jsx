"use client"

import Link from "next/link"
import { Eye, ExternalLink, Download } from "lucide-react"
import { TableRow, TableCell } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const TYPE_LABEL = {
  subscription: "Subscription",
  additional_credits: "Additional Credits",
  additional_pages: "Additional Pages",
}

const STATUS_VARIANT = {
  paid: "success",
  pending: "warning",
  failed: "critical",
  refunded: "secondary",
  canceled: "outline",
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

function formatAmount(cents) {
  if (cents == null) return "—"
  return (cents / 100).toFixed(2)
}

export function PaymentRow({ payment }) {
  const user = payment.user
  const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "—" : "Unknown user"
  const initials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U"
    : "?"

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar} alt={fullName} />
            <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{fullName}</p>
            {user?.email && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{TYPE_LABEL[payment.paymentType] || payment.paymentType}</Badge>
      </TableCell>
      <TableCell className="tabular-nums">{formatAmount(payment.amount)}</TableCell>
      <TableCell className="uppercase text-muted-foreground">{payment.currency || "—"}</TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[payment.status] || "secondary"} className="capitalize">
          {payment.status}
        </Badge>
      </TableCell>
      <TableCell>
        {payment.hostedInvoiceUrl || payment.invoicePdfUrl ? (
          <div className="flex flex-col gap-0.5 text-xs">
            {payment.hostedInvoiceUrl && (
              <a
                href={payment.hostedInvoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                View Invoice <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {payment.invoicePdfUrl && (
              <a
                href={payment.invoicePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
              >
                Download PDF <Download className="h-3 w-3" />
              </a>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground">{formatDate(payment.createdAt)}</TableCell>
      <TableCell>
        <Button asChild variant="ghost" size="icon" className="h-8 w-8" aria-label="View payment">
          <Link href={`/system-admin/payments/${encodeURIComponent(payment.id)}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  )
}
