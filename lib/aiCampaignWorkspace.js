/**
 * AI Campaign Builder — workspace editable-state model (Phase 3).
 *
 * Pure, framework-free helpers + a reducer for the in-memory editable copy
 * of a draft's `{ campaign, adGroups }`. Kept out of components so it is
 * unit-testable and so the reducer can guarantee two things the UI depends
 * on:
 *
 *   1. REFERENCE PRESERVATION — editing one keyword returns a new tree in
 *      which every untouched ad group / ad / keyword keeps its exact object
 *      identity, so `React.memo` at the ad-group boundary actually prevents
 *      sibling re-renders (spec §24 / §25).
 *   2. DATA INTEGRITY — unknown backend fields on a row are preserved, IDs
 *      are never regenerated, arrays are cloned (not replaced wholesale
 *      with reconstructed objects) only along the edited path (spec §40).
 *
 * Client-only row keys (`_key`) are added to keywords and RSA assets (which
 * have no backend id) purely for stable React keys while editing; they are
 * stripped by `toPatchPayload` and never sent to the backend.
 */

import { RSA_LIMITS, MATCH_TYPES, CAMPAIGN_OBJECTIVES, BIDDING_STRATEGIES, LOCATION_TYPES } from '@/lib/aiCampaignConstants'

let _keySeq = 0
export function nextClientKey(prefix = 'k') {
  _keySeq += 1
  return `${prefix}_${_keySeq}_${Date.now().toString(36)}`
}

const isStr = (v) => typeof v === 'string'
const trim = (v) => (isStr(v) ? v.trim() : v == null ? '' : String(v).trim())

// ── init ────────────────────────────────────────────────────────────────
function withKey(obj, prefix) {
  return { ...obj, _key: obj?._key || nextClientKey(prefix) }
}

/** Build the editable copy from a server draft. Deep-ish clone; adds _key to keyless rows. */
export function initWorkspaceState(draft) {
  const c = draft?.campaign || {}
  const campaign = {
    name: c.name || '',
    objective: c.objective || 'LEADS',
    // major-unit budget for the form; backend virtual `dailyBudget` or fall back
    dailyBudget:
      c.dailyBudget != null
        ? c.dailyBudget
        : c.dailyBudgetMicros != null
          ? c.dailyBudgetMicros / 1_000_000
          : '',
    currency: c.currency || 'USD',
    biddingStrategy: c.biddingStrategy || 'MAXIMIZE_CONVERSIONS',
    locations: Array.isArray(c.locations)
      ? c.locations.map((l) => ({
          name: l.name || '',
          countryCode: l.countryCode || '',
          type: l.type || 'CITY',
          ...(l.region != null ? { region: l.region } : {}),
          ...(l.postalCode != null ? { postalCode: l.postalCode } : {}),
          ...(l.googleAdsGeoTargetId != null ? { googleAdsGeoTargetId: l.googleAdsGeoTargetId } : {}),
        }))
      : [],
    languages: Array.isArray(c.languages)
      ? c.languages.map((l) => ({ code: l.code || '', name: l.name || '' }))
      : [],
    // Sitelinks/callouts/structured snippets (Phase 9, RSA/Ad-Strength
    // quality work) — carried through UNCHANGED. There is no dedicated
    // editor for these yet (CampaignOverviewCard shows them read-only), but
    // they MUST still round-trip: toPatchPayload always sends the campaign
    // sub-document as a COMPLETE replacement (see its own comment below), so
    // dropping these here would silently erase every AI-generated sitelink/
    // callout/snippet on the user's very first, unrelated manual save.
    sitelinks: Array.isArray(c.sitelinks)
      ? c.sitelinks.map((sl) => ({ id: sl.id, text: sl.text || '', description1: sl.description1 || '', description2: sl.description2 || '', finalUrl: sl.finalUrl || '' }))
      : [],
    callouts: Array.isArray(c.callouts)
      ? c.callouts.map((co) => ({ id: co.id, text: co.text || '' }))
      : [],
    structuredSnippets: Array.isArray(c.structuredSnippets)
      ? c.structuredSnippets.map((sn) => ({ id: sn.id, header: sn.header || '', values: Array.isArray(sn.values) ? [...sn.values] : [] }))
      : [],
  }

  const adGroups = (Array.isArray(draft?.adGroups) ? draft.adGroups : []).map((ag) => ({
    id: ag.id,
    name: ag.name || '',
    keywords: (ag.keywords || []).map((k) => withKey({ text: k.text || '', matchType: k.matchType || 'BROAD' }, 'kw')),
    negativeKeywords: (ag.negativeKeywords || []).map((k) =>
      withKey({ text: k.text || '', matchType: k.matchType || 'BROAD' }, 'nk'),
    ),
    ads: (ag.ads || []).map((ad) => ({
      id: ad.id,
      type: ad.type || 'RESPONSIVE_SEARCH_AD',
      headlines: (ad.headlines || []).map((h) =>
        withKey({ text: h.text || '', ...(h.pinnedField != null ? { pinnedField: h.pinnedField } : {}) }, 'hl'),
      ),
      descriptions: (ad.descriptions || []).map((d) =>
        withKey({ text: d.text || '', ...(d.pinnedField != null ? { pinnedField: d.pinnedField } : {}) }, 'ds'),
      ),
      finalUrl: ad.finalUrl || '',
      path1: ad.path1 || '',
      path2: ad.path2 || '',
    })),
  }))

  return { campaign, adGroups }
}

