"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { UploadCloud, FileArchive } from 'lucide-react'

const EMPTY_FORM = { name: '', description: '', version: '1.0.0', status: 'active', isPremium: false }

/** Add Plugin modal - frontend-only form, no real install/upload pipeline. */
export default function AddPluginModal({ open, onOpenChange, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [fileName, setFileName] = useState(null)
  const [error, setError] = useState('')

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleOpenChange(next) {
    if (!next) { setForm(EMPTY_FORM); setFileName(null); setError('') }
    onOpenChange(next)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Plugin name is required.')
      return
    }
    onSubmit(form)
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Plugin</DialogTitle>
          <DialogDescription>Add a new plugin to this site's plugin list.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 px-4 text-center cursor-pointer hover:bg-muted/30 transition-colors">
            <input
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
            />
            {fileName ? <FileArchive className="h-6 w-6 text-primary" /> : <UploadCloud className="h-6 w-6 text-muted-foreground" />}
            <p className="text-sm font-medium">{fileName || 'Upload plugin .zip (optional)'}</p>
            <p className="text-[11px] text-muted-foreground">or fill in the details below manually</p>
          </label>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-plugin-name">Plugin Name</Label>
            <Input id="new-plugin-name" value={form.name} onChange={(e) => set('name', e.target.value)} required autoFocus />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-plugin-description">Description</Label>
            <Textarea id="new-plugin-description" value={form.description} onChange={(e) => set('description', e.target.value)} className="min-h-[70px]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-plugin-version">Version</Label>
              <Input id="new-plugin-version" value={form.version} onChange={(e) => set('version', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border bg-muted/20 px-4 py-3">
            <div>
              <div className="text-sm font-medium">Premium Plugin</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Mark this as a licensed/premium plugin</div>
            </div>
            <Switch checked={form.isPremium} onCheckedChange={(v) => set('isPremium', v)} />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button type="submit">Add Plugin</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
