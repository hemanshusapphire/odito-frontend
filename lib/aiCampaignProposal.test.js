import { describe, it, expect } from 'vitest'
import { describeValue, describeChange, groupChangesBySection, countChanges } from './aiCampaignProposal'

describe('describeValue', () => {
  it('formats each target type into short display text', () => {
    expect(describeValue('CAMPAIGN_DAILY_BUDGET', 1500)).toBe('1,500')
    expect(describeValue('CAMPAIGN_BIDDING_STRATEGY', 'TARGET_CPA')).toBe('Target CPA')
    expect(describeValue('CAMPAIGN_LOCATION', { name: 'Pune', countryCode: 'IN', type: 'CITY' })).toBe('Pune, IN')
    expect(describeValue('CAMPAIGN_LANGUAGE', { code: 'hi', name: 'Hindi' })).toBe('Hindi')
    expect(describeValue('KEYWORD', { text: 'seo agency', matchType: 'PHRASE' })).toBe('"seo agency" (Phrase)')
    expect(describeValue('AD_HEADLINE', { text: 'Premium SEO' })).toBe('Premium SEO')
    expect(describeValue('AD_GROUP', { name: 'Local SEO', keywords: [{ text: 'x' }], ads: [{}] })).toBe('Local SEO (1 keyword, 1 ad)')
  })

  it('returns null for empty/missing values (never renders "null" or "undefined")', () => {
    expect(describeValue('CAMPAIGN_NAME', null)).toBeNull()
    expect(describeValue('CAMPAIGN_NAME', undefined)).toBeNull()
    expect(describeValue('CAMPAIGN_NAME', '')).toBeNull()
  })

  it('never renders raw HTML/markdown — only plain text is produced', () => {
    const out = describeValue('AD_HEADLINE', { text: '<img src=x onerror=alert(1)>' })
    expect(out).toBe('<img src=x onerror=alert(1)>') // preserved as inert TEXT, never interpreted
    expect(typeof out).toBe('string')
  })
})

describe('describeChange', () => {
  it('maps a raw backend change to display fields', () => {
    const d = describeChange({ id: 'c1', operation: 'replace', target: 'AD_HEADLINE', before: 'Old Headline', after: { text: 'New Headline' }, reason: 'More benefit-led.' })
    expect(d).toEqual({
      id: 'c1', kind: 'replace', section: 'Ads', fieldLabel: 'Headline',
      before: 'Old Headline', after: 'New Headline', reason: 'More benefit-led.',
    })
  })

  it('add/remove kinds carry only after/before respectively', () => {
    const add = describeChange({ id: 'c2', operation: 'add', target: 'KEYWORD', after: { text: 'best seo agency', matchType: 'BROAD' } })
    expect(add.kind).toBe('add')
    expect(add.before).toBeNull()
    expect(add.after).toBe('"best seo agency" (Broad)')

    const remove = describeChange({ id: 'c3', operation: 'remove', target: 'NEGATIVE_KEYWORD', before: { text: 'jobs', matchType: 'BROAD' } })
    expect(remove.kind).toBe('remove')
    expect(remove.after).toBeNull()
    expect(remove.before).toBe('"jobs" (Broad)')
  })
})

describe('groupChangesBySection', () => {
  it('groups into the fixed section order, omitting empty sections', () => {
    const groups = groupChangesBySection([
      { id: '1', operation: 'replace', target: 'CAMPAIGN_NAME', after: 'X' },
      { id: '2', operation: 'add', target: 'KEYWORD', adGroupId: 'ag-1', after: { text: 'a', matchType: 'BROAD' } },
      { id: '3', operation: 'add', target: 'KEYWORD', adGroupId: 'ag-1', after: { text: 'b', matchType: 'BROAD' } },
      { id: '4', operation: 'replace', target: 'AD_HEADLINE', adId: 'ad-1', before: 'x', after: { text: 'y' } },
    ])
    expect(groups.map((g) => g.section)).toEqual(['Campaign', 'Keywords', 'Ads'])
    expect(groups.find((g) => g.section === 'Keywords').changes).toHaveLength(2)
  })

  it('empty input yields an empty array', () => {
    expect(groupChangesBySection([])).toEqual([])
    expect(groupChangesBySection(undefined)).toEqual([])
  })
})

describe('countChanges', () => {
  it('counts changes, null-safe', () => {
    expect(countChanges([{ id: 1 }, { id: 2 }])).toBe(2)
    expect(countChanges(undefined)).toBe(0)
  })
})
