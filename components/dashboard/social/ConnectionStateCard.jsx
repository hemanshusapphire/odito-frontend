"use client"

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

/**
 * Centered "not connected" overlay shown atop a platform's chart -
 * modernized version of the reference's popup card (brand icon with a
 * small error badge, short message, connect button) in Odito's card style.
 */
export default function ConnectionStateCard({ icon: Icon, tint, platformName, message, onConnect }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-4">
      <div className="w-full max-w-xs rounded-2xl border bg-popover/95 backdrop-blur shadow-xl px-6 py-6 flex flex-col items-center text-center gap-3">
        <div className="relative">
          <span
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: `${tint}18`, color: tint }}
          >
            <Icon className="h-6 w-6" />
          </span>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center border-2 border-popover">
            <AlertCircle className="h-3 w-3" />
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
        <Button size="sm" onClick={onConnect} className="gap-2 mt-1">
          Click here to Link your {platformName} Account
        </Button>
      </div>
    </div>
  )
}
