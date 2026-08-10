"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageOff, ShieldAlert } from 'lucide-react'

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'LOGO', label: 'Logo' },
  { value: 'COVER', label: 'Cover' },
  { value: 'INTERIOR', label: 'Interior' },
  { value: 'EXTERIOR', label: 'Exterior' },
  { value: 'PRODUCT', label: 'Products' },
  { value: 'FOOD_AND_DRINK', label: 'Food' },
  { value: 'TEAMS', label: 'Team' },
  { value: 'ADDITIONAL', label: 'Additional' },
]

/**
 * Photo/video gallery, backed by the legacy v4 Media API (see
 * businessProfileMediaService.js). Media access is gated the same way
 * reviews are (Google allowlist, see the forensic research report) - shows
 * an explicit "Unavailable" state with the real reason rather than an empty
 * grid when Google restricts it for this application.
 */
export default function PhotosGalleryCard({ data, loading, category, onCategoryChange }) {
  const media = data?.media || []
  const available = data?.available !== false

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Photos</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Logo, cover, interior, exterior, products, food and team photos</p>
        </div>

        {available && (
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => onCategoryChange(c.value)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                  category === c.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : !available ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-10">
            <ShieldAlert className="h-8 w-8 opacity-40" />
            <p className="text-sm font-medium text-foreground">Photos unavailable</p>
            <p className="text-xs max-w-sm">{data?.reason || 'Google restricts media access for this application.'}</p>
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-10">
            <ImageOff className="h-8 w-8 opacity-40" />
            <p className="text-sm">No photos in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {media.map((item) => (
              <a
                key={item.google_media_key}
                href={item.google_url || item.thumbnail_url || undefined}
                target="_blank"
                rel="noreferrer"
                className="aspect-square rounded-lg overflow-hidden border bg-muted/30 block relative group"
              >
                {item.thumbnail_url || item.google_url ? (
                  <img
                    src={item.thumbnail_url || item.google_url}
                    alt={item.description || item.category}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageOff className="h-5 w-5" />
                  </div>
                )}
                <span className="absolute bottom-1 left-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-black/60 text-white">
                  {item.category}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
