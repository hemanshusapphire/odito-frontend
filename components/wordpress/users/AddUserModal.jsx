"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { UploadCloud } from 'lucide-react'
import { ROLES } from '@/lib/wordpressUsersDummyData'

const EMPTY_FORM = { firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '', role: ROLES[2], bio: '' }

/** Add User modal - frontend-only form, no real account creation. */
export default function AddUserModal({ open, onOpenChange, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [avatarName, setAvatarName] = useState(null)
  const [error, setError] = useState('')

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleOpenChange(next) {
    if (!next) { setForm(EMPTY_FORM); setAvatarName(null); setError('') }
    onOpenChange(next)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.firstName.trim() || !form.username.trim() || !form.email.trim() || !form.password) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    onSubmit(form)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>Create a new WordPress user account for this site.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-user-first-name">First Name</Label>
              <Input id="new-user-first-name" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-user-last-name">Last Name</Label>
              <Input id="new-user-last-name" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-user-username">Username</Label>
              <Input id="new-user-username" value={form.username} onChange={(e) => set('username', e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-user-email">Email</Label>
              <Input id="new-user-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-user-password">Password</Label>
              <Input id="new-user-password" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-user-confirm-password">Confirm Password</Label>
              <Input id="new-user-confirm-password" type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} required />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => set('role', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-user-bio">Bio</Label>
            <Textarea id="new-user-bio" value={form.bio} onChange={(e) => set('bio', e.target.value)} className="min-h-[70px]" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Profile Image</Label>
            <label className="flex items-center gap-2.5 rounded-lg border-2 border-dashed px-4 py-3 text-xs text-muted-foreground cursor-pointer hover:bg-muted/30 transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarName(e.target.files?.[0]?.name || null)} />
              <UploadCloud className="h-4 w-4 shrink-0" />
              {avatarName || 'Click to upload a profile image'}
            </label>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit">Create User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
