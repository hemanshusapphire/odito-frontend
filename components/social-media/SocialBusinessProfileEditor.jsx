"use client"

import { useMemo, useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { BrandColorInput } from './BrandColorInput'
import { Field, INPUT } from './FormField'
import { SourceBadge } from './SourceBadge'
import { useUpdateSocialBusinessProfile } from '@/hooks/useSocialMediaAI'
import { describeApiError } from '@/lib/socialMedia/failureMessages'
import {
  linesToList, listToLines, blankToNull, parseServiceArea, serviceAreaToText, hasValue, factText, underlyingOf,
} from '@/lib/socialMedia/businessProfile'

// Suggestions only (a <datalist>) — the user can type any font; nothing is pre-selected.
const FONT_SUGGESTIONS = ['Inter', 'Poppins', 'Roboto', 'DM Sans', 'Manrope', 'Montserrat', 'Lato', 'Open Sans']
const PH = 'Leave empty to use the Google / project value'

// Mirrors the server limits (socialBusinessProfileService LIMITS) for instant feedback; the server is authoritative.
const MAX = {
  audience: 500, tone: 200, instructions: 2000, offerName: 100, offerDescription: 500, url: 500, overrideName: 150, overrideDescription: 1000, address: 300, phone: 40, font: 60,
  place: 100, postalCode: 20, brandName: 100, brandDescription: 500, brandVoice: 300, tagline: 150, brandInstructions: 1000,
}

// ── draft <-> payload per section ───────────────────────────────────────────
// Every user-entered field belongs to exactly ONE section, so two forms on screen can never overwrite each other's
// values with a stale copy.

function toDraft(section, p) {
  if (section === 'overrides') {
    const o = p.overrides
    return {
      businessName: o.businessName || '', description: o.description || '', category: o.category || '', secondaryCategories: listToLines(o.secondaryCategories),
      phone: o.phone || '', website: o.website || '', address: o.address || '', city: o.city || '', region: o.region || '', country: o.country || '',
      postalCode: o.postalCode || '', serviceArea: serviceAreaToText(o.serviceArea),
    }
  }
  if (section === 'brand') {
    const b = p.brand
    return { primaryColor: b.primaryColor || '', secondaryColor: b.secondaryColor || '', accentColor: b.accentColor || '', fontHeading: b.fontHeading || '', fontBody: b.fontBody || '' }
  }
  if (section === 'identity') {
    const b = p.brand
    return {
      brandName: b.name || '', brandDescription: b.description || '', brandVoice: b.voice || '', tonePrimary: p.toneOfVoice.primary || '', toneSecondary: listToLines(p.toneOfVoice.secondary),
      personality: listToLines(b.personality), tagline: b.tagline || '',
    }
  }
  if (section === 'messaging') {
    const b = p.brand
    return {
      keyMessages: listToLines(b.keyMessages), uniqueSellingPoints: listToLines(p.uniqueSellingPoints), preferredWords: listToLines(b.preferredWords),
      prohibitedPhrases: listToLines(p.prohibitedPhrases), brandInstructions: b.additionalInstructions || '',
    }
  }
  return {
    audiencePrimary: p.audience.primary || '', audienceSecondary: listToLines(p.audience.secondary),
    goals: listToLines(p.goals), contentPillars: listToLines(p.contentPillars),
    offers: p.offers.map((o) => ({ name: o.name, description: o.description || '', url: o.url || '' })),
    competitors: p.competitors.map((c) => ({ name: c.name, website: c.website || '' })),
    additionalInstructions: p.additionalInstructions || '',
  }
}

/** The PUT body for a section — only the user-entered fields of THAT section. */
function toPayload(section, d) {
  if (section === 'overrides') {
    return { overrides: {
      businessName: blankToNull(d.businessName), description: blankToNull(d.description), category: blankToNull(d.category), secondaryCategories: linesToList(d.secondaryCategories),
      phone: blankToNull(d.phone), website: blankToNull(d.website), address: blankToNull(d.address), city: blankToNull(d.city), region: blankToNull(d.region),
      country: blankToNull(d.country), postalCode: blankToNull(d.postalCode), serviceArea: parseServiceArea(d.serviceArea),
    } }
  }
  if (section === 'brand') {
    return { brand: {
      primaryColor: blankToNull(d.primaryColor), secondaryColor: blankToNull(d.secondaryColor), accentColor: blankToNull(d.accentColor),
      fontHeading: blankToNull(d.fontHeading), fontBody: blankToNull(d.fontBody),
    } }
  }
  if (section === 'identity') {
    return {
      brand: { name: blankToNull(d.brandName), description: blankToNull(d.brandDescription), voice: blankToNull(d.brandVoice), personality: linesToList(d.personality), tagline: blankToNull(d.tagline) },
      toneOfVoice: { primary: blankToNull(d.tonePrimary), secondary: linesToList(d.toneSecondary) },
    }
  }
  if (section === 'messaging') {
    return {
      brand: { keyMessages: linesToList(d.keyMessages), preferredWords: linesToList(d.preferredWords), additionalInstructions: blankToNull(d.brandInstructions) },
      uniqueSellingPoints: linesToList(d.uniqueSellingPoints), prohibitedPhrases: linesToList(d.prohibitedPhrases),
    }
  }
  return {
    audience: { primary: blankToNull(d.audiencePrimary), secondary: linesToList(d.audienceSecondary) },
    goals: linesToList(d.goals), contentPillars: linesToList(d.contentPillars),
    offers: d.offers.filter((o) => o.name.trim() || o.description.trim() || o.url.trim()).map((o) => ({ name: o.name, description: o.description, url: blankToNull(o.url) })),
    competitors: d.competitors.filter((c) => c.name.trim() || c.website.trim()).map((c) => ({ name: c.name, website: blankToNull(c.website) })),
    additionalInstructions: d.additionalInstructions,
  }
}

const SECTION_COPY = {
  strategy: { title: 'Audience & strategy', subtitle: 'Tell Social AI who you talk to and what you want to achieve. Saved only in Odito; never sent to Google.' },
  overrides: { title: 'Business information', subtitle: 'Use a different value for social content only. Leave a field empty to keep using the Google / project value. Overrides never change Google Business Profile.' },
  identity: { title: 'Brand identity', subtitle: 'Who your brand is and how it sounds. Saved only in Odito; Social AI uses it instead of guessing.' },
  messaging: { title: 'Messaging', subtitle: 'What your brand wants to say, and the words to use or avoid.' },
  brand: { title: 'Colours & fonts', subtitle: 'Optional. Leave a field empty and Social AI will not assume one.' },
}

/**
 * Under an override field: what is being used right now and where it came from, and — when the user's own value is
 * winning — what would be used without it. The override is never silent, and the underlying value is never hidden.
 */
function FactHint({ fact, name }) {
  if (!fact) return null
  const present = hasValue(fact)
  const under = underlyingOf(fact)
  const text = factText(fact.value)
  return (
    <div className="mt-1.5 space-y-1 text-xs text-slate-500" data-testid={`hint-${name}`}>
      {present ? (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{fact.source === 'social_override' ? 'Using your value:' : 'Currently using:'}</span>{' '}
          <span className="min-w-0 break-words font-medium text-slate-700">{text.length > 120 ? `${text.slice(0, 120)}…` : text}</span>{' '}
          <SourceBadge source={fact.source} detail={fact.detail} />
        </p>
      ) : (
        <p>Nothing from Google or your project yet.</p>
      )}
      {under && (
        <p data-testid={`hint-${name}-underlying`}>
          Without your value, Social AI would use <span className="font-medium text-slate-700">{under.text.length > 120 ? `${under.text.slice(0, 120)}…` : under.text}</span> ({under.label}).
        </p>
      )}
    </div>
  )
}

function RepeatRows({ label, rows, onChange, fields, addLabel, max, testId }) {
  const set = (i, key, value) => onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)))
  return (
    <div data-testid={testId}>
      <p className="mb-1.5 text-sm font-medium text-slate-700">{label}</p>
      <div className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {fields.map((f) => (
                <input
                  key={f.key}
                  type="text"
                  aria-label={`${label} ${i + 1} ${f.label}`}
                  value={row[f.key]}
                  maxLength={f.max}
                  placeholder={f.label}
                  onChange={(e) => set(i, f.key, e.target.value)}
                  className={`${INPUT} ${f.wide ? 'sm:col-span-2' : ''}`}
                />
              ))}
            </div>
            <button type="button" onClick={() => onChange(rows.filter((_, idx) => idx !== i))} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700" aria-label={`Remove ${label} ${i + 1}`}>
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        ))}
      </div>
      {rows.length < max && (
        <button type="button" onClick={() => onChange([...rows, Object.fromEntries(fields.map((f) => [f.key, '']))])} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-700">
          <Plus className="h-4 w-4" /> {addLabel}
        </button>
      )}
    </div>
  )
}

