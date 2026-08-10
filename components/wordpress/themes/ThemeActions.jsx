"use client"

import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Power, PowerOff, RefreshCw, Paintbrush, Eye, Info, Trash2 } from 'lucide-react'

/** Three-dot row action menu: Activate/Deactivate, Update, Customize, Preview, Theme Details, Delete. */
export default function ThemeActions({ theme, onActivate, onDeactivate, onUpdate, onCustomize, onPreview, onDelete, onViewDetails }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {theme.status === 'active' ? (
          <DropdownMenuItem onClick={() => onDeactivate(theme)} className="gap-2"><PowerOff className="h-4 w-4" />Deactivate</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onActivate(theme)} className="gap-2"><Power className="h-4 w-4" />Activate</DropdownMenuItem>
        )}
        {theme.hasUpdate && (
          <DropdownMenuItem onClick={() => onUpdate(theme)} className="gap-2"><RefreshCw className="h-4 w-4" />Update</DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onCustomize(theme)} className="gap-2"><Paintbrush className="h-4 w-4" />Customize</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPreview(theme)} className="gap-2"><Eye className="h-4 w-4" />Preview</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewDetails(theme)} className="gap-2"><Info className="h-4 w-4" />Theme Details</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(theme)} variant="destructive" className="gap-2"><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
