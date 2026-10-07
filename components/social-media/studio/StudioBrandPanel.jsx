"use client"

import Link from 'next/link'
import { MAX_PRODUCT_PHOTOS } from '@/lib/socialMedia/studio'

function Row({ label, children, testId }) {
  return (
    <div className="py-3" data-testid={testId}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1.5 text-sm text-slate-700">{children}</div>
    </div>
  )
}

const SWATCH_LABEL = { primary: 'Primary', secondary: 'Secondary', accent: 'Accent' }

/**
 * Brand settings, read from the real Business Profile / Brand Kit (never edited here): business name, logo, colours, typography, tone and
 * visual guidelines. Anything not configured says so. The format comes from the post's real platform / plan. A product post offers the
 * product's REAL photos to build the design on; nothing about the product is invented.
 */
export function StudioBrandPanel({ studio, photoIds, onPhotosChange, disabled }) {
  const { brand, format, product, service } = studio
  const chosen = photoIds ?? (product?.images || []).filter((i) => i.selected).map((i) => i.mediaId)

  function toggle(mediaId) {
    const next = chosen.includes(mediaId) ? chosen.filter((id) => id !== mediaId) : [...chosen, mediaId].slice(0, MAX_PRODUCT_PHOTOS)
    onPhotosChange(next)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="studio-brand" aria-label="Brand settings">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-slate-900">Brand settings</h3>
        <Link href="/app/social-media/business-profile" className="text-xs font-semibold text-violet-700 hover:text-violet-800">Edit brand</Link>
      </div>
      <div className="mt-2 divide-y divide-slate-100">
        <Row label="Business" testId="brand-name">{brand.businessName || <span className="text-slate-400">Business name not set</span>}</Row>

        <Row label="Logo" testId="brand-logo">
          {brand.logo.available
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={brand.logo.url} alt={`${brand.businessName || 'Business'} logo`} className="h-12 w-auto max-w-full rounded border border-slate-100 bg-slate-50 object-contain p-1" />
            : <span className="text-slate-400" data-testid="brand-logo-empty">No logo available</span>}
        </Row>

        <Row label="Brand colors" testId="brand-colors">
          {brand.colors.configured ? (
            <ul className="flex flex-wrap gap-3">
              {Object.keys(SWATCH_LABEL).filter((k) => brand.colors[k]).map((k) => (
                <li key={k} className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full border border-slate-200" style={{ backgroundColor: brand.colors[k] }} aria-hidden />
                  <span className="text-xs text-slate-600">{SWATCH_LABEL[k]} <span className="text-slate-400">{brand.colors[k]}</span></span>
                </li>
              ))}
            </ul>
          ) : <span className="text-slate-400" data-testid="brand-colors-empty">Brand colors not configured</span>}
        </Row>

        <Row label="Typography" testId="brand-fonts">
          {brand.fonts.isDefault
            ? <span data-testid="brand-fonts-default">Default typography</span>
            : <span>{[brand.fonts.heading && `Headings: ${brand.fonts.heading}`, brand.fonts.body && `Body: ${brand.fonts.body}`].filter(Boolean).join(' · ')}</span>}
        </Row>

        {(brand.tone || brand.voice) && <Row label="Tone" testId="brand-tone">{[brand.tone, brand.voice].filter(Boolean).join(' · ')}</Row>}

        {brand.visualGuidelines.length > 0 && (
          <Row label="Visual guidelines" testId="brand-guidelines">
            <ul className="list-disc space-y-0.5 pl-4">{brand.visualGuidelines.map((g) => <li key={g}>{g}</li>)}</ul>
          </Row>
        )}

        <Row label="Format" testId="brand-format">
          <p className="font-medium text-slate-800">{format.label}</p>
          {format.note && <p className="mt-1 text-xs text-slate-500">{format.note}</p>}
        </Row>

        {service?.name && <Row label="Service" testId="brand-service">{service.name}</Row>}

        {product && (
          <Row label={`Product photos · ${product.name}`} testId="brand-product">
            {product.images.length === 0 ? (
              <p className="text-xs text-slate-500" data-testid="product-no-photos">This product has no photos, so its design cannot show the product. Add a photo in your <Link href="/app/social-media/business-profile" className="font-semibold text-violet-700">product catalog</Link>.</p>
            ) : (
              <>
                <p className="mb-2 text-xs text-slate-500">The design is built on the photos you choose (up to {MAX_PRODUCT_PHOTOS}).</p>
                <ul className="grid grid-cols-3 gap-2">
                  {product.images.map((img) => {
                    const on = chosen.includes(img.mediaId)
                    return (
                      <li key={img.mediaId}>
                        <button type="button" onClick={() => toggle(img.mediaId)} disabled={disabled} aria-pressed={on} aria-label={`${on ? 'Do not use' : 'Use'} ${img.altText || 'product photo'}`} data-testid={`product-photo-${img.mediaId}`} data-selected={on ? 'true' : 'false'} className={`block w-full overflow-hidden rounded-lg border-2 bg-slate-50 ${on ? 'border-violet-500' : 'border-transparent'} disabled:opacity-60`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt={img.altText || 'Product photo'} className="aspect-square w-full object-cover" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </Row>
        )}
      </div>
    </section>
  )
}

export default StudioBrandPanel
