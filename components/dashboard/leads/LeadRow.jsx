"use client"

import { TableRow, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Eye, Pencil, UserPlus, StickyNote, CalendarClock, CheckCircle2, Trash2, MoreVertical, UserCheck } from 'lucide-react'
import LeadAvatar from './LeadAvatar'
import CompanyLogo from './CompanyLogo'
import LeadStatusBadge from './LeadStatusBadge'
import LeadPriorityLabel from './LeadPriorityLabel'
import { fmtDate, relDate, SOURCE_LABELS } from '@/lib/leadsConstants'

const PRIORITY_BORDER = { high: 'border-l-destructive', medium: 'border-l-amber-500', low: 'border-l-muted-foreground/30' }

export default function LeadRow({
  lead, selected, onToggleSelect, onOpenDrawer, onEdit, onAssign, onAddNote, onScheduleFollowup, onMarkQualified, onDelete,
}) {
  return (
    <TableRow
      className={`cursor-pointer border-l-[3px] ${PRIORITY_BORDER[lead.priority] || PRIORITY_BORDER.medium}`}
      onClick={() => onOpenDrawer(lead)}
    >
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={selected} onCheckedChange={(v) => onToggleSelect(lead.id, v === true)} />
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2.5">
          <LeadAvatar name={lead.name} />
          <div className="min-w-0">
            <div className="font-medium truncate">{lead.name || 'Unnamed lead'}</div>
            <div className="text-muted-foreground text-[11px] font-mono">{lead.id?.slice(-8)}</div>
          </div>
        </div>
      </TableCell>

      <TableCell>
        {lead.company ? (
          <div className="flex items-center gap-2">
            <CompanyLogo company={lead.company} size={26} />
            <span className="text-muted-foreground truncate max-w-40">{lead.company}</span>
          </div>
        ) : (
          <span className="text-muted-foreground/60">—</span>
        )}
      </TableCell>

      <TableCell className="text-muted-foreground font-mono text-xs">{lead.email || '—'}</TableCell>
      <TableCell className="text-muted-foreground font-mono text-xs whitespace-nowrap">{lead.phone || '—'}</TableCell>

      <TableCell>
        <Badge variant="outline" className="whitespace-nowrap font-normal">
          {SOURCE_LABELS[lead.source] || lead.source || 'Manual'}
        </Badge>
      </TableCell>

      <TableCell>
        {lead.assignedTo ? (
          <div className="flex items-center gap-2 text-muted-foreground text-xs whitespace-nowrap">
            <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
            Assigned
          </div>
        ) : (
          <span className="text-muted-foreground/60 text-xs">Unassigned</span>
        )}
      </TableCell>

      <TableCell><LeadStatusBadge status={lead.status} /></TableCell>
      <TableCell><LeadPriorityLabel priority={lead.priority} /></TableCell>
      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{relDate(lead.lastContactAt)}</TableCell>
      <TableCell className="text-muted-foreground text-xs whitespace-nowrap font-mono">{fmtDate(lead.createdAt)}</TableCell>

      <TableCell onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={() => onOpenDrawer(lead)} className="gap-2"><Eye className="h-4 w-4" />View</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(lead)} className="gap-2"><Pencil className="h-4 w-4" />Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAssign(lead)} className="gap-2"><UserPlus className="h-4 w-4" />Assign</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAddNote(lead)} className="gap-2"><StickyNote className="h-4 w-4" />Add Note</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onScheduleFollowup(lead)} className="gap-2"><CalendarClock className="h-4 w-4" />Schedule Follow-up</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMarkQualified(lead)} className="gap-2"><CheckCircle2 className="h-4 w-4" />Mark Qualified</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(lead)} variant="destructive" className="gap-2"><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
