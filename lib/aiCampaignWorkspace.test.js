import { describe, it, expect } from 'vitest'
import {
  initWorkspaceState,
  workspaceReducer,
  toPatchPayload,
  isWorkspaceDirty,
  validateWorkspace,
  validateBrief,
  briefFromForm,
} from './aiCampaignWorkspace'

/**
 * Pure workspace-model coverage (Phase 3). No DOM, no network.
 */

function serverDraft(overrides = {}) {
  return {
    _id: 'd1',
    status: 'ready',
    version: 1,
    campaign: {
      name: 'Digital Marketing Leads — Nashik',
      objective: 'LEADS',
      dailyBudgetMicros: 1_000_000_000,
      dailyBudget: 1000,
      currency: 'INR',
      biddingStrategy: 'MAXIMIZE_CONVERSIONS',
      locations: [{ name: 'Nashik', countryCode: 'IN', type: 'CITY' }],
      languages: [{ code: 'en', name: 'English' }],
    },
    adGroups: [
      {
        id: 'ag-1',
        name: 'SEO Services',
        keywords: [{ text: 'seo services nashik', matchType: 'PHRASE' }],
        negativeKeywords: [{ text: 'jobs', matchType: 'BROAD' }],
        ads: [
          {
            id: 'ad-1',
            type: 'RESPONSIVE_SEARCH_AD',
            headlines: [{ text: 'SEO Services in Nashik' }, { text: 'Grow Your Leads' }, { text: 'Talk To Our Experts' }],
            descriptions: [{ text: 'Local SEO experts for growing businesses.' }, { text: 'Get a free consultation today.' }],
            finalUrl: 'https://example.com/seo',
            path1: 'seo',
            path2: '',
          },
        ],
      },
      {
        id: 'ag-2',
        name: 'Local SEO',
        keywords: [{ text: 'local seo nashik', matchType: 'PHRASE' }],
        negativeKeywords: [],
        ads: [
          {
            id: 'ad-2',
            type: 'RESPONSIVE_SEARCH_AD',
            headlines: [{ text: 'Local SEO in Nashik' }, { text: 'Get Found Locally' }, { text: 'Rank In Maps & Search' }],
            descriptions: [{ text: 'Google Business Profile and local SEO help.' }, { text: 'Talk to a local SEO specialist today.' }],
            finalUrl: 'https://example.com/local-seo',
            path1: '',
            path2: '',
          },
        ],
      },
    ],
    ...overrides,
  }
}

describe('initWorkspaceState', () => {
  it('maps a server draft to an editable copy with major-unit budget and client keys', () => {
    const s = initWorkspaceState(serverDraft())
    expect(s.campaign.dailyBudget).toBe(1000)
    expect(s.campaign.currency).toBe('INR')
    expect(s.adGroups).toHaveLength(2)
    expect(s.adGroups[0].keywords[0]._key).toBeTruthy()
    expect(s.adGroups[0].ads[0].headlines[0]._key).toBeTruthy()
    // backend ids preserved
    expect(s.adGroups[0].id).toBe('ag-1')
    expect(s.adGroups[0].ads[0].id).toBe('ad-1')
  })

  it('falls back to micros/1e6 when the dailyBudget virtual is missing', () => {
    const d = serverDraft()
    delete d.campaign.dailyBudget
    expect(initWorkspaceState(d).campaign.dailyBudget).toBe(1000)
  })
})

