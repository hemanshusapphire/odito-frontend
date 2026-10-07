/**
 * Helpers for the Social Media AI catalog UI: services (embedded in the business profile) and products
 * (GET/POST /social/products). Nothing here decides a value — the backend validates, normalises and stores
 * everything; this file only maps between form fields and API payloads and does the cheap checks that give instant
 * feedback (the server is authoritative and re-checks all of it).
 */
import { linesToList, listToLines, blankToNull } from '@/lib/socialMedia/businessProfile'

// Mirrors the server limits (socialProductService LIMITS / socialBusinessProfileService LIMITS).
export const PRODUCT_MAX = Object.freeze({
  name: 150, description: 2000, shortDescription: 300, category: 100, subcategory: 100, sku: 64, url: 500, images: 8, products: 100,
})
export const SERVICE_MAX = Object.freeze({ name: 150, description: 1000, category: 100, url: 500, services: 30 })

export const IMAGE_MAX_BYTES = 8 * 1024 * 1024
export const IMAGE_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp'])
export const IMAGE_ACCEPT = IMAGE_TYPES.join(',')

/** Suggestions for the currency box (any ISO 4217 code is accepted; the server checks it is a real one). */
export const CURRENCY_SUGGESTIONS = Object.freeze(['INR', 'USD', 'EUR', 'GBP', 'AED', 'AUD', 'CAD', 'SGD', 'JPY'])

export const STATUS_OPTIONS = Object.freeze([
  { value: 'active', label: 'Active', hint: 'Used by Social AI.' },
  { value: 'draft', label: 'Draft', hint: 'Saved, but not used yet.' },
  { value: 'archived', label: 'Archived', hint: 'Kept, but not used.' },
])
export const statusLabel = (value) => STATUS_OPTIONS.find((s) => s.value === value)?.label || 'Active'

/** A quick client-side check of a picked image. Returns a message, or null when it looks fine (the server re-checks the real bytes). */
export function imageFileProblem(file) {
  if (!file) return 'Choose an image to upload.'
  if (!IMAGE_TYPES.includes(file.type)) return 'Only JPEG, PNG or WEBP images are allowed.'
  if (file.size > IMAGE_MAX_BYTES) return 'Images must be 8MB or smaller.'
  if (file.size === 0) return 'That file is empty.'
  return null
}

/** Tags are typed as a comma separated line. */
export const tagsToText = (tags) => (Array.isArray(tags) ? tags.join(', ') : '')
export const textToTags = (text) => (text || '').split(/[,\n]/).map((t) => t.trim()).filter(Boolean)

// ── products ────────────────────────────────────────────────────────────────

export const EMPTY_PRODUCT_DRAFT = Object.freeze({
  name: '', description: '', shortDescription: '', category: '', subcategory: '', features: '', benefits: '',
  price: '', salePrice: '', currency: '', productUrl: '', sku: '', tags: '', status: 'active',
})

const moneyText = (n) => (typeof n === 'number' ? String(n) : '')

export function productToDraft(product) {
  if (!product) return { ...EMPTY_PRODUCT_DRAFT }
  return {
    name: product.name || '', description: product.description || '', shortDescription: product.shortDescription || '',
    category: product.category || '', subcategory: product.subcategory || '',
    features: listToLines(product.features), benefits: listToLines(product.benefits),
    price: moneyText(product.price), salePrice: moneyText(product.salePrice), currency: product.currency || '',
    productUrl: product.productUrl || '', sku: product.sku || '', tags: tagsToText(product.tags), status: product.status || 'active',
  }
}

/** The create / PATCH body. Blank optional fields are sent as null so clearing a field clears it on the server. Images are never part of it. */
export function draftToProductPayload(d) {
  return {
    name: d.name,
    description: d.description,
    shortDescription: d.shortDescription,
    category: blankToNull(d.category),
    subcategory: blankToNull(d.subcategory),
    features: linesToList(d.features),
    benefits: linesToList(d.benefits),
    price: blankToNull(d.price),
    salePrice: blankToNull(d.salePrice),
    currency: blankToNull(d.currency) ? String(d.currency).trim().toUpperCase() : null,
    productUrl: blankToNull(d.productUrl),
    sku: blankToNull(d.sku),
    tags: textToTags(d.tags),
    status: d.status,
  }
}

/** Instant feedback only; returns { field: message } for what is obviously wrong. */
export function productDraftProblems(d) {
  const problems = {}
  if (!d.name.trim()) problems.name = 'Give the product a name.'
  const amount = (v) => /^\d{1,10}(\.\d{1,2})?$/.test(v.trim())
  if (d.price.trim() && !amount(d.price)) problems.price = 'Enter a number such as 999 or 19.99.'
  if (d.salePrice.trim() && !amount(d.salePrice)) problems.salePrice = 'Enter a number such as 799 or 14.99.'
  if (!problems.price && !problems.salePrice) {
    if (d.salePrice.trim() && !d.price.trim()) problems.salePrice = 'A sale price needs a regular price.'
    else if (d.salePrice.trim() && Number(d.salePrice) > Number(d.price)) problems.salePrice = 'The sale price cannot be higher than the price.'
  }
  if ((d.price.trim() || d.salePrice.trim()) && !d.currency.trim()) problems.currency = 'Choose a currency for the price.'
  if (d.currency.trim() && !/^[A-Za-z]{3}$/.test(d.currency.trim())) problems.currency = 'Use a 3-letter code such as USD.'
  return problems
}

// ── services ────────────────────────────────────────────────────────────────

export const EMPTY_SERVICE_DRAFT = Object.freeze({ name: '', description: '', category: '', features: '', benefits: '', serviceUrl: '', tags: '', status: 'active' })

export function serviceToDraft(service) {
  if (!service) return { ...EMPTY_SERVICE_DRAFT }
  return {
    name: service.name || '', description: service.description || '', category: service.category || '',
    features: listToLines(service.features), benefits: listToLines(service.benefits),
    serviceUrl: service.serviceUrl || '', tags: tagsToText(service.tags), status: service.status || 'active',
  }
}

/** One service as the profile PUT expects it (`id` only for an existing service, so it keeps its identity). */
export function draftToServicePayload(d, id = null) {
  return {
    ...(id ? { id } : {}),
    name: d.name,
    description: d.description,
    category: blankToNull(d.category),
    features: linesToList(d.features),
    benefits: linesToList(d.benefits),
    serviceUrl: blankToNull(d.serviceUrl),
    tags: textToTags(d.tags),
    status: d.status,
  }
}

/** An existing saved service back into a PUT entry (the whole list is replaced on save). */
export const serviceToPayload = (service) => ({
  id: service.id, name: service.name, description: service.description || '', category: service.category ?? null,
  features: service.features || [], benefits: service.benefits || [], serviceUrl: service.serviceUrl ?? null, tags: service.tags || [], status: service.status || 'active',
})
