"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { SCHEDULING_DEFAULTS, UPDATE_FREQUENCIES } from '@/lib/wordpressPluginsDummyData'

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

/** Scheduling tab: automatic updates, frequency, preferred time, maintenance window, notifications, safe mode. */
export default function SchedulingPanel({ onSave }) {
  const [settings, setSettings] = useState(SCHEDULING_DEFAULTS)

  function set(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Card className="p-6 flex flex-col gap-3">
      <h3 className="text-sm font-semibold mb-1">Update Scheduling</h3>

      <SettingRow label="Automatic Plugin Updates" description="Automatically install available plugin updates">
        <Switch checked={settings.automaticUpdates} onCheckedChange={(v) => set('automaticUpdates', v)} />
      </SettingRow>

      <SettingRow label="Update Frequency" description="How often to check for and apply updates">
        <Select value={settings.frequency} onValueChange={(v) => set('frequency', v)}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{UPDATE_FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
        </Select>
      </SettingRow>

      <SettingRow label="Preferred Time" description="Time of day updates are applied">
        <Input type="time" value={settings.preferredTime} onChange={(e) => set('preferredTime', e.target.value)} className="h-8 w-28 text-xs" />
      </SettingRow>

      <SettingRow label="Maintenance Window" description="Updates only run within this window">
        <div className="flex items-center gap-1.5">
          <Input type="time" value={settings.maintenanceWindowStart} onChange={(e) => set('maintenanceWindowStart', e.target.value)} className="h-8 w-24 text-xs" />
          <span className="text-xs text-muted-foreground">to</span>
          <Input type="time" value={settings.maintenanceWindowEnd} onChange={(e) => set('maintenanceWindowEnd', e.target.value)} className="h-8 w-24 text-xs" />
        </div>
      </SettingRow>

      <SettingRow label="Email Notification" description="Get notified after each update run">
        <Switch checked={settings.emailNotifications} onCheckedChange={(v) => set('emailNotifications', v)} />
      </SettingRow>

      <SettingRow label="Safe Update Mode" description="Automatically roll back if an update breaks the site">
        <Switch checked={settings.safeUpdateMode} onCheckedChange={(v) => set('safeUpdateMode', v)} />
      </SettingRow>

      <Button size="sm" className="w-fit mt-1" onClick={() => onSave(settings)}>Save Scheduling</Button>
    </Card>
  )
}
