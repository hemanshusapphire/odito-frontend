"use client"

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { getSocialMediaImage } from '@/lib/socialMediaImages'

/**
 * Safe image renderer for every real photo in the Social Media AI module.
 * Looks up `imageId` in the central registry (lib/socialMediaImages.js) and
 * renders it with object-cover so it never stretches. If the id is unknown,
 * or the file hasn't been dropped into public/social-media/ yet and the
 * request 404s, this renders a neutral placeholder instead - never the old
 * gradient, never a broken-image icon.
 *
 * `className` sizes/shapes the container (the caller already controls that
 * via height/width/aspect-ratio utility classes), `imgClassName` is for
 * anything extra on the <img> itself (e.g. rounded corners matching the
 * container). `children` renders
 * on top of the image/fallback (platform-icon badges, overlaid headlines) -
 * same layering every one of these cards already had with the old gradient.
 */
export function SocialMediaImage({ imageId, src = null, alt = '', className = '', imgClassName = '', priority = false, children }) {
  const [errored, setErrored] = useState(false)
  // `src` is a REAL media URL (a post's uploaded image) and takes precedence
  // over the registry lookup, which only serves the module's sample imagery.
  const asset = src ? { src, alt } : getSocialMediaImage(imageId)
  const showFallback = !asset || errored

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {!showFallback && (
        <img
          src={asset.src}
          alt={asset.alt}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setErrored(true)}
          className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
        />
      )}
      {showFallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-300">
          <ImageIcon className="h-1/4 w-1/4 min-h-4 min-w-4" strokeWidth={1.5} />
        </div>
      )}
      {children}
    </div>
  )
}

export default SocialMediaImage