function newAdGroup() {
  return {
    id: nextClientKey('ag_new'), // client id; backend assigns a real one on save
    name: 'New ad group',
    keywords: [],
    negativeKeywords: [],
    ads: [newAd('')],
  }
}
function newAd(finalUrl) {
  return {
    id: nextClientKey('ad_new'),
    type: 'RESPONSIVE_SEARCH_AD',
    headlines: [],
    descriptions: [],
    finalUrl: finalUrl || '',
    path1: '',
    path2: '',
  }
}

// ── reducer ─────────────────────────────────────────────────────────────
function mapAdGroup(state, adGroupId, fn) {
  let changed = false
  const adGroups = state.adGroups.map((ag) => {
    if (ag.id !== adGroupId) return ag
    changed = true
    return fn(ag)
  })
  return changed ? { ...state, adGroups } : state
}

function mapAd(ag, adId, fn) {
  let changed = false
  const ads = ag.ads.map((ad) => {
    if (ad.id !== adId) return ad
    changed = true
    return fn(ad)
  })
  return changed ? { ...ag, ads } : ag
}

export function workspaceReducer(state, action) {
  switch (action.type) {
    case 'reset':
      return action.state

    case 'campaign/setField':
      return { ...state, campaign: { ...state.campaign, [action.field]: action.value } }

    case 'campaign/setLocationField': {
      const locations = state.campaign.locations.map((l, i) =>
        i === action.index ? { ...l, [action.field]: action.value } : l,
      )
      return { ...state, campaign: { ...state.campaign, locations } }
    }

    case 'campaign/addLocation':
      return {
        ...state,
        campaign: {
          ...state.campaign,
          locations: [...state.campaign.locations, { name: '', countryCode: '', type: 'CITY' }],
        },
      }

    case 'campaign/removeLocation':
      return {
        ...state,
        campaign: {
          ...state.campaign,
          locations: state.campaign.locations.filter((_, i) => i !== action.index),
        },
      }

    case 'campaign/setLanguageField': {
      const languages = state.campaign.languages.map((l, i) =>
        i === action.index ? { ...l, [action.field]: action.value } : l,
      )
      return { ...state, campaign: { ...state.campaign, languages } }
    }

    case 'adGroup/add':
      return { ...state, adGroups: [...state.adGroups, newAdGroup()] }

    case 'adGroup/remove':
      return { ...state, adGroups: state.adGroups.filter((ag) => ag.id !== action.id) }

    case 'adGroup/rename':
      return mapAdGroup(state, action.id, (ag) => ({ ...ag, name: action.name }))

    case 'keyword/add':
      return mapAdGroup(state, action.adGroupId, (ag) => ({
        ...ag,
        [action.variant]: [
          ...ag[action.variant],
          withKey({ text: '', matchType: action.variant === 'negativeKeywords' ? 'BROAD' : 'PHRASE' }, action.variant === 'negativeKeywords' ? 'nk' : 'kw'),
        ],
      }))

    case 'keyword/update':
      return mapAdGroup(state, action.adGroupId, (ag) => ({
        ...ag,
        [action.variant]: ag[action.variant].map((k) =>
          k._key === action.key ? { ...k, [action.field]: action.value } : k,
        ),
      }))

    case 'keyword/remove':
      return mapAdGroup(state, action.adGroupId, (ag) => ({
        ...ag,
        [action.variant]: ag[action.variant].filter((k) => k._key !== action.key),
      }))

    case 'ad/add':
      return mapAdGroup(state, action.adGroupId, (ag) => ({
        ...ag,
        ads: [...ag.ads, newAd(action.finalUrl)],
      }))

    case 'ad/remove':
      return mapAdGroup(state, action.adGroupId, (ag) => ({
        ...ag,
        ads: ag.ads.filter((ad) => ad.id !== action.adId),
      }))

    case 'ad/setField':
      return mapAdGroup(state, action.adGroupId, (ag) =>
        mapAd(ag, action.adId, (ad) => ({ ...ad, [action.field]: action.value })),
      )

    case 'asset/add':
      return mapAdGroup(state, action.adGroupId, (ag) =>
        mapAd(ag, action.adId, (ad) => ({
          ...ad,
          [action.variant]: [...ad[action.variant], withKey({ text: '' }, action.variant === 'headlines' ? 'hl' : 'ds')],
        })),
      )

    case 'asset/update':
      return mapAdGroup(state, action.adGroupId, (ag) =>
        mapAd(ag, action.adId, (ad) => ({
          ...ad,
          [action.variant]: ad[action.variant].map((a) =>
            a._key === action.key ? { ...a, text: action.value } : a,
          ),
        })),
      )

    case 'asset/remove':
      return mapAdGroup(state, action.adGroupId, (ag) =>
        mapAd(ag, action.adId, (ad) => ({
          ...ad,
          [action.variant]: ad[action.variant].filter((a) => a._key !== action.key),
        })),
      )

    default:
      return state
  }
}

