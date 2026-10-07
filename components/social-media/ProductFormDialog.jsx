"use client"

import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Field, INPUT, PRIMARY_BUTTON, SECONDARY_BUTTON, ErrorNote } from './FormField'
import { ProductImageManager } from './ProductImageManager'
import { ProductPreviewCard, previewPrice } from './ProductPreviewCard'
import { useCreateSocialProduct, useUpdateSocialProduct, useSocialProduct } from '@/hooks/useSocialMediaAI'
import { describeApiError } from '@/lib/socialMedia/failureMessages'
import {
  PRODUCT_MAX, STATUS_OPTIONS, CURRENCY_SUGGESTIONS, productToDraft, draftToProductPayload, productDraftProblems,
} from '@/lib/socialMedia/catalog'

/**
 * Add / edit a product. Creating saves the product first (images need a product to belong to); the dialog then
 * stays open as the editor for that product with the image manager available, so "create, then add images" is one
 * continuous flow. The right-hand preview is built from the form as typed. The server re-validates everything
 * (the checks here are instant feedback only) and the product shown after a save is what the server returned.
 */
export function ProductFormDialog({ projectId, product = null, onClose }) {
  const create = useCreateSocialProduct(projectId)
  const update = useUpdateSocialProduct(projectId)
  const [savedId, setSavedId] = useState(product?.id || null)
  const [draft, setDraft] = useState(() => productToDraft(product))
  const [touched, setTouched] = useState(false)
  const [justCreated, setJustCreated] = useState(false)
  const imagesRef = useRef(null)

  const live = useSocialProduct(projectId, savedId).data || product // freshest saved product (its images)
  const problems = touched ? productDraftProblems(draft) : {}
  const pending = create.isPending || update.isPending
  const mutationError = (create.isError ? create.error : update.isError ? update.error : null)
  const error = mutationError ? describeApiError(mutationError, 'Could not save the product.').message : null
  const dirty = JSON.stringify(draft) !== JSON.stringify(productToDraft(live))
  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }))

  function submit(e) {
    e.preventDefault()
    setTouched(true)
    if (pending || Object.keys(productDraftProblems(draft)).length) return
    const fields = draftToProductPayload(draft)
    if (savedId) {
      update.mutate({ productId: savedId, fields }, { onSuccess: (res) => setDraft(productToDraft(res?.data?.product)) })
    } else {
      create.mutate(fields, {
        onSuccess: (res) => {
          const created = res?.data?.product
          if (!created) return
          setSavedId(created.id)
          setDraft(productToDraft(created))
          setJustCreated(true)
          setTimeout(() => imagesRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }), 50)
        },
      })
    }
  }

  const primary = live?.images?.find((i) => i.isPrimary) || live?.images?.[0]

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !pending) onClose() }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-slate-200 bg-white text-slate-800 sm:max-w-5xl" data-testid="product-dialog">
        <DialogHeader>
          <DialogTitle className="text-slate-900">{savedId ? 'Edit product' : 'Add a product'}</DialogTitle>
          <DialogDescription className="text-slate-500">
            Products you add here are the only products Social AI will talk about. Nothing is taken from Google or your website.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-6">
            <form onSubmit={submit} className="flex flex-col gap-4" data-testid="product-form" noValidate>
              <Field label="Product name" htmlFor="pr-name" error={problems.name}>
                <input id="pr-name" type="text" maxLength={PRODUCT_MAX.name} value={draft.name} onChange={set('name')} aria-invalid={!!problems.name} className={INPUT} />
              </Field>
              <Field label="Short description" htmlFor="pr-short" hint="One line shown on the product card">
                <input id="pr-short" type="text" maxLength={PRODUCT_MAX.shortDescription} value={draft.shortDescription} onChange={set('shortDescription')} className={INPUT} />
              </Field>
              <Field label="Description" htmlFor="pr-description">
                <textarea id="pr-description" rows={4} maxLength={PRODUCT_MAX.description} value={draft.description} onChange={set('description')} className={`${INPUT} resize-none`} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Category" htmlFor="pr-category"><input id="pr-category" type="text" maxLength={PRODUCT_MAX.category} value={draft.category} onChange={set('category')} className={INPUT} /></Field>
                <Field label="Subcategory" htmlFor="pr-subcategory"><input id="pr-subcategory" type="text" maxLength={PRODUCT_MAX.subcategory} value={draft.subcategory} onChange={set('subcategory')} className={INPUT} /></Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Features" htmlFor="pr-features" hint="One per line (up to 10)"><textarea id="pr-features" rows={3} value={draft.features} onChange={set('features')} className={`${INPUT} resize-none`} /></Field>
                <Field label="Benefits" htmlFor="pr-benefits" hint="One per line (up to 10)"><textarea id="pr-benefits" rows={3} value={draft.benefits} onChange={set('benefits')} className={`${INPUT} resize-none`} /></Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Price" htmlFor="pr-price" error={problems.price} hint="Optional"><input id="pr-price" type="text" inputMode="decimal" value={draft.price} onChange={set('price')} aria-invalid={!!problems.price} className={INPUT} /></Field>
                <Field label="Sale price" htmlFor="pr-sale" error={problems.salePrice} hint="Optional"><input id="pr-sale" type="text" inputMode="decimal" value={draft.salePrice} onChange={set('salePrice')} aria-invalid={!!problems.salePrice} className={INPUT} /></Field>
                <Field label="Currency" htmlFor="pr-currency" error={problems.currency} hint="e.g. INR, USD">
                  <input id="pr-currency" type="text" list="pr-currencies" maxLength={3} value={draft.currency} onChange={(e) => setDraft((d) => ({ ...d, currency: e.target.value.toUpperCase() }))} aria-invalid={!!problems.currency} className={INPUT} />
                  <datalist id="pr-currencies">{CURRENCY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}</datalist>
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Product URL" htmlFor="pr-url" hint="Optional"><input id="pr-url" type="text" maxLength={PRODUCT_MAX.url} value={draft.productUrl} onChange={set('productUrl')} placeholder="shop.example.com/product" className={INPUT} /></Field>
                <Field label="SKU" htmlFor="pr-sku" hint="Optional"><input id="pr-sku" type="text" maxLength={PRODUCT_MAX.sku} value={draft.sku} onChange={set('sku')} className={INPUT} /></Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Tags" htmlFor="pr-tags" hint="Separated by commas"><input id="pr-tags" type="text" value={draft.tags} onChange={set('tags')} className={INPUT} /></Field>
                <Field label="Status" htmlFor="pr-status" hint={STATUS_OPTIONS.find((s) => s.value === draft.status)?.hint}>
                  <select id="pr-status" value={draft.status} onChange={set('status')} className={INPUT}>
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Field>
              </div>

              <ErrorNote>{error}</ErrorNote>
              {justCreated && !dirty && <p role="status" className="text-sm font-medium text-emerald-600" data-testid="product-created">Product saved. You can add images below.</p>}

              <div className="flex items-center justify-end gap-3">
                {!justCreated && savedId && !dirty && !pending && update.isSuccess && <span role="status" className="text-sm font-medium text-emerald-600">Saved</span>}
                {dirty && !pending && savedId && <span className="text-xs text-slate-400">Unsaved changes</span>}
                <button type="button" onClick={onClose} disabled={pending} className={SECONDARY_BUTTON}>{savedId ? 'Close' : 'Cancel'}</button>
                <button type="submit" disabled={pending || (!!savedId && !dirty)} className={PRIMARY_BUTTON}>
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {pending ? 'Saving…' : savedId ? 'Save product' : 'Create product'}
                </button>
              </div>
            </form>

            <div ref={imagesRef} className="border-t border-slate-100 pt-5">
              {savedId ? (
                <ProductImageManager projectId={projectId} productId={savedId} />
              ) : (
                <div data-testid="product-images-locked">
                  <p className="text-sm font-medium text-slate-700">Product images</p>
                  <p className="mt-1 text-sm text-slate-400">Create the product first, then upload its images here.</p>
                </div>
              )}
            </div>
          </div>

          <aside className="hidden lg:block" aria-label="Product preview">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Preview</p>
            <ProductPreviewCard
              testId="product-preview"
              name={draft.name}
              category={draft.category}
              description={draft.shortDescription || draft.description}
              imageUrl={primary?.url || null}
              imageAlt={primary?.altText}
              price={previewPrice(draft.price, draft.currency)}
              salePrice={previewPrice(draft.salePrice, draft.currency)}
              status={draft.status}
              productUrl={null}
            />
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProductFormDialog
