"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

/** Lists all platforms with a per-row connect action for whichever aren't linked yet. */
export default function ConnectAccountDialog({ open, onOpenChange, platforms, onConnect }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Connect Account</DialogTitle>
          <DialogDescription>Link a social platform to start pulling live metrics.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {platforms.map((p) => {
            const Icon = p.icon
            return (
              <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${p.brandColor}18`, color: p.brandColor }}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium">{p.name}</span>
                </div>
                {p.connected ? (
                  <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />Connected</Badge>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => onConnect(p.id)}>Connect</Button>
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
