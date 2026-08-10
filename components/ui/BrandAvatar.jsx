"use client"

import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

function getInitials(name) {
  if (!name) return '—'
  const words = name.trim().split(/\s+/).slice(0, 2)
  return words.map((w) => w[0]?.toUpperCase()).join('') || '—'
}

/**
 * Platform-wide brand logo/initials avatar. Fed by the Brand Asset Resolver
 * (see hooks/useDashboardQueries.js useProjectBrandAsset, which calls
 * odito_backend's GET /projects/:projectId/brand-asset) - this component
 * never needs to know WHERE the image came from (Google Business Profile
 * logo, website logo, website favicon), only whether one exists.
 *
 * The resolver validates candidates server-side (content-type check) before
 * returning them, but a URL can still fail to actually load in the browser
 * (hotlink protection, transient network issues, mixed content). onError
 * advances through the remaining candidates (brandLogo, then favicon) before
 * finally falling back to generated initials - never leaves a broken image/
 * unconstrained alt text on screen. The outer wrapper is always a
 * fixed-size, overflow-hidden box so nothing can spill outside the avatar's
 * footprint even in the instant before onError fires.
 */
export default function BrandAvatar({ brandAsset, name, size = 56, rounded = 'rounded-2xl', className }) {
  const candidates = useMemo(() => {
    const list = [brandAsset?.brandLogo, brandAsset?.favicon].filter(Boolean)
    return [...new Set(list)]
  }, [brandAsset?.brandLogo, brandAsset?.favicon])

  const [attempt, setAttempt] = useState(0)

  // New candidate set (different project, resolver re-run) deserves a fresh attempt.
  useEffect(() => {
    setAttempt(0)
  }, [candidates])

  const dimensionStyle = { width: size, height: size }
  const currentUrl = candidates[attempt]
  const showImage = !!currentUrl

  return (
    <div
      style={dimensionStyle}
      className={cn(
        rounded,
        'shrink-0 overflow-hidden flex items-center justify-center shadow-lg shadow-blue-500/20',
        showImage ? 'bg-white' : 'bg-gradient-to-br from-blue-500 to-violet-500 text-white font-extrabold',
        className
      )}
    >
      {showImage ? (
        <img
          key={currentUrl}
          src={currentUrl}
          alt={`${name || 'Business'} logo`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={() => setAttempt((i) => i + 1)}
        />
      ) : (
        <span style={{ fontSize: Math.max(12, Math.round(size * 0.32)) }}>{getInitials(name)}</span>
      )}
    </div>
  )
}
