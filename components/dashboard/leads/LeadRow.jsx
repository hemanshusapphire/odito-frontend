"use client"

import { TableRow, TableCell } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Eye, Pencil, UserPlus, StickyNote, CalendarClock, CheckCircle2, Trash2, MoreVertical } from 'lucide-react'
import LeadAvatar from './LeadAvatar'
import CompanyLogo from './CompanyLogo'
import LeadStatusBadge from './LeadStatusBadge'
import LeadPriorityLabel from './LeadPriorityLabel'
import { fmtDate, relDate } from '@/lib/leadsDummyData'

const PRIORITY_BORDER = { High: 'border-l-destructive', Medium: 'border-l-amber-500', Low: 'border-l-muted-foreground/30' }

export default function LeadRow({
  lead, selected, onToggleSelect, onOpenDrawer, onEdit, onAssign, onAddNote, onScheduleFollowup, onMarkQualified, onDelete,
}) {
  return (
    <TableRow
      className={`cursor-pointer border-l-[3px] ${PRIORITY_BORDER[lead.priority]}`}
      onClick={() => onOpenDrawer(lead)}
    >
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={selected} onCheckedChange={(v) => onToggleSelect(lead.id, v === true)} />
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2.5">
          <LeadAvatar name={lead.name} />
          <div className="min-w-0">
            <div className="font-medium truncate">{lead.name}</div>
            <div className="text-muted-foreground text-[11px] font-mono">{lead.id}</div>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <CompanyLogo company={lead.company} size={26} />
          <span className="text-muted-foreground truncate max-w-40">{lead.company}</span>
        </div>
      </TableCell>

      <TableCell className="text-muted-foreground font-mono text-xs">{lead.email}</TableCell>
      <TableCell className="text-muted-foreground font-mono text-xs whitespace-nowrap">{lead.phone}</TableCell>

      <TableCell>
        <Badge variant="outline" className="whitespace-nowrap font-normal">{lead.source}</Badge>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <LeadAvatar name={lead.assignedTo} size={22} />
          <span className="text-muted-foreground text-xs whitespace-nowrap">{lead.assignedTo.split(' ')[0]}</span>
        </div>
      </TableCell>

      <TableCell><LeadStatusBadge status={lead.status} /></TableCell>
      <TableCell><LeadPriorityLabel priority={lead.priority} /></TableCell>
      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{relDate(lead.lastContact)}</TableCell>
      <TableCell className="text-muted-foreground text-xs whitespace-nowrap font-mono">{fmtDate(lead.created)}</TableCell>

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