// ── serialize for the backend PATCH ─────────────────────────────────────
function stripKey({ _key, ...rest }) {
  return rest
}

/**
 * Build the backend PATCH payload from the editable state. `campaign` is
 * always the COMPLETE object (the backend replaces the sub-document);
 * `dailyBudget` is passed as a major-unit number — the backend converts to
 * integer micros (no float math here). Client-only `_key`s are removed;
 * client-generated ad-group / ad ids (prefixed `ag_new` / `ad_new`) are
 * dropped so the backend mints real ones.
 */
export function toPatchPayload(state) {
  const c = state.campaign
  const budgetNum = c.dailyBudget === '' || c.dailyBudget == null ? undefined : Number(c.dailyBudget)

  const campaign = {
    name: trim(c.name),
    objective: c.objective,
    ...(budgetNum !== undefined && Number.isFinite(budgetNum) ? { dailyBudget: budgetNum } : {}),
    currency: trim(c.currency).toUpperCase(),
    biddingStrategy: c.biddingStrategy,
    locations: (c.locations || [])
      .filter((l) => trim(l.name) || trim(l.countryCode))
      .map((l) => ({
        name: trim(l.name),
        countryCode: trim(l.countryCode).toUpperCase(),
        type: l.type,
        ...(l.region != null && trim(l.region) ? { region: trim(l.region) } : {}),
        ...(l.postalCode != null && trim(l.postalCode) ? { postalCode: trim(l.postalCode) } : {}),
      })),
    languages: (c.languages || [])
      .filter((l) => trim(l.code) && trim(l.name))
      .map((l) => ({ code: trim(l.code), name: trim(l.name) })),
    sitelinks: (c.sitelinks || [])
      .filter((sl) => trim(sl.text) && trim(sl.finalUrl))
      .map((sl) => ({
        ...(sl.id ? { id: sl.id } : {}),
        text: trim(sl.text),
        ...(trim(sl.description1) ? { description1: trim(sl.description1) } : {}),
        ...(trim(sl.description2) ? { description2: trim(sl.description2) } : {}),
        finalUrl: trim(sl.finalUrl),
      })),
    callouts: (c.callouts || [])
      .filter((co) => trim(co.text))
      .map((co) => ({ ...(co.id ? { id: co.id } : {}), text: trim(co.text) })),
    structuredSnippets: (c.structuredSnippets || [])
      .filter((sn) => trim(sn.header) && Array.isArray(sn.values) && sn.values.some((v) => trim(v)))
      .map((sn) => ({
        ...(sn.id ? { id: sn.id } : {}),
        header: trim(sn.header),
        values: sn.values.map((v) => trim(v)).filter(Boolean),
      })),
  }

  const adGroups = (state.adGroups || []).map((ag) => {
    const isClientId = typeof ag.id === 'string' && ag.id.startsWith('ag_new')
    return {
      ...(isClientId ? {} : { id: ag.id }),
      name: trim(ag.name),
      keywords: (ag.keywords || [])
        .map(stripKey)
        .filter((k) => trim(k.text))
        .map((k) => ({ text: trim(k.text), matchType: k.matchType })),
      negativeKeywords: (ag.negativeKeywords || [])
        .map(stripKey)
        .filter((k) => trim(k.text))
        .map((k) => ({ text: trim(k.text), matchType: k.matchType })),
      ads: (ag.ads || []).map((ad) => {
        const adClientId = typeof ad.id === 'string' && ad.id.startsWith('ad_new')
        return {
          ...(adClientId ? {} : { id: ad.id }),
          type: ad.type || 'RESPONSIVE_SEARCH_AD',
          headlines: (ad.headlines || [])
            .map(stripKey)
            .filter((h) => trim(h.text))
            .map((h) => ({ text: trim(h.text), ...(h.pinnedField ? { pinnedField: h.pinnedField } : {}) })),
          descriptions: (ad.descriptions || [])
            .map(stripKey)
            .filter((d) => trim(d.text))
            .map((d) => ({ text: trim(d.text), ...(d.pinnedField ? { pinnedField: d.pinnedField } : {}) })),
          ...(trim(ad.finalUrl) ? { finalUrl: trim(ad.finalUrl) } : {}),
          ...(trim(ad.path1) ? { path1: trim(ad.path1) } : {}),
          ...(trim(ad.path2) ? { path2: trim(ad.path2) } : {}),
        }
      }),
    }
  })

  return { campaign, adGroups }
}

