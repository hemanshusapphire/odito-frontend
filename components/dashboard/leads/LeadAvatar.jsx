"use client"

import { initials, userColor } from '@/lib/leadsDummyData'

/** Initials avatar, tinted per-person (assignees) using the fixed USERS palette. */
export default function LeadAvatar({ name, size = 30 }) {
  const c = userColor(name)
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold shrink-0"
      style={{ width: size, height: size, background: `${c}22`, color: c, border: `1px solid ${c}44`, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  )
}
