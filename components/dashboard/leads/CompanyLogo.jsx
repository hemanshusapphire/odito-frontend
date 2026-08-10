"use client"

import { initials, hashColor } from '@/lib/leadsDummyData'

/** Deterministic-color initials tile standing in for a company logo. */
export default function CompanyLogo({ company, size = 32 }) {
  const c = hashColor(company)
  return (
    <div
      className="rounded-lg flex items-center justify-center font-bold shrink-0 font-mono"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${c}33, ${c}14)`,
        color: c,
        border: `1px solid ${c}33`,
        fontSize: size * 0.36,
      }}
    >
      {initials(company)}
    </div>
  )
}
