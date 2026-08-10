"use client"

import { useParams, useRouter } from "next/navigation"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { AdminPagePlaceholder } from "@/components/system-admin/shared/AdminPagePlaceholder"
import { PaymentDetailCard } from "@/components/system-admin/cards/PaymentDetailCard"
import { PaymentCustomerCard } from "@/components/system-admin/cards/PaymentCustomerCard"
import { PaymentStripeCard } from "@/components/system-admin/cards/PaymentStripeCard"
import { PaymentInvoiceCard } from "@/components/system-admin/cards/PaymentInvoiceCard"
import { useSystemAdminPaymentDetail } from "@/hooks/system-admin/payments"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function SystemAdminPaymentDetailPage() {
  const { paymentId } = useParams()
  const router = useRouter()

  // useParams() returns this segment still percent-encoded (the same form
  // PaymentRow.jsx's encodeURIComponent(payment.id) produced for the Link
  // href) — decode it back to the raw "<source>:<objectId>" composite id
  // exactly once here, so apiService's own encodeURIComponent() (which
  // every other System Admin detail hook already relies on receiving a raw
  // id) encodes it exactly once, not twice.
  const rawPaymentId = paymentId ? decodeURIComponent(paymentId) : paymentId

  const { data: response, isLoading, isError, error, refetch } = useSystemAdminPaymentDetail(rawPaymentId)
  const payment = response?.data

  const breadcrumbs = [
    { label: "Payments", href: "/system-admin/payments" },
    { label: payment ? payment.id : "Loading..." },
  ]

  return (
    <>
      <AdminPagePlaceholder title="Payment" breadcrumbs={breadcrumbs}>
        <Button variant="outline" size="sm" onClick={() => router.push("/system-admin/payments")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back to Payments
        </Button>
      </AdminPagePlaceholder>

      {isLoading && <DetailSkeleton />}

      {isError && !isLoading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3">
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
          <p className="text-foreground font-medium">Couldn&apos;t load this payment</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || "Something went wrong while fetching this payment."}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && payment && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PaymentDetailCard payment={payment} />
          <PaymentCustomerCard customer={payment.customer} />
          <PaymentStripeCard stripe={payment.stripe} />
          <PaymentInvoiceCard invoice={payment.invoice} />
        </div>
      )}
    </>
  )
}