/**
 * Form for ONE group of the user-entered Social AI fields (`section`):
 *   'overrides' business information — optional Social-AI-only replacements for what Google / the project say, each
 *               showing what is used now, where it came from, and what the override replaced
 *   'strategy'  audience, goals, content pillars, offers, competitors, instructions
 *   'identity'  brand name / description / voice, tone of voice, personality, tagline
 *   'messaging' key messages, unique selling points, preferred words, phrases to avoid, brand instructions
 *   'brand'     colours and fonts
 * It sends only that section's fields. The draft is form state seeded from the server data; after a save it is
 * replaced with what the server returned (it trims, de-duplicates and normalises). Parents key this component on the
 * project id so a project switch always starts from that project's data. `resolved` (the resolved profile) only
 * feeds the source hints of the 'overrides' form.
 */
export function SocialBusinessProfileEditor({ projectId, section, profile, resolved = null }) {
  const mutation = useUpdateSocialBusinessProfile(projectId)
  const initial = useMemo(() => toDraft(section, profile), [section, profile])
  const [draft, setDraft] = useState(initial)
  const copy = SECTION_COPY[section]

  const payload = useMemo(() => toPayload(section, draft), [section, draft])
  const dirty = JSON.stringify(payload) !== JSON.stringify(toPayload(section, initial))
  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }))
  const setValue = (key, value) => setDraft((d) => ({ ...d, [key]: value }))
  const biz = resolved?.business
  const loc = biz?.location

  function handleSave(e) {
    e.preventDefault()
    if (!dirty || mutation.isPending) return
    mutation.mutate(payload, {
      // show exactly what the server stored (it trims, de-duplicates and normalises URLs)
      onSuccess: (res) => { if (res?.data?.editableProfile) setDraft(toDraft(section, res.data.editableProfile)) },
    })
  }

  const error = mutation.isError ? describeApiError(mutation.error, 'Could not save your changes.').message : null
  const saved = mutation.isSuccess && !dirty

  return (
    <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" data-testid={`editor-${section}`} aria-label={copy.title}>
      <h3 className="text-base font-bold text-slate-900">{copy.title}</h3>
      <p className="mt-1 text-sm text-slate-500">{copy.subtitle}</p>

      <div className="mt-5 flex flex-col gap-4">
        {section === 'strategy' && (
          <>
            <Field label="Primary audience" htmlFor="bp-audience" hint="Who is this content for?">
              <textarea id="bp-audience" rows={2} maxLength={MAX.audience} value={draft.audiencePrimary} onChange={set('audiencePrimary')} className={`${INPUT} resize-none`} />
            </Field>
            <Field label="Other audiences" htmlFor="bp-audience-2" hint="One per line">
              <textarea id="bp-audience-2" rows={2} value={draft.audienceSecondary} onChange={set('audienceSecondary')} className={`${INPUT} resize-none`} />
            </Field>
            <Field label="Goals" htmlFor="bp-goals" hint="One per line (up to 10)">
              <textarea id="bp-goals" rows={3} value={draft.goals} onChange={set('goals')} className={`${INPUT} resize-none`} />
            </Field>
            <Field label="Content pillars" htmlFor="bp-pillars" hint="Recurring themes, one per line (up to 10)">
              <textarea id="bp-pillars" rows={3} value={draft.contentPillars} onChange={set('contentPillars')} className={`${INPUT} resize-none`} />
            </Field>
            <RepeatRows
              label="Offers" testId="offers" rows={draft.offers} onChange={(v) => setValue('offers', v)} max={10} addLabel="Add an offer"
              fields={[{ key: 'name', label: 'Name', max: MAX.offerName }, { key: 'url', label: 'Link (optional)', max: MAX.url }, { key: 'description', label: 'Description', max: MAX.offerDescription, wide: true }]}
            />
            <RepeatRows
              label="Competitors" testId="competitors" rows={draft.competitors} onChange={(v) => setValue('competitors', v)} max={10} addLabel="Add a competitor"
              fields={[{ key: 'name', label: 'Name', max: MAX.offerName }, { key: 'website', label: 'Website (optional)', max: MAX.url }]}
            />
            <Field label="Additional instructions" htmlFor="bp-instructions">
              <textarea id="bp-instructions" rows={4} maxLength={MAX.instructions} value={draft.additionalInstructions} onChange={set('additionalInstructions')} className={`${INPUT} resize-none`} />
            </Field>
          </>
        )}

        {section === 'overrides' && (
          <>
            <Field label="Business name" htmlFor="ov-name"><input id="ov-name" type="text" maxLength={MAX.overrideName} value={draft.businessName} onChange={set('businessName')} placeholder={PH} className={INPUT} /><FactHint fact={biz?.name} name="name" /></Field>
            <Field label="Description" htmlFor="ov-description"><textarea id="ov-description" rows={3} maxLength={MAX.overrideDescription} value={draft.description} onChange={set('description')} placeholder={PH} className={`${INPUT} resize-none`} /><FactHint fact={biz?.description} name="description" /></Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Category" htmlFor="ov-category"><input id="ov-category" type="text" maxLength={MAX.overrideName} value={draft.category} onChange={set('category')} placeholder={PH} className={INPUT} /><FactHint fact={biz?.category} name="category" /></Field>
              <Field label="Secondary categories" htmlFor="ov-secondary" hint="One per line (up to 10)"><textarea id="ov-secondary" rows={2} value={draft.secondaryCategories} onChange={set('secondaryCategories')} placeholder={PH} className={`${INPUT} resize-none`} /><FactHint fact={biz?.secondaryCategories} name="secondary" /></Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Phone" htmlFor="ov-phone"><input id="ov-phone" type="text" maxLength={MAX.phone} value={draft.phone} onChange={set('phone')} placeholder={PH} className={INPUT} /><FactHint fact={biz?.phone} name="phone" /></Field>
              <Field label="Website" htmlFor="ov-website"><input id="ov-website" type="text" maxLength={MAX.url} value={draft.website} onChange={set('website')} placeholder={PH} className={INPUT} /><FactHint fact={biz?.website} name="website" /></Field>
            </div>
            <Field label="Address" htmlFor="ov-address"><input id="ov-address" type="text" maxLength={MAX.address} value={draft.address} onChange={set('address')} placeholder={PH} className={INPUT} /><FactHint fact={loc?.address} name="address" /></Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="City" htmlFor="ov-city"><input id="ov-city" type="text" maxLength={MAX.place} value={draft.city} onChange={set('city')} placeholder={PH} className={INPUT} /><FactHint fact={loc?.city} name="city" /></Field>
              <Field label="State / region" htmlFor="ov-region"><input id="ov-region" type="text" maxLength={MAX.place} value={draft.region} onChange={set('region')} placeholder={PH} className={INPUT} /><FactHint fact={loc?.region} name="region" /></Field>
              <Field label="Country" htmlFor="ov-country"><input id="ov-country" type="text" maxLength={MAX.place} value={draft.country} onChange={set('country')} placeholder={PH} className={INPUT} /><FactHint fact={loc?.country} name="country" /></Field>
              <Field label="Postal code" htmlFor="ov-postal"><input id="ov-postal" type="text" maxLength={MAX.postalCode} value={draft.postalCode} onChange={set('postalCode')} placeholder={PH} className={INPUT} /><FactHint fact={loc?.postalCode} name="postal" /></Field>
            </div>
            <Field label="Service area" htmlFor="ov-area" hint="A place, or several separated by commas"><input id="ov-area" type="text" value={draft.serviceArea} onChange={set('serviceArea')} placeholder={PH} className={INPUT} /><FactHint fact={biz?.serviceArea} name="area" /></Field>
          </>
        )}

        {section === 'identity' && (
          <>
            <Field label="Brand name" htmlFor="id-name" hint="Leave empty to use your business name"><input id="id-name" type="text" maxLength={MAX.brandName} value={draft.brandName} onChange={set('brandName')} className={INPUT} /></Field>
            <Field label="Brand description" htmlFor="id-description" hint="What your brand stands for, in a sentence or two"><textarea id="id-description" rows={3} maxLength={MAX.brandDescription} value={draft.brandDescription} onChange={set('brandDescription')} className={`${INPUT} resize-none`} /></Field>
            <Field label="Brand voice" htmlFor="id-voice" hint="e.g. like a trusted friend who knows the subject"><textarea id="id-voice" rows={2} maxLength={MAX.brandVoice} value={draft.brandVoice} onChange={set('brandVoice')} className={`${INPUT} resize-none`} /></Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Tone of voice" htmlFor="bp-tone" hint="e.g. warm and professional"><input id="bp-tone" type="text" maxLength={MAX.tone} value={draft.tonePrimary} onChange={set('tonePrimary')} className={INPUT} /></Field>
              <Field label="Other tone notes" htmlFor="bp-tone-2" hint="One per line"><textarea id="bp-tone-2" rows={2} value={draft.toneSecondary} onChange={set('toneSecondary')} className={`${INPUT} resize-none`} /></Field>
            </div>
            <Field label="Brand personality" htmlFor="id-personality" hint="Short traits, one per line (up to 8)"><textarea id="id-personality" rows={3} value={draft.personality} onChange={set('personality')} className={`${INPUT} resize-none`} /></Field>
            <Field label="Tagline" htmlFor="id-tagline"><input id="id-tagline" type="text" maxLength={MAX.tagline} value={draft.tagline} onChange={set('tagline')} className={INPUT} /></Field>
          </>
        )}

        {section === 'messaging' && (
          <>
            <Field label="Key messages" htmlFor="ms-key" hint="What every audience should take away, one per line (up to 10)"><textarea id="ms-key" rows={3} value={draft.keyMessages} onChange={set('keyMessages')} className={`${INPUT} resize-none`} /></Field>
            <Field label="Unique selling points" htmlFor="bp-usps" hint="One per line (up to 10)"><textarea id="bp-usps" rows={3} value={draft.uniqueSellingPoints} onChange={set('uniqueSellingPoints')} className={`${INPUT} resize-none`} /></Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Preferred words" htmlFor="ms-preferred" hint="Words and phrases to use, one per line"><textarea id="ms-preferred" rows={3} value={draft.preferredWords} onChange={set('preferredWords')} className={`${INPUT} resize-none`} /></Field>
              <Field label="Phrases to avoid" htmlFor="bp-prohibited" hint="One per line (up to 30)"><textarea id="bp-prohibited" rows={3} value={draft.prohibitedPhrases} onChange={set('prohibitedPhrases')} className={`${INPUT} resize-none`} /></Field>
            </div>
            <Field label="Additional brand instructions" htmlFor="ms-instructions"><textarea id="ms-instructions" rows={3} maxLength={MAX.brandInstructions} value={draft.brandInstructions} onChange={set('brandInstructions')} className={`${INPUT} resize-none`} /></Field>
          </>
        )}

        {section === 'brand' && (
          <>
            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">Brand colours</p>
              <div className="flex flex-wrap gap-5">
                <BrandColorInput label="Primary" value={draft.primaryColor} onChange={(v) => setValue('primaryColor', v)} />
                <BrandColorInput label="Secondary" value={draft.secondaryColor} onChange={(v) => setValue('secondaryColor', v)} />
                <BrandColorInput label="Accent" value={draft.accentColor} onChange={(v) => setValue('accentColor', v)} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Heading font" htmlFor="br-heading"><input id="br-heading" type="text" list="br-fonts" maxLength={MAX.font} value={draft.fontHeading} onChange={set('fontHeading')} className={INPUT} /></Field>
              <Field label="Body font" htmlFor="br-body"><input id="br-body" type="text" list="br-fonts" maxLength={MAX.font} value={draft.fontBody} onChange={set('fontBody')} className={INPUT} /></Field>
            </div>
            <datalist id="br-fonts">{FONT_SUGGESTIONS.map((f) => <option key={f} value={f} />)}</datalist>
          </>
        )}
      </div>

      {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-5 flex items-center justify-end gap-3">
        {saved && <span role="status" className="text-sm font-medium text-emerald-600">Saved</span>}
        {dirty && !mutation.isPending && <span className="text-xs text-slate-400">Unsaved changes</span>}
        <button
          type="submit"
          disabled={!dirty || mutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mutation.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

export default SocialBusinessProfileEditor
