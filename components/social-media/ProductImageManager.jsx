"use client"

import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, RefreshCw, Star, Trash2 } from 'lucide-react'
import { SocialMediaImage } from './SocialMediaImage'
import { ConfirmActionDialog } from './ConfirmActionDialog'
import { ErrorNote, SECONDARY_BUTTON } from './FormField'
import {
  useSocialProduct, useUploadSocialProductImage, useReplaceSocialProductImage, useDeleteSocialProductImage, useUpdateSocialProductImage, useReorderSocialProductImages,
} from '@/hooks/useSocialMediaAI'
import { describeApiError } from '@/lib/socialMedia/failureMessages'
import { IMAGE_ACCEPT, PRODUCT_MAX, imageFileProblem } from '@/lib/socialMedia/catalog'

const ICON_BUTTON = 'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40'

/**
 * A product's images: upload (several at once, one after another, each with its own progress), choose the primary
 * image, reorder, replace, edit the alt text and remove. Every change is a server call that returns the whole
 * updated product, so what is shown is always what the server stored; while one is running the other controls are
 * disabled so two changes can never race. The file is checked here only to give instant feedback — the server
 * validates the real bytes (JPEG / PNG / WEBP, 8 MB, re-encoded without metadata).
 */
export function ProductImageManager({ projectId, productId }) {
  const query = useSocialProduct(projectId, productId)
  const upload = useUploadSocialProductImage(projectId)
  const replace = useReplaceSocialProductImage(projectId)
  const remove = useDeleteSocialProductImage(projectId)
  const update = useUpdateSocialProductImage(projectId)
  const reorder = useReorderSocialProductImages(projectId)

  const [uploads, setUploads] = useState([]) // [{ key, name, progress, error }]
  const [actionError, setActionError] = useState(null)
  const [removing, setRemoving] = useState(null)
  const [replaceTarget, setReplaceTarget] = useState(null)
  const pickRef = useRef(null)
  const replaceRef = useRef(null)

  const product = query.data
  const images = product?.images || []
  const uploading = uploads.some((u) => !u.error)
  const busy = uploading || replace.isPending || remove.isPending || update.isPending || reorder.isPending
  const full = images.length >= PRODUCT_MAX.images

  const patchUpload = (key, patch) => setUploads((list) => list.map((u) => (u.key === key ? { ...u, ...patch } : u)))
  const fail = (error, fallback) => setActionError(describeApiError(error, fallback).message)

  async function onPick(e) {
    const files = Array.from(e.target.files || [])
    e.target.value = '' // the same file can be picked again
    if (!files.length) return
    setActionError(null)
    let room = PRODUCT_MAX.images - images.length
    const rows = files.map((file, i) => ({ key: `${Date.now()}-${i}-${file.name}`, name: file.name, progress: 0, error: null, file }))
    setUploads((list) => [...list.filter((u) => !u.error), ...rows.map(({ file: _file, ...row }) => row)])

    for (const row of rows) {
      const problem = room <= 0 ? `A product can have at most ${PRODUCT_MAX.images} images.` : imageFileProblem(row.file)
      if (problem) { patchUpload(row.key, { error: problem }); continue }
      try {
        // eslint-disable-next-line no-await-in-loop
        await upload.mutateAsync({ productId, file: row.file, onProgress: (progress) => patchUpload(row.key, { progress }) })
        room -= 1
        setUploads((list) => list.filter((u) => u.key !== row.key))
      } catch (error) {
        patchUpload(row.key, { error: describeApiError(error, 'The upload failed.').message })
      }
    }
  }

  function move(index, delta) {
    const order = images.map((i) => i.mediaId)
    const [item] = order.splice(index, 1)
    order.splice(index + delta, 0, item)
    setActionError(null)
    reorder.mutate({ productId, mediaIds: order }, { onError: (error) => fail(error, 'Could not reorder the images.') })
  }

  const makePrimary = (img) => {
    setActionError(null)
    update.mutate({ productId, mediaId: img.mediaId, fields: { isPrimary: true } }, { onError: (error) => fail(error, 'Could not change the primary image.') })
  }

  const saveAlt = (img, value) => {
    const next = value.trim()
    if (next === (img.altText || '')) return
    setActionError(null)
    update.mutate({ productId, mediaId: img.mediaId, fields: { altText: next } }, { onError: (error) => fail(error, 'Could not save the description.') })
  }

  function onReplacePick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    const target = replaceTarget
    setReplaceTarget(null)
    if (!file || !target) return
    const problem = imageFileProblem(file)
    if (problem) { setActionError(problem); return }
    setActionError(null)
    replace.mutate({ productId, mediaId: target.mediaId, file }, { onError: (error) => fail(error, 'The replacement failed.') })
  }

  function confirmRemove() {
    remove.mutate({ productId, mediaId: removing.mediaId }, {
      onSuccess: () => setRemoving(null), // a failure is shown inside the confirmation dialog itself
    })
  }

  return (
    <div data-testid="product-images">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-700">Product images</p>
          <p className="text-xs text-slate-400" data-testid="product-images-count">{images.length} of {PRODUCT_MAX.images} · JPEG, PNG or WEBP, up to 8 MB each</p>
        </div>
        <button type="button" onClick={() => pickRef.current?.click()} disabled={busy || full} className={SECONDARY_BUTTON}>
          <ImagePlus className="h-4 w-4" /> Upload images
        </button>
        <input ref={pickRef} type="file" multiple accept={IMAGE_ACCEPT} onChange={onPick} className="hidden" aria-label="Choose product images" data-testid="product-image-input" />
        <input ref={replaceRef} type="file" accept={IMAGE_ACCEPT} onChange={onReplacePick} className="hidden" aria-label="Choose a replacement image" data-testid="product-image-replace-input" />
      </div>

      {uploads.length > 0 && (
        <ul className="mt-3 space-y-2" data-testid="product-uploads" aria-live="polite">
          {uploads.map((u) => (
            <li key={u.key} className={`rounded-lg border px-3 py-2 text-sm ${u.error ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-slate-700">{u.name}</span>
                {u.error ? (
                  <button type="button" onClick={() => setUploads((list) => list.filter((x) => x.key !== u.key))} className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700" aria-label={`Dismiss ${u.name}`}>Dismiss</button>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-slate-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {u.progress >= 100 ? 'Processing…' : `${u.progress}%`}</span>
                )}
              </div>
              {u.error ? (
                <p role="alert" className="mt-1 text-xs text-red-700">{u.error}</p>
              ) : (
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label={`Uploading ${u.name}`} aria-valuenow={u.progress} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${u.progress}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <ErrorNote className="mt-3">{actionError}</ErrorNote>

      {query.isError && !product ? (
        <p role="alert" className="mt-3 text-sm text-red-600">Couldn&apos;t load the images. {describeApiError(query.error, '').message}</p>
      ) : images.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center" data-testid="product-images-empty">
          <p className="text-sm font-semibold text-slate-700">No images yet.</p>
          <p className="mt-0.5 text-sm text-slate-400">Add a main product photo, then packaging or lifestyle shots.</p>
        </div>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" data-testid="product-images-grid">
          {images.map((img, index) => (
            <li key={img.mediaId} className="flex flex-col gap-2" data-testid={`product-image-${img.mediaId}`}>
              <SocialMediaImage src={img.url} alt={img.altText || product.name} className="aspect-square rounded-xl border border-slate-200">
                {img.isPrimary && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-violet-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow" data-testid="primary-badge">
                    <Star className="h-3 w-3 fill-current" /> Primary
                  </span>
                )}
              </SocialMediaImage>
              <input
                key={`${img.mediaId}-${img.altText}`}
                type="text"
                defaultValue={img.altText || ''}
                maxLength={200}
                placeholder="Describe this image"
                aria-label={`Description for image ${index + 1}`}
                onBlur={(e) => saveAlt(img, e.target.value)}
                disabled={busy}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:opacity-60"
              />
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => move(index, -1)} disabled={busy || index === 0} className={ICON_BUTTON} aria-label={`Move image ${index + 1} earlier`}><ArrowLeft className="h-4 w-4" /></button>
                <button type="button" onClick={() => move(index, 1)} disabled={busy || index === images.length - 1} className={ICON_BUTTON} aria-label={`Move image ${index + 1} later`}><ArrowRight className="h-4 w-4" /></button>
                {!img.isPrimary && (
                  <button type="button" onClick={() => makePrimary(img)} disabled={busy} className={ICON_BUTTON} aria-label={`Make image ${index + 1} the primary image`} title="Make primary"><Star className="h-4 w-4" /></button>
                )}
                <button type="button" onClick={() => { setReplaceTarget(img); replaceRef.current?.click() }} disabled={busy} className={ICON_BUTTON} aria-label={`Replace image ${index + 1}`} title="Replace"><RefreshCw className="h-4 w-4" /></button>
                <button type="button" onClick={() => { remove.reset(); setRemoving(img) }} disabled={busy} className={`${ICON_BUTTON} ml-auto text-red-600 hover:text-red-700`} aria-label={`Remove image ${index + 1}`} title="Remove"><Trash2 className="h-4 w-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {busy && !uploading && <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400" role="status"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</p>}

      <ConfirmActionDialog
        open={!!removing}
        onOpenChange={(open) => { if (!open) setRemoving(null) }}
        title="Remove this image?"
        description="The image is deleted from this product and from storage. This cannot be undone."
        confirmLabel="Remove image"
        cancelLabel="Keep it"
        destructive
        pending={remove.isPending}
        error={removing && remove.isError ? describeApiError(remove.error, 'Could not remove the image.').message : null}
        onConfirm={confirmRemove}
      />
    </div>
  )
}

export default ProductImageManager
