"use client"

import { Building2, ClipboardList } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DetailRow } from "@/components/system-admin/shared/DetailRow"

const FEATURE_LABELS = {
  white_label: "White-label reports",
  api_access: "API access",
  sso_saml: "SSO / SAML",
  dedicated_account_manager: "Dedicated account manager",
  custom_integrations: "Custom integrations",
}

const BUDGET_LABELS = {
  not_sure: "Not sure yet",
  "500_1000": "$500 - $1,000/mo",
  "1000_5000": "$1,000 - $5,000/mo",
  "5000_plus": "$5,000+/mo",
}

const TIMELINE_LABELS = {
  immediately: "Immediately",
  within_30_days: "Within 30 days",
  exploring: "Just exploring",
}

/**
 * Company & Contact info — the first of two detail cards, mirroring the
 * customer-facing form's own two-section split (Company & Contact /
 * Requirements) so an admin reading this recognizes the same grouping the
 * customer filled out.
 */
export function CustomPlanRequestCompanyCard({ request }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          Company &amp; Contact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DetailRow label="Company" value={request.companyName} />
        <DetailRow
          label="Website"
          value={request.companyWebsite ? (
            <a href={request.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {request.companyWebsite}
            </a>
          ) : null}
        />
        <DetailRow label="Contact" value={request.contactName} />
        <DetailRow
          label="Email"
          value={<a href={`mailto:${request.contactEmail}`} className="text-primary hover:underline">{request.contactEmail}</a>}
        />
        <DetailRow label="Phone" value={request.contactPhone} />
        <DetailRow label="Team Size" value={request.teamSize} />
      </CardContent>
    </Card>
  )
}

/**
 * Requirements — the second detail card.
 */
export function CustomPlanRequestRequirementsCard({ request }) {
  const features = (request.featureRequirements || []).map((f) => FEATURE_LABELS[f] || f).join(", ") || null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          Requirements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DetailRow label="Projects" value={request.projectCount} />
        <DetailRow label="Required Credits" value={request.requiredCredits} />
        <DetailRow label="Required Pages" value={request.requiredPages} />
        <DetailRow label="Feature Requirements" value={features} />
        <DetailRow label="Budget" value={BUDGET_LABELS[request.budgetRange] || null} />
        <DetailRow label="Timeline" value={TIMELINE_LABELS[request.timeline] || null} />
        {request.additionalRequirements && (
          <div className="pt-3">
            <p className="text-xs text-muted-foreground mb-1">Additional Notes</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{request.additionalRequirements}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
