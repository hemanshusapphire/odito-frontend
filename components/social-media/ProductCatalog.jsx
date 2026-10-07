"use client"

import { useState } from 'react'
import { ImageIcon, Package, Pencil, Plus, Trash2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmActionDialog } from './ConfirmActionDialog'
import { ProductFormDialog } from './ProductFormDialog'
import { ProductPreviewCard } from './ProductPreviewCard'
import { PRIMARY_BUTTON } from './FormField'
import { useSocialProducts, useDeleteSocialProduct } from '@/hooks/useSocialMediaAI'
import { describeApiError } from '@/lib/socialMedia/failureMessages'
import { PRODUCT_MAX, STATUS_OPTIONS } from '@/lib/socialMedia/catalog'

const FILTERS = [{ value: 'all', label: 'All' }, ...STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))]

/**
 * The Product Catalog for a PRODUCT business: the products Social AI may talk about, with their images. Real data
 * only — an empty catalog is an empty state, never sample products — and nothing is ever imported from Google or the
 * website. Server state lives in React Query (useSocialProducts); adding, editing and deleting go through the
 * product API and the list shown is what the server returned.
 */
export function ProductCatalog({ projectId }) {
  const query = useSocialProducts(projectId)
  const del = useDeleteSocialProduct(projectId)
  const [editing, setEditing] = useState(null) // null | 'new' | product
  const [deleting, setDeleting] = useState(null)
  const [filter, setFilter] = useState('all')

  const products = query.data?.products || []
  const shown = filter === 'all' ? products : products.filter((p) => p.status === filter)
  const atLimit = products.length >= PRODUCT_MAX.products

  function confirmDelete() {
    del.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="product-catalog" aria-labelledby="products-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="products-title" className="text-base font-bold text-slate-900">Products</h3>
          <p className="mt-1 text-sm text-slate-500">The products you sell. Social AI will only talk about the active products you add here.</p>
        </div>
        <button type="button" onClick={() => setEditing('new')} disabled={atLimit || query.isLoading} className={PRIMARY_BUTTON}>
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      {products.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter products by status">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${filter === f.value ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {query.isLoading ? (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="products-loading" aria-busy="true">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-72 rounded-2xl bg-slate-200" />)}
        </div>
      ) : query.isError && !query.data ? (
        <div role="alert" className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center" data-testid="products-error">
          <p className="text-sm font-semibold text-red-700">Couldn&apos;t load your products</p>
          <p className="max-w-md text-sm text-red-600/90">{describeApiError(query.error, 'The request to Odito failed. Nothing was changed.').message}</p>
          <button type="button" onClick={() => query.refetch()} disabled={query.isFetching} className="mt-1 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-70">
            {query.isFetching ? 'Retrying…' : 'Try again'}
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 px-4 py-12 text-center" data-testid="products-empty">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Package className="h-5 w-5" /></span>
          <div>
            <p className="text-sm font-semibold text-slate-700">No products added yet.</p>
            <p className="mt-0.5 max-w-sm text-sm text-slate-400">Add your products with their details and photos so your strategy and posts are about what you really sell.</p>
          </div>
          <button type="button" onClick={() => setEditing('new')} className={PRIMARY_BUTTON}><Plus className="h-4 w-4" /> Add product</button>
        </div>
      ) : shown.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400" data-testid="products-filter-empty">No {filter} products.</p>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="products-grid">
          {shown.map((p) => (
            <li key={p.id}>
              <ProductPreviewCard
                testId={`product-${p.id}`}
                name={p.name}
                category={p.category}
                description={p.shortDescription || p.description}
                imageUrl={p.primaryImageUrl}
                imageAlt={p.images.find((i) => i.isPrimary)?.altText || p.name}
                price={p.priceDisplay}
                salePrice={p.salePriceDisplay}
                status={p.status}
                productUrl={p.productUrl}
                actions={(
                  <>
                    <button type="button" onClick={() => setEditing(p)} className="inline-flex items-center gap-1 font-medium text-violet-600 hover:text-violet-700" aria-label={`Edit ${p.name}`}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button type="button" onClick={() => setEditing(p)} className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900" aria-label={`Manage images for ${p.name}`}>
                      <ImageIcon className="h-3.5 w-3.5" /> Images ({p.images.length})
                    </button>
                    <button type="button" onClick={() => { del.reset(); setDeleting(p) }} className="ml-auto inline-flex items-center gap-1 font-medium text-red-600 hover:text-red-700" aria-label={`Delete ${p.name}`}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </>
                )}
              />
            </li>
          ))}
        </ul>
      )}
      {atLimit && <p className="mt-3 text-xs text-slate-400">You have reached the limit of {PRODUCT_MAX.products} products.</p>}

      {editing && (
        <ProductFormDialog
          key={editing === 'new' ? 'new' : editing.id}
          projectId={projectId}
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmActionDialog
        open={!!deleting}
        onOpenChange={(open) => { if (!open) setDeleting(null) }}
        title="Delete this product?"
        description={deleting ? `"${deleting.name}" and its ${deleting.images.length} image${deleting.images.length === 1 ? '' : 's'} will be deleted. Posts already created are not changed.` : ''}
        confirmLabel="Delete product"
        cancelLabel="Keep it"
        destructive
        pending={del.isPending}
        error={deleting && del.isError ? describeApiError(del.error, 'Could not delete the product.').message : null}
        onConfirm={confirmDelete}
      />
    </section>
  )
}

export default ProductCatalog
