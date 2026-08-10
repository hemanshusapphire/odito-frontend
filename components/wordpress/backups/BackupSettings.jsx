"use client"

import { useState } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { BACKUP_FREQUENCIES, RETENTION_OPTIONS, CLOUD_STORAGE_OPTIONS, BACKUP_SETTINGS_DEFAULTS } from '@/lib/wordpressBackupsDummyData'

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/20 px-4 py-3.5">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-[11px] text-muted-foreground mt-0.5">{description}</div>}
      </div>
      {children}
    </div>
  )
}

/** Backup configuration: frequency/retention/cloud storage selects + compression/notifications/encryption toggles. */
export default function BackupSettings({ onSave }) {
  const [settings, setSettings] = useState(BACKUP_SETTINGS_DEFAULTS)

  function set(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-3">
      <SettingRow label="Backup Frequency" description="How often automatic backups run">
        <Select value={settings.frequency} onValueChange={(v) => set('frequency', v)}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{BACKUP_FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
        </Select>
      </SettingRow>

      <SettingRow label="Retention" description="How long backups are kept before deletion">
        <Select value={settings.retention} onValueChange={(v) => set('retention', v)}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{RETENTION_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
      </SettingRow>

      <SettingRow label="Cloud Storage" description="Where backup files are stored">
        <Select value={settings.cloudStorage} onValueChange={(v) => set('cloudStorage', v)}>
          <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{CLOUD_STORAGE_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </SettingRow>

      <SettingRow label="Compression" description="Compress backup files to save storage">
        <Switch checked={settings.compression} onCheckedChange={(v) => set('compression', v)} />
      </SettingRow>

      <SettingRow label="Notifications" description="Email alerts for backup success or failure">
        <Switch checked={settings.notifications} onCheckedChange={(v) => set('notifications', v)} />
      </SettingRow>

      <SettingRow label="Encryption" description="Encrypt backup files at rest">
        <Switch checked={settings.encryption} onCheckedChange={(v) => set('encryption', v)} />
      </SettingRow>

      <Button size="sm" className="w-fit mt-1" onClick={() => onSave(settings)}>Save Settings</Button>
    </div>
  )
}
