"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ArrowLeft, AlertTriangle, Clock } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useMyCustomPlanRequest, useSubmitCustomPlanRequest } from "@/hooks/useDashboardQueries"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Mirrors odito_backend/src/utils/customPlanRequestValidation.js's option
// lists exactly. The backend re-validates identically regardless (never
// trust client-side alone) — this is purely fast local feedback.
const TEAM_SIZE_OPTIONS = [
  { value: "1-10", label: "1-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-200", label: "51-200" },
  { value: "200+", label: "200+" },
]
const BUDGET_OPTIONS = [
  { value: "not_sure", label: "Not sure yet" },
  { value: "500_1000", label: "$500 - $1,000/mo" },
  { value: "1000_5000", label: "$1,000 - $5,000/mo" },
  { value: "5000_plus", label: "$5,000+/mo" },
]
const TIMELINE_OPTIONS = [
  { value: "immediately", label: "Immediately" },
  { value: "within_30_days", label: "Within 30 days" },
  { value: "exploring", label: "Just exploring" },
]
const FEATURE_OPTIONS = [
  { value: "white_label", label: "White-label reports" },
  { value: "api_access", label: "API access" },
  { value: "sso_saml", label: "SSO / SAML" },
  { value: "dedicated_account_manager", label: "Dedicated account manager" },
  { value: "custom_integrations", label: "Custom integrations" },
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URL_REGEX = /^https?:\/\/[^\s]+\.[^\s]+$/i

const ERROR_MESSAGES = {
  DUPLICATE_OPEN_REQUEST: (msg) => msg || "You already have an open custom plan request.",
}

function AuthCheckingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground">Checking authentication...</p>
      </div>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 skeleton-fade-in">
      <div className="h-8 w-64 skeleton-base skeleton-shimmer rounded" />
      <div className="rounded-2xl border border-border/50 p-6 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 skeleton-base skeleton-shimmer rounded" />
            <div className="h-9 w-full skeleton-base skeleton-shimmer rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

function validateClientSide(formData) {
  const errors = {}
  if (!formData.companyName.trim()) errors.companyName = "Company name is required."
  if (!formData.contactName.trim()) errors.contactName = "Contact name is required."
  if (!formData.contactEmail.trim()) {
    errors.contactEmail = "Email is required."
  } else if (!EMAIL_REGEX.test(formData.contactEmail.trim())) {
    errors.contactEmail = "Enter a valid email address."
  }
  if (formData.companyWebsite.trim() && !URL_REGEX.test(formData.companyWebsite.trim())) {
    errors.companyWebsite = "Enter a valid URL starting with http:// or https://."
  }
  if (!formData.teamSize) errors.teamSize = "Please select a team size."
  if (!formData.projectCount || Number(formData.projectCount) < 1) {
    errors.projectCount = "Enter at least 1 project."
  }
  return errors
}

/**
 * Single-page Custom Plan request form (per STEP 4 — explicitly not a
 * wizard). Status-aware: if the user already has a 'pending'/'contacted'
 * request, this shows a read-only status view instead of the form (a
 * second submission while one is open would just 409 — no point letting
 * the user fill out the form only to hit that at the end). 'closed'
 * requests don't block a new submission, matching the backend's own
 * OPEN_STATUSES check.
 *
 * Routing note: lives outside (dashboard) at /subscription/plans/custom for
 * the same reason ../page-content.jsx does — see that file's doc comment.
 */
export default function CustomPlanRequestPageContent() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, router])

  const { data: response, isLoading, isError, error, refetch } = useMyCustomPlanRequest()
  const submitMutation = useSubmitCustomPlanRequest()

  const [justSubmitted, setJustSubmitted] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState(null)

  const [formData, setFormData] = useState({
    companyName: "",
    companyWebsite: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    teamSize: "",
    projectCount: "",
    requiredCredits: "",
    requiredPages: "",
    featureRequirements: [],
    budgetRange: "",
    timeline: "",
    additionalRequirements: "",
  })

  // Prefill once the authenticated user is available — AuthContext loads
  // asynchronously, so this can't just be the useState initializer above.
  useEffect(() => {
    if (!user) return
    setFormData((prev) => ({
      ...prev,
      contactName: prev.contactName || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      contactEmail: prev.contactEmail || user.email || "",
    }))
  }, [user])

  const handleField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const toggleFeature = (value) => {
    setFormData((prev) => ({
      ...prev,
      featureRequirements: prev.featureRequirements.includes(value)
        ? prev.featureRequirements.filter((v) => v !== value)
        : [...prev.featureRequirements, value],
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = validateClientSide(formData)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setServerError(null)

    const payload = {
      ...formData,
      projectCount: Number(formData.projectCount),
      requiredCredits: formData.requiredCredits ? Number(formData.requiredCredits) : null,
      requiredPages: formData.requiredPages ? Number(formData.requiredPages) : null,
      companyWebsite: formData.companyWebsite.trim() || null,
      contactPhone: formData.contactPhone.trim() || null,
      budgetRange: formData.budgetRange || null,
      timeline: formData.timeline || null,
      additionalRequirements: formData.additionalRequirements.trim() || null,
    }

    submitMutation.mutate(payload, {
      onSuccess: () => setJustSubmitted(true),
      onError: (err) => {
        setServerError(ERROR_MESSAGES[err.code]?.(err.message) || err.message || "Failed to submit your request. Please try again.")
      },
    })
  }

  const existingRequest = response?.data ?? null
  const hasOpenRequest = existingRequest && ["pending", "contacted"].includes(existingRequest.status)

  if (authLoading || !isAuthenticated) {
    return <AuthCheckingState />
  }

  if (isLoading) {
    return <FormSkeleton />
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center space-y-3 px-4 py-8 sm:px-6 lg:px-8">
        <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
        <p className="font-medium text-foreground">Couldn&apos;t load this page</p>
        <p className="text-sm text-muted-foreground">{error?.message || "Something went wrong. Please try again."}</p>
        <button
          onClick={() => refetch()}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Try again
        </button>
      </div>
    )
  }

  // ── Success screen (STEP 5) — shown immediately after a successful
  //    submit in THIS session, no need to wait for a refetch round-trip. ──
  if (justSubmitted) {
    return (
      <div className="mx-auto max-w-lg text-center space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="size-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Request Submitted</h1>
          <p className="text-muted-foreground">
            We received your request. Our sales team will contact you within one business day.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="outline" onClick={() => router.push("/app/dashboard")}>
            Back to Dashboard
          </Button>
          <Button onClick={() => router.push("/app/settings/subscription")}>
            View Subscription
          </Button>
        </div>
      </div>
    )
  }

  // ── Read-only status view — an open request already exists ──
  if (hasOpenRequest) {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-500/10">
            <Clock className="size-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {existingRequest.status === "pending" ? "Request Pending" : "We're On It"}
          </h1>
          <p className="text-muted-foreground">
            {existingRequest.status === "pending"
              ? "We received your request and our sales team will reach out within one business day."
              : "Our sales team has your request and is in touch. No need to submit another."}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Request</CardTitle>
            <Badge variant={existingRequest.status === "pending" ? "warning" : "info"} className="w-fit">
              {existingRequest.status === "pending" ? "Pending" : "In Progress"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Company</span><span className="font-medium text-foreground">{existingRequest.companyName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Team size</span><span className="font-medium text-foreground">{existingRequest.teamSize}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Projects</span><span className="font-medium text-foreground">{existingRequest.projectCount}</span></div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => router.push("/subscription/plans")}>
            <ArrowLeft className="size-4" />
            Back to Plans
          </Button>
          <Button variant="outline" onClick={() => router.push("/app/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // ── The form ──
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Build Your Own Plan</h1>
        <p className="text-muted-foreground">Tell us what you need and our sales team will follow up with a custom quote.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Company &amp; Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="companyName">Company Name <span className="text-destructive">*</span></Label>
                <Input id="companyName" className="mt-2" value={formData.companyName} onChange={(e) => handleField("companyName", e.target.value)} disabled={submitMutation.isPending} />
                {fieldErrors.companyName && <p className="mt-1 text-xs text-destructive">{fieldErrors.companyName}</p>}
              </div>
              <div>
                <Label htmlFor="companyWebsite">Website</Label>
                <Input id="companyWebsite" type="url" placeholder="https://example.com" className="mt-2" value={formData.companyWebsite} onChange={(e) => handleField("companyWebsite", e.target.value)} disabled={submitMutation.isPending} />
                {fieldErrors.companyWebsite && <p className="mt-1 text-xs text-destructive">{fieldErrors.companyWebsite}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="contactName">Contact Name <span className="text-destructive">*</span></Label>
                <Input id="contactName" className="mt-2" value={formData.contactName} onChange={(e) => handleField("contactName", e.target.value)} disabled={submitMutation.isPending} />
                {fieldErrors.contactName && <p className="mt-1 text-xs text-destructive">{fieldErrors.contactName}</p>}
              </div>
              <div>
                <Label htmlFor="contactEmail">Email <span className="text-destructive">*</span></Label>
                <Input id="contactEmail" type="email" className="mt-2" value={formData.contactEmail} onChange={(e) => handleField("contactEmail", e.target.value)} disabled={submitMutation.isPending} />
                {fieldErrors.contactEmail && <p className="mt-1 text-xs text-destructive">{fieldErrors.contactEmail}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="contactPhone">Phone</Label>
                <Input id="contactPhone" type="tel" className="mt-2" value={formData.contactPhone} onChange={(e) => handleField("contactPhone", e.target.value)} disabled={submitMutation.isPending} />
              </div>
              <div>
                <Label htmlFor="teamSize">Team Size <span className="text-destructive">*</span></Label>
                <Select value={formData.teamSize} onValueChange={(v) => handleField("teamSize", v)} disabled={submitMutation.isPending}>
                  <SelectTrigger id="teamSize" className="mt-2">
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_SIZE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.teamSize && <p className="mt-1 text-xs text-destructive">{fieldErrors.teamSize}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="projectCount">Projects <span className="text-destructive">*</span></Label>
                <Input id="projectCount" type="number" min="1" className="mt-2" value={formData.projectCount} onChange={(e) => handleField("projectCount", e.target.value)} disabled={submitMutation.isPending} />
                {fieldErrors.projectCount && <p className="mt-1 text-xs text-destructive">{fieldErrors.projectCount}</p>}
              </div>
              <div>
                <Label htmlFor="requiredCredits">Required Credits</Label>
                <Input id="requiredCredits" type="number" min="0" className="mt-2" value={formData.requiredCredits} onChange={(e) => handleField("requiredCredits", e.target.value)} disabled={submitMutation.isPending} />
              </div>
              <div>
                <Label htmlFor="requiredPages">Required Pages</Label>
                <Input id="requiredPages" type="number" min="0" className="mt-2" value={formData.requiredPages} onChange={(e) => handleField("requiredPages", e.target.value)} disabled={submitMutation.isPending} />
              </div>
            </div>

            <div>
              <Label>Feature Requirements</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {FEATURE_OPTIONS.map((opt) => {
                  const active = formData.featureRequirements.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={submitMutation.isPending}
                      onClick={() => toggleFeature(opt.value)}
                      className={
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
                        (active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-muted")
                      }
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="budgetRange">Budget</Label>
                <Select value={formData.budgetRange} onValueChange={(v) => handleField("budgetRange", v)} disabled={submitMutation.isPending}>
                  <SelectTrigger id="budgetRange" className="mt-2">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Select value={formData.timeline} onValueChange={(v) => handleField("timeline", v)} disabled={submitMutation.isPending}>
                  <SelectTrigger id="timeline" className="mt-2">
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMELINE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="additionalRequirements">Additional Notes</Label>
              <Textarea
                id="additionalRequirements"
                rows={4}
                maxLength={2000}
                className="mt-2"
                placeholder="Anything else we should know?"
                value={formData.additionalRequirements}
                onChange={(e) => handleField("additionalRequirements", e.target.value)}
                disabled={submitMutation.isPending}
              />
            </div>
          </CardContent>

          {serverError && (
            <CardContent className="pt-0">
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {serverError}
              </div>
            </CardContent>
          )}

          <CardFooter className="flex justify-end gap-3 border-t border-border/60 pt-4">
            <Button type="button" variant="outline" disabled={submitMutation.isPending} onClick={() => router.push("/subscription/plans")}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