// ── dirty check ────────────────────────────────────────────────────────
/** True when the editable state differs from the baseline (both serialized the same way). */
export function isWorkspaceDirty(state, baselineState) {
  if (!baselineState) return false
  try {
    return JSON.stringify(toPatchPayload(state)) !== JSON.stringify(toPatchPayload(baselineState))
  } catch {
    return true
  }
}

// ── client-side validation (UX only — backend remains authoritative) ────
function isValidHttpUrl(v) {
  if (!v) return true
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Returns { errors, count } where errors is a flat map of dot/bracket path
 * → message, matching the shape components use to show field-level errors.
 * Mirrors the backend strict RSA/keyword rules for immediate feedback.
 */
export function validateWorkspace(state) {
  const errors = {}
  const c = state.campaign || {}

  if (!trim(c.name)) errors['campaign.name'] = 'Campaign name is required'
  if (!CAMPAIGN_OBJECTIVES.includes(c.objective)) errors['campaign.objective'] = 'Choose a campaign goal'
  if (!BIDDING_STRATEGIES.includes(c.biddingStrategy)) errors['campaign.biddingStrategy'] = 'Choose a bidding strategy'

  const budget = Number(c.dailyBudget)
  if (c.dailyBudget === '' || c.dailyBudget == null || !Number.isFinite(budget) || budget <= 0) {
    errors['campaign.dailyBudget'] = 'Enter a daily budget greater than zero'
  }
  if (!/^[A-Za-z]{3}$/.test(trim(c.currency))) errors['campaign.currency'] = 'Use a 3-letter currency code'

  if (!c.locations || c.locations.length === 0) {
    errors['campaign.locations'] = 'Add at least one location'
  } else {
    c.locations.forEach((l, i) => {
      if (!trim(l.name)) errors[`campaign.locations[${i}].name`] = 'Location name is required'
      if (!/^[A-Za-z]{2}$/.test(trim(l.countryCode))) errors[`campaign.locations[${i}].countryCode`] = 'Use a 2-letter country code'
      if (!LOCATION_TYPES.includes(l.type)) errors[`campaign.locations[${i}].type`] = 'Choose a location type'
    })
  }

  if (!state.adGroups || state.adGroups.length === 0) {
    errors['adGroups'] = 'Add at least one ad group'
  }

  ;(state.adGroups || []).forEach((ag, gi) => {
    if (!trim(ag.name)) errors[`adGroups[${gi}].name`] = 'Ad group name is required'

    ;(ag.keywords || []).forEach((k, ki) => {
      if (!trim(k.text)) errors[`adGroups[${gi}].keywords[${ki}].text`] = 'Keyword cannot be empty'
      if (!MATCH_TYPES.includes(k.matchType)) errors[`adGroups[${gi}].keywords[${ki}].matchType`] = 'Match type is required'
    })
    ;(ag.negativeKeywords || []).forEach((k, ki) => {
      if (!trim(k.text)) errors[`adGroups[${gi}].negativeKeywords[${ki}].text`] = 'Keyword cannot be empty'
    })

    if ((ag.keywords || []).some((k) => trim(k.text)) && (ag.ads || []).length === 0) {
      errors[`adGroups[${gi}].ads`] = 'Add at least one ad'
    }

    ;(ag.ads || []).forEach((ad, ai) => {
      const heads = (ad.headlines || []).filter((h) => trim(h.text))
      const descs = (ad.descriptions || []).filter((d) => trim(d.text))
      if (heads.length < RSA_LIMITS.HEADLINES_MIN) {
        errors[`adGroups[${gi}].ads[${ai}].headlines`] = `Add at least ${RSA_LIMITS.HEADLINES_MIN} headlines`
      }
      if (descs.length < RSA_LIMITS.DESCRIPTIONS_MIN) {
        errors[`adGroups[${gi}].ads[${ai}].descriptions`] = `Add at least ${RSA_LIMITS.DESCRIPTIONS_MIN} descriptions`
      }
      ;(ad.headlines || []).forEach((h, hi) => {
        if (trim(h.text).length > RSA_LIMITS.HEADLINE_MAX_CHARS) {
          errors[`adGroups[${gi}].ads[${ai}].headlines[${hi}]`] = `Max ${RSA_LIMITS.HEADLINE_MAX_CHARS} characters`
        }
      })
      ;(ad.descriptions || []).forEach((d, di) => {
        if (trim(d.text).length > RSA_LIMITS.DESCRIPTION_MAX_CHARS) {
          errors[`adGroups[${gi}].ads[${ai}].descriptions[${di}]`] = `Max ${RSA_LIMITS.DESCRIPTION_MAX_CHARS} characters`
        }
      })
      ;['path1', 'path2'].forEach((p) => {
        if (trim(ad[p]).length > RSA_LIMITS.PATH_MAX_CHARS) {
          errors[`adGroups[${gi}].ads[${ai}].${p}`] = `Max ${RSA_LIMITS.PATH_MAX_CHARS} characters`
        }
      })
      if (!isValidHttpUrl(trim(ad.finalUrl))) {
        errors[`adGroups[${gi}].ads[${ai}].finalUrl`] = 'Enter a valid URL (http:// or https://)'
      }
    })
  })

  return { errors, count: Object.keys(errors).length }
}

// ── setup-form (brief) client validation ──────────────────────────────
export function validateBrief(form) {
  const errors = {}
  const t = (v) => trim(v)

  if (!t(form.businessDescription)) errors.businessDescription = 'Describe your business so the AI has context'
  else if (t(form.businessDescription).length > 1500) errors.businessDescription = 'Keep this under 1,500 characters'

  if (t(form.businessName).length > 150) errors.businessName = 'Keep this under 150 characters'
  if (t(form.targetAudience).length > 500) errors.targetAudience = 'Keep this under 500 characters'
  if (t(form.additionalInstructions).length > 2000) errors.additionalInstructions = 'Keep this under 2,000 characters'

  if (!CAMPAIGN_OBJECTIVES.includes(form.campaignGoal)) errors.campaignGoal = 'Choose a campaign goal'

  const budget = Number(form.dailyBudget)
  if (form.dailyBudget === '' || form.dailyBudget == null || !Number.isFinite(budget) || budget <= 0) {
    errors.dailyBudget = 'Enter a daily budget greater than zero'
  } else if (budget > 100000) {
    errors.dailyBudget = 'That budget looks too high — enter your real daily budget'
  }

  if (!/^[A-Za-z]{3}$/.test(t(form.currency))) errors.currency = 'Select a currency'

  if (!t(form.locationName)) errors.locationName = 'Enter a location'
  if (!/^[A-Za-z]{2}$/.test(t(form.locationCountryCode))) errors.locationCountryCode = 'Select a country'
  if (!LOCATION_TYPES.includes(form.locationType)) errors.locationType = 'Choose a location type'

  if (t(form.landingPageUrl) && !isValidHttpUrl(t(form.landingPageUrl))) {
    errors.landingPageUrl = 'Enter a valid URL (http:// or https://)'
  }

  return { errors, count: Object.keys(errors).length }
}

/** Map the setup form state to the Phase 2 `brief` request body. */
export function briefFromForm(form) {
  const t = (v) => trim(v)
  const brief = {
    businessDescription: t(form.businessDescription),
    campaignGoal: form.campaignGoal,
    dailyBudget: Number(form.dailyBudget),
    currency: t(form.currency).toUpperCase(),
    location: {
      name: t(form.locationName),
      countryCode: t(form.locationCountryCode).toUpperCase(),
      type: form.locationType,
    },
  }
  if (t(form.businessName)) brief.businessName = t(form.businessName)
  if (t(form.targetAudience)) brief.targetAudience = t(form.targetAudience)
  if (t(form.landingPageUrl)) brief.landingPageUrl = t(form.landingPageUrl)
  if (t(form.additionalInstructions)) brief.additionalInstructions = t(form.additionalInstructions)
  return brief
}
