"use client"

import { Facebook } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

/**
 * The active-account pill shown in both the Social Overview header
 * (SocialPageHeader.jsx) and the Feeds header (FeedsHeader.jsx) — one
 * component so the "which account is active" indicator looks and behaves
 * identically everywhere it appears, fed by the same source of truth
 * (useFacebookAccounts' isActive flag) both pages already read.
 */
export default function ActiveAccountBadge({ name, picture }) {
  if (!name) return null

  return (
    <div className="flex items-center gap-2 rounded-full border bg-muted/40 pl-1.5 pr-3 py-1">
      <div className="relative shrink-0">
        <Avatar className="h-6 w-6">
          <AvatarImage src={picture || undefined} alt={name} />
          <AvatarFallback className="text-[10px]">{name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center border border-card bg-[#1877F2]">
          <Facebook className="h-1.5 w-1.5 text-white" />
        </span>
      </div>
      <span className="text-sm font-medium truncate max-w-45">{name}</span>
    </div>
  )
}
