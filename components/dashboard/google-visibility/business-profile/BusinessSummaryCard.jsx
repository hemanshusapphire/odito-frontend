"use client"

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import BrandAvatar from '@/components/ui/BrandAvatar'
import { BadgeCheck, Globe, Phone, MapPin, Clock, Star } from 'lucide-react'
import { computeOpenStatus } from '@/lib/businessProfileHours'

const STATUS_LABELS = {
  OPEN: null, // handled by computed open/closed instead
  CLOSED_TEMPORARILY: 'Temporarily Closed',
  CLOSED_PERMANENTLY: 'Permanently Closed',
}

// Half-width of the embed's bounding box, in degrees - a small delta keeps
// the preview zoomed in on the business itself rather than the whole city.
const MAP_PREVIEW_DEGREE_DELTA = 0.006

/**
 * Real map preview (roads, imagery, business pin), keyless.
 *
 * Google's own Static Maps / Maps Embed APIs both require a billed API key
 * this project has no credentials for anywhere. The unofficial keyless
 * trick (maps.google.com/maps?...&output=embed) was tried and verified
 * live to return HTTP 404 as of this implementation - Google appears to
 * have retired it, so it is not used here (it would put a broken Google
 * error page inside the card, which onError can't reliably catch since the
 * iframe still "loads" successfully from the browser's point of view).
 * OpenStreetMap's embed endpoint is keyless and confirmed working (live
 * HTTP 200) - it needs real coordinates, not a place_id or address string,
 * which is why this only activates when both latitude and longitude exist.
 */
function getMapPreviewSrc(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return null
  const west = longitude - MAP_PREVIEW_DEGREE_DELTA
  const east = longitude + MAP_PREVIEW_DEGREE_DELTA
  const south = latitude - MAP_PREVIEW_DEGREE_DELTA
  const north = latitude + MAP_PREVIEW_DEGREE_DELTA
  return `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${latitude}%2C${longitude}`
}

/**
 * Google Business Profile facts card. `brandAsset` is passed down from
 * page.jsx's useProjectBrandAsset(projectId) call - the exact same hook,
 * cache entry (['brand-asset', projectId]), and BrandAvatar component the
 * Workspace Switcher uses. No second logo fetch/resolver here - if the
 * switcher already loaded it, this reads it from React Query cache with no
 * extra network request.
 *
 * Open/closed + today's hours are computed client-side from the raw
 * regularHours/specialHours Google returns - see lib/businessProfileHours.js
 * for why (Google exposes no boolean/pre-formatted field for either).
 */
