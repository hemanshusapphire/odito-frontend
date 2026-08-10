"use client"

import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

/**
 * One selectable connected-account card: platform icon, name, Connected
 * badge, checkbox. Root is a <div role="button"> rather than a real
 * <button> - the inner Checkbox renders its own Radix <button>, and a
 * <button> can't legally contain another <button> (invalid HTML, causes a
 * hydration mismatch). The div gets full keyboard support instead.
 */
export default function AccountChip({ platform, selected, onToggle }) {
  const Icon = platform.icon
  const disabled = !platform.connected
  const color = platform.color || platform.brandColor

  function handleKeyDown(e) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggle(platform.id)
    }
  }

  return (
    <motion.div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={selected}
      aria-disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      onClick={() => !disabled && onToggle(platform.id)}
      onKeyDown={handleKeyDown}
      className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        disabled
          ? 'opacity-50 cursor-not-allowed bg-muted/20'
          : selected
            ? 'shadow-sm'
            : 'hover:bg-muted/40'
      }`}
      style={selected && !disabled ? { borderColor: `${color}55`, background: `${color}0d` } : undefined}
    >
      <Checkbox checked={selected} disabled={disabled} tabIndex={-1} className="pointer-events-none" />
      <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18`, color }}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium truncate">{platform.name}</span>
      </span>
      <Badge variant={platform.connected ? 'success' : 'secondary'} className="text-[10px] shrink-0">
        {platform.connected ? 'Connected' : 'Not Connected'}
      </Badge>
    </motion.div>
  )
}
