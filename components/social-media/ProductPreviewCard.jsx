"use client"

import { ExternalLink } from 'lucide-react'
import { SocialMediaImage } from './SocialMediaImage'

/** A price for the live preview only (the saved product's price text comes from the server as `priceDisplay`). */
export function previewPrice(amount, currency) {
  const n = typeof amount === 'string' ? Number(amount) : amount
  if (amount === '' || amount === null || amount === undefined || !Number.isFinite(n)) return null
  if (!currency || !/^[A-Za-z]{3}$/.test(currency)) return String(n)
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase(), minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
  } catch {
    return `${currency.toUpperCase()} ${n}`
  }
}

/**
 * How a product reads: image, name, category, short description and price (a sale price shows the regular price
 * struck through). Used for the catalog grid and, fed from the form draft, as the live preview in the editor.
 * `actions` renders under the text (the catalog's Edit / Manage images / Delete).
 */
export function ProductPreviewCard({ name, category, description, imageUrl, imageAlt, price, salePrice, status, productUrl, actions = null, testId }) {
  const shownPrice = salePrice || price
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" data-testid={testId}>
      <SocialMediaImage src={imageUrl} alt={imageAlt || name || 'Product image'} className="aspect-[4/3] border-b border-slate-100">
        {status && status !== 'active' && (
          <span className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] font-medium capitalize text-white">{status}</span>
        )}
      </SocialMediaImage>
      <div className="flex flex-1 flex-col p-4">
        <h4 className="line-clamp-2 text-sm font-semibold text-slate-900">{name || 'Untitled product'}</h4>
        {category && <p className="mt-0.5 text-xs text-slate-400">{category}</p>}
        {description && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{description}</p>}
        {shownPrice && (
          <p className="mt-3 flex items-baseline gap-2" data-testid={testId ? `${testId}-price` : undefined}>
            <span className="text-base font-bold text-slate-900">{shownPrice}</span>
            {salePrice && price && <span className="text-sm text-slate-400 line-through">{price}</span>}
          </p>
        )}
        {productUrl && (
          <a href={productUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
            <ExternalLink className="h-3 w-3" /> Product page
          </a>
        )}
        {actions && <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-sm">{actions}</div>}
      </div>
    </article>
  )
}

export default ProductPreviewCard
