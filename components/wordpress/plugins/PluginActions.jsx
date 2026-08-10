"use client"

import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Power, PowerOff, RefreshCw, Trash2, Settings, Eye } from 'lucide-react'

/** Three-dot row action menu: Activate/Deactivate, Update, Settings, View Details, Delete. */
export default function PluginActions({ plugin, onActivate, onDeactivate, onUpdate, onDelete, onSettings, onViewDetails }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {plugin.status === 'active' ? (
          <DropdownMenuItem onClick={() => onDeactivate(plugin)} className="gap-2"><PowerOff className="h-4 w-4" />Deactivate</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onActivate(plugin)} className="gap-2"><Power className="h-4 w-4" />Activate</DropdownMenuItem>
        )}
        {plugin.hasUpdate && (
          <DropdownMenuItem onClick={() => onUpdate(plugin)} className="gap-2"><RefreshCw className="h-4 w-4" />Update</DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onSettings(plugin)} className="gap-2"><Settings className="h-4 w-4" />Settings</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewDetails(plugin)} className="gap-2"><Eye className="h-4 w-4" />View Details</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(plugin)} variant="destructive" className="gap-2"><Trash2 className="h-4 w-4" />Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
