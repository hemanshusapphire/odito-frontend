"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { DetailRow } from "../shared/DetailRow"

function idValue(id) {
  return id ? <span className="font-mono text-xs">{id}</span> : "—"
}

/**
 * Every value here is a plain Stripe reference id (cus_/sub_/cs_/pi_/in_) —
 * never a secret, client_secret, or API key. Nothing here is fetched live
 * from Stripe; these are the ids already stored on Transaction/PagePurchase/
 * CreditPurchase (see systemAdminPaymentService.normalizeDetailDoc).
 */
export function PaymentStripeCard({ stripe }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Stripe</CardTitle>
        <CardDescription>Display-safe reference ids only.</CardDescription>
      </CardHeader>
      <CardContent>
        <DetailRow label="Checkout Session" value={idValue(stripe.checkoutSessionId)} />
        <DetailRow label="Invoice" value={idValue(stripe.invoiceId)} />
        <DetailRow label="Payment Intent" value={idValue(stripe.paymentIntentId)} />
        <DetailRow label="Customer" value={idValue(stripe.customerId)} />
        <DetailRow label="Subscription" value={idValue(stripe.subscriptionId)} />
      </CardContent>
    </Card>
  )
}