describe('workspaceReducer — reference preservation (perf isolation)', () => {
  it('editing a keyword in ad group 1 keeps ad group 2 identical by reference', () => {
    const s0 = initWorkspaceState(serverDraft())
    const key = s0.adGroups[0].keywords[0]._key
    const s1 = workspaceReducer(s0, {
      type: 'keyword/update',
      adGroupId: 'ag-1',
      variant: 'keywords',
      key,
      field: 'text',
      value: 'seo agency nashik',
    })
    expect(s1).not.toBe(s0)
    expect(s1.adGroups[1]).toBe(s0.adGroups[1]) // untouched group: same ref
    expect(s1.adGroups[0]).not.toBe(s0.adGroups[0]) // edited group: new ref
    expect(s1.adGroups[0].negativeKeywords).toBe(s0.adGroups[0].negativeKeywords) // untouched slice
    expect(s1.adGroups[0].ads).toBe(s0.adGroups[0].ads)
    expect(s1.adGroups[0].keywords[0].text).toBe('seo agency nashik')
  })

  it('editing an ad asset keeps sibling ads and other ad groups by reference', () => {
    let s = initWorkspaceState(serverDraft())
    s = workspaceReducer(s, { type: 'ad/add', adGroupId: 'ag-1' })
    const before = s
    const hlKey = s.adGroups[0].ads[0].headlines[0]._key
    const after = workspaceReducer(s, { type: 'asset/update', adGroupId: 'ag-1', adId: 'ad-1', variant: 'headlines', key: hlKey, value: 'New headline' })
    expect(after.adGroups[1]).toBe(before.adGroups[1])
    expect(after.adGroups[0].ads[1]).toBe(before.adGroups[0].ads[1]) // sibling ad untouched
    expect(after.adGroups[0].ads[0].headlines[0].text).toBe('New headline')
  })

  it('add / remove ad group and keyword', () => {
    let s = initWorkspaceState(serverDraft())
    s = workspaceReducer(s, { type: 'adGroup/add' })
    expect(s.adGroups).toHaveLength(3)
    expect(s.adGroups[2].id).toMatch(/^ag_new/)
    s = workspaceReducer(s, { type: 'adGroup/remove', id: s.adGroups[2].id })
    expect(s.adGroups).toHaveLength(2)

    s = workspaceReducer(s, { type: 'keyword/add', adGroupId: 'ag-2', variant: 'keywords' })
    expect(s.adGroups[1].keywords).toHaveLength(2)
    const k = s.adGroups[1].keywords[1]._key
    s = workspaceReducer(s, { type: 'keyword/remove', adGroupId: 'ag-2', variant: 'keywords', key: k })
    expect(s.adGroups[1].keywords).toHaveLength(1)
  })
})

describe('toPatchPayload', () => {
  it('produces backend shape: major-unit dailyBudget, no _key, drops client ids, filters empties', () => {
    let s = initWorkspaceState(serverDraft())
    s = workspaceReducer(s, { type: 'campaign/setField', field: 'dailyBudget', value: '1500' })
    s = workspaceReducer(s, { type: 'adGroup/add' }) // client id ag_new...
    s = workspaceReducer(s, { type: 'keyword/add', adGroupId: 'ag-1', variant: 'keywords' }) // empty text → filtered out

    const payload = toPatchPayload(s)
    expect(payload.campaign.dailyBudget).toBe(1500)
    expect(payload.campaign).not.toHaveProperty('dailyBudgetMicros')
    expect(payload.campaign.currency).toBe('INR')
    // no _key anywhere
    expect(JSON.stringify(payload)).not.toContain('_key')
    // real ad group keeps id, new one omits it
    expect(payload.adGroups[0].id).toBe('ag-1')
    expect(payload.adGroups[2]).not.toHaveProperty('id')
    // empty keyword was filtered
    expect(payload.adGroups[0].keywords).toHaveLength(1)
    // ad keeps its real id
    expect(payload.adGroups[0].ads[0].id).toBe('ad-1')
  })

  it('omits finalUrl/path when blank', () => {
    const s = initWorkspaceState(serverDraft())
    const payload = toPatchPayload(s)
    expect(payload.adGroups[0].ads[0]).toHaveProperty('finalUrl', 'https://example.com/seo')
    expect(payload.adGroups[0].ads[0]).not.toHaveProperty('path2')
  })
})

describe('isWorkspaceDirty', () => {
  it('false when unchanged, true after an edit, false again after reverting', () => {
    const s0 = initWorkspaceState(serverDraft())
    expect(isWorkspaceDirty(s0, s0)).toBe(false)
    const s1 = workspaceReducer(s0, { type: 'campaign/setField', field: 'name', value: 'Changed' })
    expect(isWorkspaceDirty(s1, s0)).toBe(true)
    const s2 = workspaceReducer(s1, { type: 'campaign/setField', field: 'name', value: s0.campaign.name })
    expect(isWorkspaceDirty(s2, s0)).toBe(false)
  })
})

