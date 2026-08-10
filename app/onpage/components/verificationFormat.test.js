import { describe, it, expect } from 'vitest'
import { aiStatusLabel, formatCompletedAt, formatDuration } from './verificationFormat'

describe('aiStatusLabel', () => {
  it('maps known statuses to display labels', () => {
    expect(aiStatusLabel('SUCCESS')).toBe('Updated')
    expect(aiStatusLabel('FAILED')).toBe('Failed')
    expect(aiStatusLabel('SKIPPED')).toBe('Skipped')
  })

  it('passes through unknown values unchanged', () => {
    expect(aiStatusLabel('SOMETHING_ELSE')).toBe('SOMETHING_ELSE')
  })
})

describe('formatCompletedAt', () => {
  it('returns an em dash for missing values', () => {
    expect(formatCompletedAt(null)).toBe('—')
    expect(formatCompletedAt(undefined)).toBe('—')
  })

  it('formats an ISO date into a localized date/time string', () => {
    const result = formatCompletedAt('2026-07-28T10:00:00.000Z')
    expect(result).toContain('2026')
  })
})

describe('formatDuration', () => {
  it('returns an em dash for missing values', () => {
    expect(formatDuration(null)).toBe('—')
    expect(formatDuration(undefined)).toBe('—')
  })

  it('formats sub-second durations in ms', () => {
    expect(formatDuration(500)).toBe('500ms')
  })

  it('formats sub-minute durations in seconds', () => {
    expect(formatDuration(42500)).toBe('42.5s')
  })

  it('formats multi-minute durations as Xm Ys', () => {
    expect(formatDuration(125000)).toBe('2m 5s')
  })
})
