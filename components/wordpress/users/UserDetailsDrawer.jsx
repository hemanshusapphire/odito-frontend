"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Pencil, KeyRound, Ban, Trash2 } from 'lucide-react'
import { DetailRow } from '@/components/system-admin/shared/DetailRow'
import UserStatusBadge from './UserStatusBadge'

const ROLE_PERMISSIONS = {
  Administrator: 'Full access to all site settings, users, plugins and themes.',
  Editor: 'Publish and manage posts, including posts by other users.',
  Author: 'Publish and manage their own posts.',
  Contributor: 'Write and manage their own posts, but cannot publish them.',
  Subscriber: 'Manage their own profile only.',
  'Shop Manager': 'Manage store products, orders and customer data.',
  'SEO Manager': 'Manage on-page SEO settings and search console integrations.',
}

function formatLastLogin(iso) {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

/** Full user profile drawer - identity, role/permissions, activity metrics, timeline, quick actions. */
export default function UserDetailsDrawer({ user, open, onOpenChange, onEdit, onResetPassword, onSuspend, onDelete }) {
  if (!user) return null
  const fullName = `${user.firstName} ${user.lastName}`.trim() || user.username

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[440px] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <span
              className="w-14 h-14 rounded-full flex items-center justify-center font-semibold shrink-0"
              style={{ background: `${user.tint}22`, color: user.tint, border: `1px solid ${user.tint}44` }}
            >
              {user.initials}
            </span>
            <div className="min-w-0">
              <SheetTitle className="truncate">{fullName}</SheetTitle>
              <SheetDescription className="truncate">@{user.username}</SheetDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <UserStatusBadge user={user} />
          </div>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onEdit(user)}><Pencil className="h-3.5 w-3.5" />Edit</Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onResetPassword(user)}><KeyRound className="h-3.5 w-3.5" />Reset Password</Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onSuspend(user)}><Ban className="h-3.5 w-3.5" />Suspend</Button>
            <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => onDelete(user)}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>

          <div className="flex flex-col">
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Role" value={user.role} />
            <DetailRow label="Registration Date" value={user.registeredAt} />
            <DetailRow label="Last Login" value={formatLastLogin(user.lastLogin)} />
            <DetailRow label="Website" value={user.website || '—'} />
            <DetailRow label="Posts Created" value={user.postsCreated} />
            <DetailRow label="Comments" value={user.comments} />
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Permissions</h4>
            <p className="text-xs text-muted-foreground leading-relaxed rounded-lg border bg-muted/30 px-3 py-2.5">
              {ROLE_PERMISSIONS[user.role]}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Activity</h4>
            <ul className="flex flex-col gap-3">
              {user.activity.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                  <div>
                    <p className="text-xs text-foreground">{item.text}</p>
                    <p className="text-[11px] text-muted-foreground">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
