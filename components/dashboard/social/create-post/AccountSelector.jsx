"use client"

import AccountChip from './AccountChip'

/** Grid of selectable connected-account chips - one or many platforms at a time. */
export default function AccountSelector({ platforms, selected, onToggle }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Post to</span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {platforms.map((platform) => (
          <AccountChip
            key={platform.id}
            platform={platform}
            selected={selected.includes(platform.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}
