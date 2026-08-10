"use client"

import { FileText, ExternalLink, Download } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DetailRow } from "../shared/DetailRow"

function invoiceLink(url, label, Icon) {
  if (!url) return "—"
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary hover:underline"
    >
      {label} <Icon className="h-3.5 w-3.5" />
    </a>
  )
}

/**
 * Same Stripe-hosted invoice URLs BillingHistoryCard.jsx already links to —
 * no PDF is ever generated here, no invoice data is fabricated. `hostedInvoiceUrl`
 * and `invoicePdfUrl` come straight from the source document (set by the
 * existing webhook handlers' fetchInvoiceUrls() call — unchanged by this
 * phase).
 */
export function PaymentInvoiceCard({ invoice }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Invoice
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DetailRow label="Hosted Invoice" value={invoiceLink(invoice.hostedInvoiceUrl, "View Invoice", ExternalLink)} />
        <DetailRow label="Invoice PDF" value={invoiceLink(invoice.invoicePdfUrl, "Download PDF", Download)} />
      </CardContent>
    </Card>
  )
}
