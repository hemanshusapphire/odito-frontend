"use client"

import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Eye, Pencil, KeyRound, UserCog, Ban, Trash2 } from 'lucide-react'
import UserStatusBadge from './UserStatusBadge'

function formatLastLogin(iso) {
  if (!iso) return 'Never'
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffHr = Math.round(diffMs / 3600000)
  if (diffHr < 1) return 'Just now'
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`
  const diffDays = Math.round(diffHr / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** One user row: checkbox, avatar, identity block, role/status badges, last login, registered date, actions. */
export default function UserRow({ user, selected, onToggleSelect, onOpenDetails, onEdit, onResetPassword, onChangeRole, onSuspend, onDelete }) {
  const fullName = `${user.firstName} ${user.lastName}`.trim() || user.username

  return (
    <motion.div
      whileHover={{ backgroundColor: 'var(--muted)' }}
      className="flex items-center gap-4 px-4 py-4 border-b last:border-b-0 transition-colors"
    >
      <Checkbox checked={selected} onCheckedChange={() => onToggleSelect(user.id)} />

      <span
        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-semibold text-xs"
        style={{ background: `${user.tint}22`, color: user.tint, border: `1px solid ${user.tint}44` }}
      >
        {user.initials}
      </span>

      <button onClick={() => onOpenDetails(user)} className="min-w-0 flex-1 text-left">
        <div className="text-sm font-semibold hover:underline truncate">{fullName}</div>
        <div className="text-[11px] text-muted-foreground truncate">@{user.username} &middot; {user.email}</div>
        <div className="text-[11px] text-muted-foreground/80 truncate mt-0.5">{user.bio}</div>
      </button>

      <Badge variant="outline" className="hidden md:inline-flex text-[10px] shrink-0">{user.role}</Badge>

      <div className="hidden lg:block shrink-0"><UserStatusBadge user={user} /></div>

      <div className="hidden xl:flex flex-col items-end shrink-0 w-28 text-[11px] text-muted-foreground">
        <span>{formatLastLogin(user.lastLogin)}</span>
        <span className="text-muted-foreground/70">{user.registeredAt}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onOpenDetails(user)} className="gap-2"><Eye className="h-4 w-4" />View Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(user)} className="gap-2"><Pencil className="h-4 w-4" />Edit User</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onResetPassword(user)} className="gap-2"><KeyRound className="h-4 w-4" />Reset Password</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChangeRole(user)} className="gap-2"><UserCog className="h-4 w-4" />Change Role</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSuspend(user)} className="gap-2"><Ban className="h-4 w-4" />Suspend User</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onDelete(user)} variant="destructive" className="gap-2"><Trash2 className="h-4 w-4" />Delete User</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}
