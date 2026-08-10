"use client"

/** Small platform icon+name chip, tinted with that platform's brand color. */
export default function PlatformBadge({ platform, size = 'sm' }) {
  const Icon = platform.icon
  const isSmall = size === 'sm'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${isSmall ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
      style={{ background: `${platform.color}18`, color: platform.color }}
    >
      <Icon className={isSmall ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {platform.name}
    </span>
  )
}
