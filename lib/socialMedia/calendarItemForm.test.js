import { describe, it, expect } from 'vitest'
import {
  itemToForm, newItemForm, formToPatch, isDirty, validateForm, supportedFormats, normalizeTag, textLength, platformContentPayload, serverFieldErrors, hookIndexOf,
} from './calendarItemForm'
import { calendarItem, calendarOptions } from '@/test-utils/socialMediaPlan'

const options = calendarOptions()
const item = (over) => calendarItem({ platforms: ['facebook'], date: '2026-10-07', ...over })

describe('itemToForm / formToPatch — only what the user changed is sent', () => {
  it('an untouched form has no patch and is not dirty', () => {
    const base = itemToForm(item())
    expect(formToPatch(itemToForm(item()), base)).toEqual({})
    expect(isDirty(itemToForm(item()), base)).toBe(false)
  })

  it('a text change is trimmed and sent alone; unchanged fields are never sent', () => {
    const base = itemToForm(item())
    const patch = formToPatch({ ...base, topic: '  A new topic  ', hook: base.hook }, base)
    expect(patch).toEqual({ topic: 'A new topic' })
  })

  it('whitespace-only differences at the edges are not changes', () => {
    const base = itemToForm(item({ caption: 'Hello' }))
    expect(formToPatch({ ...base, caption: 'Hello  \n' }, base)).toEqual({})
  })

  it('platforms, date, format, pillar, objective and KPI go through as chosen', () => {
    const base = itemToForm(item())
    const patch = formToPatch({ ...base, platforms: ['facebook', 'instagram'], date: '2026-10-09', format: 'reel', contentPillar: 'Offers', objective: 'awareness', primaryKpi: 'reach' }, base)
    expect(patch).toEqual({ platforms: ['facebook', 'instagram'], date: '2026-10-09', format: 'reel', contentPillar: 'Offers', objective: 'awareness', primaryKpi: 'reach' })
  })

  it('service / product: "" means none and is sent as null; choosing a product also sends the (cleared) image selection', () => {
    const base = itemToForm(item({ serviceId: 'svc-1', serviceName: 'Family check-up' }))
    expect(formToPatch({ ...base, serviceId: '' }, base)).toEqual({ serviceId: null })
    const withProduct = formToPatch({ ...base, productId: 'prod-1', selectedMediaIds: [] }, base)
    expect(withProduct).toEqual({ productId: 'prod-1', selectedMediaIds: [] })
  })

  it('lists (hashtags, assets, images) are compared as lists', () => {
    const base = itemToForm(item({ hashtags: ['#a', '#b'] }))
    expect(formToPatch({ ...base, hashtags: ['#a', '#b'] }, base)).toEqual({})
    expect(formToPatch({ ...base, hashtags: ['#a'] }, base)).toEqual({ hashtags: ['#a'] })
    expect(formToPatch({ ...base, requiredAssets: ['logo'] }, base)).toEqual({ requiredAssets: ['logo'] })
  })

  it('platform copy is sent only for the post\'s platforms and only when it says something', () => {
    const base = itemToForm(item({ platforms: ['facebook', 'instagram'] }))
    const form = { ...base, platformContent: { ...base.platformContent, instagram: { caption: 'Short IG caption', primaryCta: '', hashtags: ['#ig'] } } }
    expect(formToPatch(form, base)).toEqual({ platformContent: [{ platform: 'instagram', caption: 'Short IG caption', primaryCta: '', hashtags: ['#ig'] }] })
    expect(platformContentPayload({ ...form, platforms: ['facebook'] })).toEqual([])
  })

  it('stored platform copy round-trips', () => {
    const stored = item({ platforms: ['facebook', 'instagram'], platformContent: [{ platform: 'facebook', caption: 'FB', primaryCta: 'Learn more', hashtags: ['#fb'] }] })
    const form = itemToForm(stored)
    expect(form.platformContent.facebook).toEqual({ caption: 'FB', primaryCta: 'Learn more', hashtags: ['#fb'] })
    expect(form.platformContent.instagram).toEqual({ caption: '', primaryCta: '', hashtags: [] })
    expect(formToPatch(form, itemToForm(stored))).toEqual({})
  })
})

describe('newItemForm — a manual item starts from real options', () => {
  it('uses the first connected platform in the strategy, the first pillar and the first objective with its first KPI', () => {
    const form = newItemForm(calendarOptions({ platforms: [{ platform: 'facebook', connected: false, inStrategy: true }, { platform: 'instagram', connected: true, inStrategy: true }] }))
    expect(form.platforms).toEqual(['instagram'])
    expect(form.contentPillar).toBe('Dental tips')
    expect(form.objective).toBe('awareness')
    expect(form.primaryKpi).toBe('reach')
    expect(form.topic).toBe('')
  })

  it('the date is inside the calendar (clamped to its range)', () => {
    expect(newItemForm(calendarOptions({ calendar: { id: 'c', version: 1, startDate: '2099-01-01', endDate: '2099-01-30' } })).date).toBe('2099-01-01')
    expect(newItemForm(calendarOptions({ calendar: { id: 'c', version: 1, startDate: '2000-01-01', endDate: '2000-01-30' } })).date).toBe('2000-01-30')
  })

  it('no connected platform: none is picked for the user', () => {
    expect(newItemForm(calendarOptions({ platforms: [{ platform: 'facebook', connected: false, inStrategy: true }] })).platforms).toEqual([])
  })
})

