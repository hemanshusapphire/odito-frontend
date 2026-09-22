"use client"

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { NOTIFICATION_SETTINGS_DEFAULTS } from '@/lib/socialMediaAIDummyData'

/** "Notifications" settings tab - per-event notification toggles. */
export function NotificationSettings() {
  const [items, setItems] = useState(NOTIFICATION_SETTINGS_DEFAULTS)

  function toggle(id) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)))
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">Notifications</h2>
      <p className="mt-1 text-sm text-slate-500">Choose what Social Media AI should notify you about.</p>

      <div className="mt-4 flex flex-col divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-4 py-3.5">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">{item.label}</p>
              <p className="text-sm text-slate-500">{item.description}</p>
            </div>
            <Switch
              checked={item.enabled}
              onCheckedChange={() => toggle(item.id)}
              className="mt-0.5 shrink-0 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-200 [&>span]:bg-white"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotificationSettings
