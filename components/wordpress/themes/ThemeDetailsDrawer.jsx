"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Layout, Eye, Paintbrush, Power, RefreshCw } from 'lucide-react'
import ThemeStatusBadge from './ThemeStatusBadge'
import { DetailRow } from '@/components/system-admin/shared/DetailRow'

/** Full theme details drawer - screenshot, metadata, compatibility, license, and quick actions. */
export default function ThemeDetailsDrawer({ theme, open, onOpenChange, onPreview, onCustomize, onActivate, onUpdate }) {
  if (!theme) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{theme.name}</SheetTitle>
          <SheetDescription>Theme details, compatibility and quick actions.</SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-5">
          <div
            className="w-full h-36 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${theme.tint}33, ${theme.tint}0d)` }}
          >
            <Layout className="h-8 w-8" style={{ color: `${theme.tint}99` }} />
          </div>

          <ThemeStatusBadge theme={theme} />

          <p className="text-sm text-muted-foreground leading-relaxed">{theme.description}</p>

          <div className="flex flex-col">
            <DetailRow label="Version" value={theme.currentVersion} />
            <DetailRow label="Author" value={theme.author} />
            <DetailRow label="Theme Type" value={theme.parentTheme ? `Child Theme (of ${theme.parentTheme})` : 'Parent Theme'} />
            <DetailRow label="Compatible WordPress" value={theme.wpCompat} />
            <DetailRow label="Compatible PHP" value={theme.phpCompat} />
            <DetailRow label="License" value={theme.license} />
            <DetailRow label="Installed" value={theme.installedAt} />
            <DetailRow label="Last Updated" value={theme.lastUpdated} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onPreview(theme)}>
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onCustomize(theme)}>
              <Paintbrush className="h-3.5 w-3.5" />
              Customize
            </Button>
            {theme.status !== 'active' && (
              <Button size="sm" className="gap-1.5" onClick={() => onActivate(theme)}>
                <Power className="h-3.5 w-3.5" />
                Activate
              </Button>
            )}
            {theme.hasUpdate && (
              <Button size="sm" className="gap-1.5" onClick={() => onUpdate(theme)}>
                <RefreshCw className="h-3.5 w-3.5" />
                Update
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
