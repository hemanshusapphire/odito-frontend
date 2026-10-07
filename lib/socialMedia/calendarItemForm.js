/**
 * Pure logic for the calendar item editor: the form model, what changed, and the client-side checks.
 *
 * The SERVER is the authority (odito_backend calendarItemRules.js): every rule here is a courtesy that tells the user
 * something is wrong before a round trip, and mirrors the server's rule. Anything the server refuses is shown too (see
 * `serverFieldErrors`), so a rule that exists only on the server still reaches the user. Nothing here invents data: choices
 * come from the options the server sends (strategy pillars, live catalog, connected platforms).
 */
import { DateTime } from 'luxon'

export const PLATFORM_LABEL = Object.freeze({ facebook: 'Facebook', instagram: 'Instagram' })
export const PURCHASE_CTA_RE = /\b(buy|shop|order|purchase|add to cart|get yours|checkout|book now|buy now)\b/i
const HASHTAG_RE = /^[\p{L}\p{N}_]{1,50}$/u

/** The fields the AI can rewrite, in the order the modal shows them. */
export const REGEN_FIELDS = Object.freeze(['topic', 'angle', 'hook', 'caption', 'hashtags', 'captionDirection', 'primaryCta', 'creativeDirection', 'contentBrief', 'engagementPrompt', 'onCreativeText'])
export const REGEN_FIELD_LABELS = Object.freeze({
  topic: 'Topic', angle: 'Angle', hook: 'Hook', caption: 'Caption', hashtags: 'Hashtags', captionDirection: 'Caption direction', primaryCta: 'Call to action', creativeDirection: 'Creative direction',
  contentBrief: 'Content brief', engagementPrompt: 'Engagement prompt', onCreativeText: 'Text on the creative',
})

const TEXT = ['targetAudience', 'occasion', 'topic', 'angle', 'hook', 'onCreativeText', 'creativeDirection', 'contentBrief', 'captionDirection', 'caption', 'primaryCta', 'engagementPrompt', 'approvalNotes', 'footerDisclaimer']

const platformCopyOf = (item, platform) => {
  const found = (item.platformContent || []).find((p) => p.platform === platform)
  return { caption: found?.caption || '', primaryCta: found?.primaryCta || '', hashtags: [...(found?.hashtags || [])] }
}

/** The form's value for an existing item. Platform copy is keyed by platform so each tab edits its own entry. */
export function itemToForm(item) {
  return {
    date: item.date, platforms: [...item.platforms], format: item.format, contentPillar: item.contentPillar, objective: item.objective, primaryKpi: item.primaryKpi,
    targetAudience: item.targetAudience || '', serviceId: item.serviceId || '', productId: item.productId || '', occasion: item.occasion || '',
    topic: item.topic || '', angle: item.angle || '', hook: item.hook || '', onCreativeText: item.onCreativeText || '', creativeDirection: item.creativeDirection || '',
    contentBrief: item.contentBrief || '', captionDirection: item.captionDirection || '', caption: item.caption || '', hashtags: [...(item.hashtags || [])],
    primaryCta: item.primaryCta || '', engagementPrompt: item.engagementPrompt || '', requiredAssets: [...(item.requiredAssets || [])],
    selectedMediaIds: [...(item.selectedMediaIds || [])],
    platformContent: { facebook: platformCopyOf(item, 'facebook'), instagram: platformCopyOf(item, 'instagram') },
    requiresReview: !!item.requiresReview, approvalNotes: item.approvalNotes || '', footerDisclaimer: item.footerDisclaimer || '',
  }
}

/** Defaults for a NEW (manual) item: the first date of the calendar that is not in the past, the first connected platform, the strategy's first pillar. */
export function newItemForm(options) {
  const today = DateTime.local().toFormat('yyyy-LL-dd')
  const start = options?.calendar?.startDate || today
  const end = options?.calendar?.endDate || start
  let date = today > start ? today : start
  if (date > end) date = end
  const firstPlatform = (options?.platforms || []).find((p) => p.connected && p.inStrategy)?.platform
  const objective = options?.objectives?.[0]
  return itemToForm({
    date, platforms: firstPlatform ? [firstPlatform] : [], format: 'static_post', contentPillar: options?.pillars?.[0]?.name || '', objective: objective?.value || 'awareness',
    primaryKpi: objective?.kpis?.[0] || 'reach', platformContent: [],
  })
}

/** Formats every selected platform supports (the server sends the per-platform lists; a format must exist on all of them). */
export function supportedFormats(platforms, options) {
  const lists = platforms.map((p) => options?.formats?.[p]).filter(Boolean)
  if (!lists.length) return Object.values(options?.formats || {})[0] || []
  return lists[0].filter((f) => lists.every((l) => l.includes(f)))
}

