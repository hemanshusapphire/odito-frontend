"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  Mail, Phone, Building2, Pencil, UserPlus, StickyNote, CalendarClock, UserCheck, MessageSquare,
} from 'lucide-react'
import LeadAvatar from './LeadAvatar'
import LeadStatusBadge from './LeadStatusBadge'
import LeadPriorityLabel from './LeadPriorityLabel'
import { fmtDate, fmtDateTime, relDate, SOURCE_LABELS } from '@/lib/leadsConstants'

/**
 * Right-side lead detail drawer: contact card, status/priority, details,
 * notes. Built against real Lead data (odito_backend/src/modules/lead/) —
 * a few sections from the original mock had no real backend field and
 * were dropped rather than faked: Tags (Lead has no tags field), Open
 * Tasks (Lead has one nextFollowUpAt date, not a checklist — shown as a
 * single "Next Follow-up" row instead), and the Activity timeline (no
 * audit-log collection backs it). Notes are real (Lead.notes) and a
 * Message field is shown since the real schema has one the mock didn't.
 */
export default function LeadDetailDrawer({
  lead, open, onOpenChange, onEdit, onAssign, onAddNote, onScheduleFollowup,
}) {
  if (!lead) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-110 overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <LeadAvatar name={lead.name} size={44} />
            <div className="min-w-0">
              <SheetTitle className="truncate">{lead.name || 'Unnamed lead'}</SheetTitle>
              <SheetDescription className="font-mono text-xs">{lead.id}</SheetDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <LeadStatusBadge status={lead.status} />
            <LeadPriorityLabel priority={lead.priority} />
          </div>
        </SheetHeader>

        <div className="mt-5 flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onEdit(lead)}>
              <Pencil className="h-3.5 w-3.5" />Edit
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onAssign(lead)}>
              <UserPlus className="h-3.5 w-3.5" />Assign
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onAddNote(lead)}>
              <StickyNote className="h-3.5 w-3.5" />Note
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onScheduleFollowup(lead)}>
              <CalendarClock className="h-3.5 w-3.5" />Follow-up
            </Button>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4 flex flex-col gap-2.5 text-sm">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="text-foreground">{lead.company || '—'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="font-mono text-xs">{lead.email || '—'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              <span className="font-mono text-xs">{lead.phone || '—'}</span>
            </div>
          </div>

          {lead.message && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />Message
              </h4>
              <p className="text-sm text-foreground leading-relaxed rounded-lg border bg-muted/20 px-3 py-2.5 whitespace-pre-wrap">{lead.message}</p>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Details</h4>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <span className="text-muted-foreground">Source</span>
              <span className="text-right">{SOURCE_LABELS[lead.source] || lead.source || 'Manual'}</span>
              {lead.formName && (
                <>
                  <span className="text-muted-foreground">Form</span>
                  <span className="text-right">{lead.formName}</span>
                </>
              )}
              <span className="text-muted-foreground">Assigned</span>
              <span className="text-right flex items-center justify-end gap-1.5">
                {lead.assignedTo ? (
                  <><UserCheck className="h-3.5 w-3.5 text-emerald-500" />Assigned</>
                ) : 'Unassigned'}
              </span>
              <span className="text-muted-foreground">Created</span>
              <span className="text-right font-mono">{fmtDate(lead.createdAt)}</span>
              <span className="text-muted-foreground">Last Contact</span>
              <span className="text-right">{relDate(lead.lastContactAt)}</span>
              <span className="text-muted-foreground">Next Follow-up</span>
              <span className="text-right">{lead.nextFollowUpAt ? fmtDate(lead.nextFollowUpAt) : '—'}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notes</h4>
            {!lead.notes || lead.notes.length === 0 ? (
              <p className="text-xs text-muted-foreground">No notes yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {[...lead.notes].reverse().map((n, i) => (
                  <div key={n._id || i} className="rounded-lg border bg-muted/20 px-3 py-2.5">
                    <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{n.text}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{fmtDateTime(n.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