export default function BusinessSummaryCard({ details, brandAsset, onOpenReviews }) {
  if (!details) return null

  const {
    businessName, verified, hasVoiceOfMerchant, primaryCategory, secondaryCategories,
    businessStatus, website, phone, address, mapsUri, latitude, longitude,
    averageRating, totalReviewCount, regularHours, specialHours,
  } = details

  const isVerified = verified ?? hasVoiceOfMerchant

  const openStatus = useMemo(
    () => computeOpenStatus(regularHours, specialHours),
    [regularHours, specialHours]
  )

  const permanentStatusLabel = businessStatus && businessStatus !== 'OPEN' ? STATUS_LABELS[businessStatus] : null
  const hasRating = typeof averageRating === 'number'

  const [mapLoadFailed, setMapLoadFailed] = useState(false)
  const mapPreviewSrc = useMemo(
    () => getMapPreviewSrc(latitude, longitude),
    [latitude, longitude]
  )
  const showMapEmbed = !!mapPreviewSrc && !mapLoadFailed

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr_0.9fr] gap-6">
        {/* Logo -> Business Name -> Primary Category -> Verified Badge -> Open Now */}
        <div className="flex flex-col items-start lg:border-r lg:pr-6">
          <BrandAvatar brandAsset={brandAsset} name={businessName} size={56} />

          <span className="text-base font-bold tracking-tight mt-3">{businessName || 'Untitled Business'}</span>

          <p className="text-xs text-muted-foreground mt-1">
            <span className="font-semibold text-foreground">{primaryCategory || 'Uncategorized'}</span>
            {secondaryCategories?.length > 0 && ` · ${secondaryCategories.join(' · ')}`}
          </p>

          {isVerified && (
            <Badge variant="success" className="mt-2.5 gap-1 text-[11px] w-fit">
              <BadgeCheck className="h-3 w-3" />
              Verified by Google
            </Badge>
          )}

          {permanentStatusLabel ? (
            <Badge variant="critical" className="mt-2.5 text-[11px] w-fit">{permanentStatusLabel}</Badge>
          ) : openStatus.isOpenNow != null ? (
            <div className={`flex items-center gap-1.5 mt-2.5 text-xs font-semibold ${
              openStatus.isOpenNow ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${openStatus.isOpenNow ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {openStatus.isOpenNow ? `Open now · Closes ${openStatus.closesAt}` : 'Closed now'}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-2.5">Hours not available</p>
          )}
        </div>

        {/* Contact + rating, stacked */}
        <div className="flex flex-col justify-center gap-5 lg:px-2">
          <div className="space-y-2.5">
            {website ? (
              <InfoRow icon={Globe}>
                <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">
                  {website.replace(/^https?:\/\//, '')}
                </a>
              </InfoRow>
            ) : (
              <InfoRow icon={Globe}><span className="italic">No website on file</span></InfoRow>
            )}
            <InfoRow icon={Phone}>
              {phone ? <span className="font-medium text-foreground">{phone}</span> : <span className="italic">No phone on file</span>}
            </InfoRow>
            <InfoRow icon={MapPin}>{address || <span className="italic">No storefront address (service-area business)</span>}</InfoRow>
            <InfoRow icon={Clock}>
              {openStatus.todayHours ? (
                <>Today: <span className="font-medium text-foreground">{openStatus.todayHours}</span></>
              ) : (
                <span className="italic">Hours not available</span>
              )}
            </InfoRow>
          </div>

          <div className="flex flex-col gap-1.5">
            {hasRating ? (
              /* Opens the existing ReviewsDrawer (real synced reviews -
                 search, pagination, business replies, and its own
                 "unavailable" state when Google restricts review access for
                 this app) rather than linking out to Google Maps - an
                 in-app, richer surface for the exact same data, already
                 built and already wired to useBusinessProfileReviews; this
                 was the only missing piece; no new data fetching added
                 here. */
              onOpenReviews ? (
                <button
                  type="button"
                  onClick={onOpenReviews}
                  aria-label="View reviews"
                  className="flex flex-col gap-1.5 w-fit text-left rounded-md -m-1 p-1 cursor-pointer transition-colors hover:bg-muted/60"
                >
                  <span className="text-2xl font-bold tabular-nums">{averageRating.toFixed(1)}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5"
                        fill={i < Math.round(averageRating) ? 'currentColor' : 'none'}
                        strokeWidth={1.5}
                        style={{ color: i < Math.round(averageRating) ? '#f59e0b' : 'var(--muted-foreground)' }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground hover:text-blue-500 transition-colors">
                    {(totalReviewCount ?? 0).toLocaleString()} reviews
                  </span>
                </button>
              ) : (
                <>
                  <span className="text-2xl font-bold tabular-nums">{averageRating.toFixed(1)}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5"
                        fill={i < Math.round(averageRating) ? 'currentColor' : 'none'}
                        strokeWidth={1.5}
                        style={{ color: i < Math.round(averageRating) ? '#f59e0b' : 'var(--muted-foreground)' }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{(totalReviewCount ?? 0).toLocaleString()} reviews</span>
                </>
              )
            ) : (
              <span className="text-xs text-muted-foreground italic">Rating unavailable</span>
            )}
          </div>
        </div>

        {/* Map preview - real Google Maps embed (roads, imagery, business
            pin) whenever we have enough already-fetched location data to
            build one; dot-grid + pin placeholder only as a true fallback
            (no location data at all, or the embed failed to load). Either
            way the whole tile is one click target that opens Google Maps -
            the iframe is pointer-events-none so dragging/zooming it can't
            swallow the click, and Google's own embed already renders its
            own pin, so the custom pin badge is placeholder-only. */}
        <a
          href={mapsUri || undefined}
          target={mapsUri ? '_blank' : undefined}
          rel={mapsUri ? 'noreferrer' : undefined}
          aria-label={mapsUri ? 'Open business location in Google Maps' : undefined}
          className="relative rounded-xl overflow-hidden min-h-[180px] lg:min-h-0 border bg-muted/30 block"
        >
          {showMapEmbed ? (
            <iframe
              key={mapPreviewSrc}
              src={mapPreviewSrc}
              title="Business location map preview"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onError={() => setMapLoadFailed(true)}
              className="absolute inset-0 w-full h-full border-0 pointer-events-none"
            />
          ) : (
            <>
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                  color: 'var(--border)',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20">
                  <MapPin className="h-4 w-4" fill="currentColor" />
                </div>
              </div>
            </>
          )}
        </a>
      </div>
    </Card>
  )
}

function InfoRow({ icon: Icon, children }) {
  return (
    <div className="flex items-start gap-2 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/70" />
      <span>{children}</span>
    </div>
  )
}