describe('validateWorkspace', () => {
  it('passes for the generated Nashik draft', () => {
    const { count } = validateWorkspace(initWorkspaceState(serverDraft()))
    expect(count).toBe(0)
  })

  it('flags empty keyword text, missing match type, over-long headline, bad url, empty budget', () => {
    let s = initWorkspaceState(serverDraft())
    s = workspaceReducer(s, { type: 'campaign/setField', field: 'dailyBudget', value: '' })
    s = workspaceReducer(s, { type: 'keyword/add', adGroupId: 'ag-1', variant: 'keywords' })
    const kKey = s.adGroups[0].keywords[1]._key
    // leave text empty → error
    s = workspaceReducer(s, { type: 'asset/update', adGroupId: 'ag-1', adId: 'ad-1', variant: 'headlines', key: s.adGroups[0].ads[0].headlines[0]._key, value: 'x'.repeat(40) })
    s = workspaceReducer(s, { type: 'ad/setField', adGroupId: 'ag-1', adId: 'ad-1', field: 'finalUrl', value: 'not a url' })

    const { errors } = validateWorkspace(s)
    expect(errors['campaign.dailyBudget']).toBeTruthy()
    expect(errors[`adGroups[0].keywords[1].text`]).toBeTruthy()
    expect(errors[`adGroups[0].ads[0].headlines[0]`]).toMatch(/Max 30/)
    expect(errors[`adGroups[0].ads[0].finalUrl`]).toBeTruthy()
    void kKey
  })

  it('flags RSA below minimum headline/description counts', () => {
    const d = serverDraft()
    d.adGroups[0].ads[0].headlines = [{ text: 'only one' }]
    d.adGroups[0].ads[0].descriptions = [{ text: 'only one' }]
    const { errors } = validateWorkspace(initWorkspaceState(d))
    expect(errors['adGroups[0].ads[0].headlines']).toMatch(/at least 3/)
    expect(errors['adGroups[0].ads[0].descriptions']).toMatch(/at least 2/)
  })
})

describe('validateBrief + briefFromForm', () => {
  const validForm = {
    businessName: 'Sapphire Digital',
    businessDescription: 'Digital marketing agency providing SEO and online marketing services.',
    campaignGoal: 'LEADS',
    targetAudience: 'Business owners',
    locationName: 'Nashik',
    locationCountryCode: 'IN',
    locationType: 'CITY',
    dailyBudget: '1000',
    currency: 'INR',
    landingPageUrl: 'https://example.com/services',
    additionalInstructions: 'Focus on qualified leads.',
  }

  it('accepts a valid brief form', () => {
    expect(validateBrief(validForm).count).toBe(0)
  })

  it('rejects missing description, invalid goal, non-positive / oversized budget, bad url, missing location', () => {
    expect(validateBrief({ ...validForm, businessDescription: '' }).errors.businessDescription).toBeTruthy()
    expect(validateBrief({ ...validForm, campaignGoal: 'CONVERSIONS' }).errors.campaignGoal).toBeTruthy()
    expect(validateBrief({ ...validForm, dailyBudget: '0' }).errors.dailyBudget).toBeTruthy()
    expect(validateBrief({ ...validForm, dailyBudget: '999999' }).errors.dailyBudget).toBeTruthy()
    expect(validateBrief({ ...validForm, currency: '' }).errors.currency).toBeTruthy()
    expect(validateBrief({ ...validForm, landingPageUrl: 'ftp://x' }).errors.landingPageUrl).toBeTruthy()
    expect(validateBrief({ ...validForm, locationName: '' }).errors.locationName).toBeTruthy()
    expect(validateBrief({ ...validForm, locationCountryCode: 'IND' }).errors.locationCountryCode).toBeTruthy()
  })

  it('briefFromForm builds the Phase 2 brief body, omitting blank optionals', () => {
    const brief = briefFromForm({ ...validForm, businessName: '', targetAudience: '', landingPageUrl: '', additionalInstructions: '' })
    expect(brief).toEqual({
      businessDescription: 'Digital marketing agency providing SEO and online marketing services.',
      campaignGoal: 'LEADS',
      dailyBudget: 1000,
      currency: 'INR',
      location: { name: 'Nashik', countryCode: 'IN', type: 'CITY' },
    })
    const full = briefFromForm(validForm)
    expect(full.businessName).toBe('Sapphire Digital')
    expect(full.landingPageUrl).toBe('https://example.com/services')
  })
})
