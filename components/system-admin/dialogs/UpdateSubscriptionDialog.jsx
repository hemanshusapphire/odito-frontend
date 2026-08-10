"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { usePlans } from "@/hooks/useDashboardQueries"
import {
  useAdminAssignPlan,
  useAdminAdjustQuota,
  useAdminUpdateSubscriptionStatus,
} from "@/hooks/system-admin/subscriptions"

const STATUS_OPTIONS = ["inactive", "active", "paused", "canceled", "past_due"]

/**
 * One dialog, three tabs — each tab is a thin form in front of one of the
 * three EXISTING admin subscription-override endpoints (adminAssignPlan/
 * adminAdjustQuota/adminUpdateStatus). No new backend logic; this is purely
 * the first UI ever built for those three actions.
 *
 * `target` is a normalized shape both SubscriptionRow and the detail page
 * pass in: { userId, plan: {id,name}|null, status, credits:{limit},
 * pages:{limit} }.
 */
export function UpdateSubscriptionDialog({ target, open, onOpenChange, onSuccess }) {
  const { data: plansResponse } = usePlans()
  const plans = plansResponse?.data || []

  const [planId, setPlanId] = useState("")
  const [credits, setCredits] = useState("")
  const [pages, setPages] = useState("")
  const [status, setStatus] = useState("")
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (!target) return
    setPlanId(target.plan?.id || "")
    setCredits(target.credits?.limit ?? 0)
    setPages(target.pages?.limit ?? 0)
    setStatus(target.status || "")
    setReason("")
  }, [target])

  const assignPlan = useAdminAssignPlan()
  const adjustQuota = useAdminAdjustQuota()
  const updateStatus = useAdminUpdateSubscriptionStatus()

  if (!target) return null

  const handleAssignPlan = () => {
    if (!planId) return
    assignPlan.mutate({ userId: target.userId, planId, reason: reason.trim() || undefined })
  }

  const handleAdjustQuota = () => {
    adjustQuota.mutate({
      userId: target.userId,
      credits: Number(credits),
      pages: Number(pages),
      reason: reason.trim() || undefined,
    })
  }

  const handleUpdateStatus = () => {
    if (!status) return
    updateStatus.mutate({ userId: target.userId, status, reason: reason.trim() || undefined })
  }

  const handleSuccessfulChange = () => {
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Subscription</DialogTitle>
          <DialogDescription>
            Support/correction tool — does not call Stripe. Every change is recorded in the audit log.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="plan">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plan">Plan</TabsTrigger>
            <TabsTrigger value="quota">Quota</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={planId} onValueChange={setPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ReasonField reason={reason} setReason={setReason} />
            <MutationFeedback mutation={assignPlan} />
            <Button onClick={handleAssignPlan} disabled={assignPlan.isPending || !planId} className="w-full">
              {assignPlan.isPending ? "Assigning..." : "Assign Plan"}
            </Button>
          </TabsContent>

          <TabsContent value="quota" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Credits Limit</Label>
                <Input type="number" min={0} value={credits} onChange={(e) => setCredits(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Pages Limit</Label>
                <Input type="number" min={0} value={pages} onChange={(e) => setPages(e.target.value)} />
              </div>
            </div>
            <ReasonField reason={reason} setReason={setReason} />
            <MutationFeedback mutation={adjustQuota} />
            <Button onClick={handleAdjustQuota} disabled={adjustQuota.isPending} className="w-full">
              {adjustQuota.isPending ? "Adjusting..." : "Adjust Quota"}
            </Button>
          </TabsContent>

          <TabsContent value="status" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Subscription Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ReasonField reason={reason} setReason={setReason} />
            <MutationFeedback mutation={updateStatus} />
            <Button onClick={handleUpdateStatus} disabled={updateStatus.isPending || !status} className="w-full">
              {updateStatus.isPending ? "Updating..." : "Update Status"}
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => { handleSuccessfulChange(); onOpenChange(false) }}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReasonField({ reason, setReason }) {
  return (
    <div className="space-y-2">
      <Label>Reason (optional)</Label>
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Recorded in the audit log"
        className="text-sm"
      />
    </div>
  )
}

function MutationFeedback({ mutation }) {
  if (mutation.isSuccess) {
    return <p className="text-sm text-emerald-500">Change saved.</p>
  }
  if (mutation.isError) {
    return <p className="text-sm text-destructive">{mutation.error?.message || "Something went wrong."}</p>
  }
  return null
}
