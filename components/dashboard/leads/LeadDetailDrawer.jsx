"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Mail, Phone, Building2, Pencil, UserPlus, StickyNote, CalendarClock,
  CheckCircle2, Circle, PlusCircle, Trash2,
} from 'lucide-react'
import LeadAvatar from './LeadAvatar'
import LeadStatusBadge from './LeadStatusBadge'
import LeadPriorityLabel from './LeadPriorityLabel'
import { fmtDate, relDate } from '@/lib/leadsDummyData'

const ACTIVITY_ICON = { created: PlusCircle, contact: Mail, note: StickyNote, status: CheckCircle2 }

/**
 * Right-side lead detail drawer: contact card, status/priority, tags,
 * activity timeline, open tasks, notes. The source mockup's own drawer
 * markup was cut off by its 50k-character truncation, so this is built
 * fresh against the same Sheet primitive the rest of the app uses
 * (components/ui/sheet.jsx) rather than a guessed reconstruction of the
 * missing script.
 */
export default function LeadDetailDrawer({
  lead, open, onOpenChange, onEdit, onAssign, onAddNote, onScheduleFollowup, onToggleTask, onDeleteTag,
}) {
  if (!lead) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[440px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <LeadAvatar name={lead.name} size={44} />
            <div className="min-w-0">
              <SheetTitle className="truncate">{lead.name}</SheetTitle>
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
              <span className="text-foreground">{lead.company}</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="font-mono text-xs">{lead.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              <span className="font-mono text-xs">{lead.phone}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Details</h4>
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <span className="text-muted-foreground">Source</span>
              <span className="text-right">{lead.source}</span>
              <span className="text-muted-foreground">Assigned To</span>
              <span className="text-right flex items-center justify-end gap-1.5">
                <LeadAvatar name={lead.assignedTo} size={16} />{lead.assignedTo}
              </span>
              <span className="text-muted-foreground">Created</span>
              <span className="text-right font-mono">{fmtDate(lead.created)}</span>
              <span className="text-muted-foreground">Last Contact</span>
              <span className="text-right">{relDate(lead.lastContact)}</span>
            </div>
          </div>

          {lead.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {lead.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => onDeleteTag(lead, tag)} className="hover:text-destructive">
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {lead.tasks.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Open Tasks</h4>
              <div className="flex flex-col gap-1.5">
                {lead.tasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onToggleTask(lead, t.id)}
                    className="flex items-center gap-2 text-xs text-left rounded-lg border bg-muted/20 px-3 py-2 hover:bg-muted/40 transition-colors"
                  >
                    {t.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                    <span className={t.done ? 'line-through text-muted-foreground' : ''}>{t.text}</span>
                    <span className="ml-auto text-muted-foreground font-mono whitespace-nowrap">{fmtDate(t.due)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Activity</h4>
            {lead.activities.length === 0 ? (
              <p className="text-xs text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {lead.activities.map((a, i) => {
                  const Icon = ACTIVITY_ICON[a.type] || Circle
                  return (
                    <li key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <Icon className="h-3 w-3 text-muted-foreground" />
                        </span>
                        {i < lead.activities.length - 1 && <span className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pb-0.5">
                        <p className="text-xs text-foreground leading-relaxed">{a.text}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{fmtDate(a.date)}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {lead.notes.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notes</h4>
              <div className="flex flex-col gap-2">
                {lead.notes.map((n, i) => (
                  <div key={i} className="rounded-lg border bg-muted/20 px-3 py-2.5">
                    <p className="text-xs text-foreground leading-relaxed">{n.text}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{fmtDate(n.date)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