describe('supportedFormats', () => {
  it('a format must exist on EVERY selected platform', () => {
    expect(supportedFormats(['facebook'], options)).toContain('text_post')
    expect(supportedFormats(['instagram'], options)).not.toContain('text_post')
    expect(supportedFormats(['facebook', 'instagram'], options)).toEqual(['static_post', 'carousel', 'reel', 'video'])
  })
})

describe('hashtags', () => {
  it('normalizeTag: # optional, letters / numbers / underscores only', () => {
    expect(normalizeTag('seo')).toBe('#seo')
    expect(normalizeTag('#SEO')).toBe('#SEO')
    expect(normalizeTag(' ##audit ')).toBe('#audit')
    expect(normalizeTag('café_2026')).toBe('#café_2026')
    for (const bad of ['has space', 'bad-dash', '<script>', '', '#', null, 'x'.repeat(51)]) expect(normalizeTag(bad)).toBeNull()
  })
})

describe('validateForm — courtesy checks that mirror the server', () => {
  const base = itemToForm(item())
  const check = (over, opts = options, extra = {}) => validateForm({ ...base, ...over }, opts, { base, today: '2026-10-05', ...extra })

  it('a valid form has no errors', () => {
    expect(check({})).toEqual({})
  })

  it('a topic is required; at least one platform', () => {
    expect(check({ topic: '  ' }).topic).toMatch(/topic/i)
    expect(check({ platforms: [] }).platforms).toMatch(/at least one/i)
  })

  it('a platform that is ADDED must be connected and in the strategy; an existing one is not re-checked', () => {
    const noIg = calendarOptions({ platforms: [{ platform: 'facebook', connected: true, inStrategy: true }, { platform: 'instagram', connected: false, inStrategy: true }] })
    expect(check({ platforms: ['facebook', 'instagram'] }, noIg).platforms).toMatch(/Connect your Instagram/)
    const notInStrategy = calendarOptions({ platforms: [{ platform: 'facebook', connected: true, inStrategy: true }, { platform: 'instagram', connected: true, inStrategy: false }] })
    expect(check({ platforms: ['facebook', 'instagram'] }, notInStrategy).platforms).toMatch(/does not cover Instagram/)
    const fbOff = calendarOptions({ platforms: [{ platform: 'facebook', connected: false, inStrategy: true }, { platform: 'instagram', connected: true, inStrategy: true }] })
    expect(check({ topic: 'x' }, fbOff).platforms).toBeUndefined()
  })

  it('the format must exist on every selected platform', () => {
    expect(check({ format: 'text_post' })).toEqual({})
    expect(check({ format: 'text_post', platforms: ['facebook', 'instagram'] }).format).toMatch(/every selected platform/)
  })

  it('the date must be real, inside the calendar and not in the past - but only when it CHANGED', () => {
    expect(check({ date: 'soon' }).date).toMatch(/valid date/)
    expect(check({ date: '2026-11-05' }).date).toMatch(/between 2026-10-06 and 2026-11-04/)
    expect(check({ date: '2026-10-05' }, calendarOptions({ calendar: { id: 'c', version: 1, startDate: '2026-10-01', endDate: '2026-11-04' } }), { today: '2026-10-08' }).date).toMatch(/past/)
    const old = itemToForm(item({ date: '2026-10-01' }))
    expect(validateForm({ ...old, topic: 'edited' }, options, { base: old, today: '2026-10-20' }).date).toBeUndefined()
  })

  it('the KPI must measure the objective; a purchase CTA only suits conversion', () => {
    expect(check({ objective: 'conversion' }).primaryKpi).toMatch(/conversion/)
    expect(check({ objective: 'conversion', primaryKpi: 'purchases', primaryCta: 'Buy now' })).toEqual({})
    expect(check({ primaryCta: 'Buy now' }).primaryCta).toMatch(/conversion/)
    expect(check({ platformContent: { ...base.platformContent, facebook: { caption: '', primaryCta: 'Shop now', hashtags: [] } } })['platformContent.facebook.primaryCta']).toMatch(/conversion/)
  })

  it('copy must fit every platform: length with hashtags, and hashtag counts', () => {
    const ig = itemToForm(item({ platforms: ['instagram'] }))
    const errors = validateForm({ ...ig, caption: 'x'.repeat(2300) }, options, { base: ig, today: '2026-10-05' })
    expect(errors['platformContent.instagram.caption']).toMatch(/2300|2,?300/)
    expect(validateForm({ ...itemToForm(item()), caption: 'x'.repeat(2300) }, options, { base, today: '2026-10-05' })).toEqual({})
    const tags = Array.from({ length: 11 }, (_, i) => `#t${i}`)
    expect(check({ hashtags: tags })['platformContent.facebook.hashtags']).toMatch(/at most 10/)
    expect(textLength({ ...base, caption: 'abc', hashtags: ['#a', '#b'] }, 'facebook')).toBe(3 + 2 + 5)
  })

  it('serverFieldErrors passes the server\'s own field messages through; hookIndexOf finds a strategy hook', () => {
    expect(serverFieldErrors({ details: { fields: { topic: 'is required' } } })).toEqual({ topic: 'is required' })
    expect(serverFieldErrors(new Error('x'))).toEqual({})
    expect(hookIndexOf(options.hooks[1].hook, options)).toBe(1)
    expect(hookIndexOf('my own', options)).toBe(-1)
  })
})
