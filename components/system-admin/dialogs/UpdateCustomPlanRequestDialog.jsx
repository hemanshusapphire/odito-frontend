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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  useUpdateCustomPlanRequest,
  useAddCustomPlanRequestNote,
} from "@/hooks/system-admin/customPlanRequests"

const STATUS_OPTIONS = ["pending", "contacted", "closed"]

/**
 * One dialog, two tabs — each a thin form in front of one of the two
 * EXISTING admin write endpoints (updateCustomPlanRequestStatus/
 * addCustomPlanRequestNote). No new backend logic. Mirrors
 * UpdateSubscriptionDialog.jsx's tabbed structure (Plan/Quota/Status there,
 * Status/Note here) for a consistent System Admin editing pattern.
 *
 * `target` = { id, status } — both SubscriptionRow-style callers (the list
 * table, if it ever gets a quick-action button) and the detail page pass
 * this same shape.
 */
export function UpdateCustomPlanRequestDialog({ target, open, onOpenChange, onSuccess }) {
  const [status, setStatus] = useState("")
  const [note, setNote] = useState("")

  useEffect(() => {
    if (!target) return
    setStatus(target.status || "")
    setNote("")
  }, [target])

  const updateStatus = useUpdateCustomPlanRequest()
  const addNote = useAddCustomPlanRequestNote()

  if (!target) return null

  const handleUpdateStatus = () => {
    if (!status) return
    updateStatus.mutate({ id: target.id, status })
  }

  const handleAddNote = () => {
    const trimmed = note.trim()
    if (!trimmed) return
    addNote.mutate({ id: target.id, note: trimmed }, {
      onSuccess: () => setNote(""),
    })
  }

  const handleClose = () => {
    onSuccess?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Request</DialogTitle>
          <DialogDescription>
            Internal only — customers never see status changes or notes made here.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="status">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="note">Add Note</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Request Status</Label>
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
            <MutationFeedback mutation={updateStatus} successLabel="Status updated." />
            <Button onClick={handleUpdateStatus} disabled={updateStatus.isPending || !status} className="w-full">
              {updateStatus.isPending ? "Updating..." : "Update Status"}
            </Button>
          </TabsContent>

          <TabsContent value="note" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Internal Note</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Called customer, waiting for reply, needs Enterprise SSO..."
                maxLength={2000}
                rows={4}
                disabled={addNote.isPending}
              />
            </div>
            <MutationFeedback mutation={addNote} successLabel="Note added." />
            <Button onClick={handleAddNote} disabled={addNote.isPending || !note.trim()} className="w-full">
              {addNote.isPending ? "Adding..." : "Add Note"}
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MutationFeedback({ mutation, successLabel }) {
  if (mutation.isSuccess) {
    return <p className="text-sm text-emerald-500">{successLabel}</p>
  }
  if (mutation.isError) {
    return <p className="text-sm text-destructive">{mutation.error?.message || "Something went wrong."}</p>
  }
  return null
}