export function normalizeTag(raw) {
  const tag = String(raw ?? '').trim().replace(/^#+/, '')
  return HASHTAG_RE.test(tag) ? `#${tag}` : null
}

const norm = (v) => (typeof v === 'string' ? v.replace(/\r\n/g, '\n').trim() : v)
const sameList = (a, b) => a.length === b.length && a.every((x, i) => x === b[i])

/** Per-platform copy as the API wants it: only platforms the post targets, and only entries that say something. */
export function platformContentPayload(form) {
  return form.platforms
    .map((platform) => ({ platform, caption: norm(form.platformContent[platform]?.caption || ''), primaryCta: norm(form.platformContent[platform]?.primaryCta || ''), hashtags: form.platformContent[platform]?.hashtags || [] }))
    .filter((p) => p.caption || p.primaryCta || p.hashtags.length)
}

/** Only what the user changed, in API shape (a save sends nothing else). `base` is the form built from the item as saved. */
export function formToPatch(form, base) {
  const patch = {}
  for (const f of TEXT) if (norm(form[f]) !== norm(base[f])) patch[f] = norm(form[f])
  for (const f of ['date', 'format', 'contentPillar', 'objective', 'primaryKpi']) if (form[f] !== base[f]) patch[f] = form[f]
  if (!sameList(form.platforms, base.platforms)) patch.platforms = form.platforms
  if ((form.serviceId || null) !== (base.serviceId || null)) patch.serviceId = form.serviceId || null
  if ((form.productId || null) !== (base.productId || null)) patch.productId = form.productId || null
  for (const f of ['hashtags', 'requiredAssets', 'selectedMediaIds']) if (!sameList(form[f], base[f])) patch[f] = form[f]
  if (form.requiresReview !== base.requiresReview) patch.requiresReview = form.requiresReview
  if (JSON.stringify(platformContentPayload(form)) !== JSON.stringify(platformContentPayload(base))) patch.platformContent = platformContentPayload(form)
  // changing the product also changes which images are valid: send the (possibly cleared) selection with it
  if ('productId' in patch && !('selectedMediaIds' in patch)) patch.selectedMediaIds = form.selectedMediaIds
  return patch
}

export const isDirty = (form, base) => Object.keys(formToPatch(form, base)).length > 0

/** Length of the final text of a platform (caption + hashtags), the way the server counts it. */
export function textLength(form, platform) {
  const pc = form.platformContent[platform] || {}
  const caption = norm(pc.caption || '') || norm(form.caption || '')
  const tags = pc.hashtags?.length ? pc.hashtags : form.hashtags
  return caption.length + (tags.length ? 2 + tags.join(' ').length : 0)
}

/**
 * Courtesy checks that mirror the server. Returns { field: message }; empty means "looks fine to send".
 * `connected` platforms are only required for platforms that were ADDED (an existing one is never re-checked).
 */
export function validateForm(form, options, { base = null, today = DateTime.local().toFormat('yyyy-LL-dd') } = {}) {
  const errors = {}
  if (!norm(form.topic)) errors.topic = 'Add a topic.'
  if (!form.platforms.length) errors.platforms = 'Choose at least one platform.'
  for (const p of form.platforms.filter((x) => !(base?.platforms || []).includes(x))) {
    const info = (options?.platforms || []).find((o) => o.platform === p)
    if (info && !info.connected) errors.platforms = `Connect your ${PLATFORM_LABEL[p]} before planning content for it.`
    else if (info && !info.inStrategy) errors.platforms = `Your strategy does not cover ${PLATFORM_LABEL[p]}.`
  }
  if (form.platforms.length && !supportedFormats(form.platforms, options).includes(form.format)) errors.format = 'That format is not available on every selected platform.'
  if (!form.date || !DateTime.fromISO(form.date).isValid) errors.date = 'Choose a valid date.'
  else if (!base || form.date !== base.date) {
    const { startDate, endDate } = options?.calendar || {}
    if (startDate && (form.date < startDate || form.date > endDate)) errors.date = `Choose a date between ${startDate} and ${endDate}.`
    else if (form.date < DateTime.fromISO(today).minus({ days: 1 }).toFormat('yyyy-LL-dd')) errors.date = 'The planned date cannot be in the past.'
  }
  const objective = (options?.objectives || []).find((o) => o.value === form.objective)
  if (objective && !objective.kpis.includes(form.primaryKpi)) errors.primaryKpi = `Choose a KPI that measures ${objective.value.replace('_', ' ')}.`
  const purchase = (cta) => PURCHASE_CTA_RE.test(cta || '') && form.objective !== 'conversion'
  if (purchase(form.primaryCta)) errors.primaryCta = 'A purchase call to action only suits a conversion objective.'
  for (const p of form.platforms) {
    if (purchase(form.platformContent[p]?.primaryCta)) errors[`platformContent.${p}.primaryCta`] = 'A purchase call to action only suits a conversion objective.'
    const limit = options?.limits?.caption?.[p]
    const tagLimit = options?.limits?.hashtags?.[p]
    const tags = form.platformContent[p]?.hashtags?.length ? form.platformContent[p].hashtags : form.hashtags
    if (tagLimit && tags.length > tagLimit) errors[`platformContent.${p}.hashtags`] = `${PLATFORM_LABEL[p]} posts can have at most ${tagLimit} hashtags.`
    if (limit && textLength(form, p) > limit) errors[`platformContent.${p}.caption`] = `The ${PLATFORM_LABEL[p]} caption with hashtags is ${textLength(form, p)} characters; the limit is ${limit}.`
  }
  const fieldMax = options?.limits?.fields || {}
  for (const f of TEXT) if (fieldMax[f] && norm(form[f]).length > fieldMax[f]) errors[f] = `Keep this under ${fieldMax[f]} characters.`
  return errors
}

/** The server's own field messages (`error.details.fields`), so a rule that only the server knows still reaches the field. */
export function serverFieldErrors(error) {
  const fields = error?.details?.fields
  return fields && typeof fields === 'object' ? { ...fields } : {}
}

/** Hooks of the strategy as options for a "choose a hook" picker. */
export const hookIndexOf = (hook, options) => (options?.hooks || []).findIndex((h) => h.hook === hook)
