import { describe, it, expect } from 'vitest'
import { describeApplyError } from './wordPressApplyError'

describe('describeApplyError', () => {
  it('returns null for no error', () => {
    expect(describeApplyError(null)).toBe(null)
    expect(describeApplyError(undefined)).toBe(null)
  })

  it('flags a 409 as a conflict requiring an explicit refresh, never an automatic one', () => {
    const err = Object.assign(new Error('The live value on WordPress has changed since this fix was reviewed. Refresh and try again.'), { status: 409, code: 'CONFLICT' })
    const info = describeApplyError(err)
    expect(info.isConflict).toBe(true)
    expect(info.requiresRefresh).toBe(true)
    expect(info.wordpressWriteSucceeded).toBe(false)
    expect(info.message).toContain('changed since this fix was reviewed')
  })

  it('flags the VersionError-after-successful-write case distinctly via details.wordpressWriteSucceeded', () => {
    const err = Object.assign(new Error('task changed concurrently'), {
      status: 409, code: 'CONFLICT', details: { field: 'title', wordpressWriteSucceeded: true },
    })
    const info = describeApplyError(err)
    expect(info.isConflict).toBe(true)
    expect(info.wordpressWriteSucceeded).toBe(true)
  })

  it('never reports a non-409 error as a conflict, and never requires a refresh for it', () => {
    const err = Object.assign(new Error('This field cannot currently be edited.'), { status: 422, code: 'FIELD_NOT_WRITABLE' })
    const info = describeApplyError(err)
    expect(info.isConflict).toBe(false)
    expect(info.requiresRefresh).toBe(false)
  })

  it('prefers the backend-provided message when present, over the generic per-status fallback', () => {
    const err = Object.assign(new Error('A very specific backend message.'), { status: 429 })
    expect(describeApplyError(err).message).toBe('A very specific backend message.')
  })

  it('falls back to a safe, generic message per status code when the backend sent none', () => {
    const err = { status: 429 } // no .message at all — never happens via apiService, but must degrade safely
    expect(describeApplyError(err).message).toMatch(/too many attempts/i)
  })

  const statusFallbacks = [
    [400, /invalid/i],
    [401, /session/i],
    [403, /permission/i],
    [404, /could not be found/i],
    [409, /changed on wordpress/i],
    [422, /cannot currently be modified/i],
    [429, /too many attempts/i],
    [500, /temporary problem/i],
    [502, /temporary problem/i],
  ]
  for (const [status, pattern] of statusFallbacks) {
    it(`provides a safe fallback message for HTTP ${status} with no backend message`, () => {
      expect(describeApplyError({ status }).message).toMatch(pattern)
    })
  }

  it('never exposes raw error internals — only returns fields it explicitly constructs', () => {
    const err = Object.assign(new Error('safe message'), { status: 500, stack: 'at internal.js:42', config: { headers: { Authorization: 'Basic secret' } } })
    const info = describeApplyError(err)
    expect(Object.keys(info).sort()).toEqual(
      ['isConflict', 'isProfileProblem', 'isRecommendationRequired', 'message', 'nonRetryable', 'partialWrite', 'regenerateRequired', 'requiresRefresh', 'wordpressWriteSucceeded'].sort()
    )
    // Nothing from the raw error (stack, config/Authorization) leaks through.
    expect(JSON.stringify(info)).not.toMatch(/internal\.js|Basic secret|Authorization/)
  })

  it('flags RECOMMENDATION_REQUIRED as non-retryable and never requiring a refresh — retrying cannot succeed without generating a recommendation first', () => {
    const err = Object.assign(new Error('No AI recommendation is linked to this task yet — generate one before applying a WordPress fix.'), {
      status: 422, code: 'RECOMMENDATION_REQUIRED',
    })
    const info = describeApplyError(err)
    expect(info.isRecommendationRequired).toBe(true)
    expect(info.nonRetryable).toBe(true)
    expect(info.requiresRefresh).toBe(false)
    expect(info.isConflict).toBe(false)
    expect(info.message).toContain('No AI recommendation is linked')
  })

  it('every OTHER error code stays retryable (nonRetryable: false), including a generic WRITE_FAILED', () => {
    const err = Object.assign(new Error('Failed to write this change to WordPress.'), { status: 502, code: 'WRITE_FAILED' })
    const info = describeApplyError(err)
    expect(info.nonRetryable).toBe(false)
    expect(info.isRecommendationRequired).toBe(false)
  })

  it('FAQ_CONTENT_CHANGED: a warning-class 409, but refreshing the live value cannot fix it — regenerate is required and retrying the same request is pointless', () => {
    const err = Object.assign(new Error('The FAQ on this page no longer matches the generated schema.'), {
      status: 409, code: 'FAQ_CONTENT_CHANGED', details: { field: 'faq_schema', regenerateRequired: true },
    })
    const info = describeApplyError(err)
    expect(info.isConflict).toBe(true)
    expect(info.regenerateRequired).toBe(true)
    expect(info.requiresRefresh).toBe(false)
    expect(info.nonRetryable).toBe(true)
    expect(info.wordpressWriteSucceeded).toBe(false)
    expect(info.message).toContain('no longer matches')
  })

  it('a plain CONFLICT is unaffected by the FAQ handling (still a refresh, still retryable)', () => {
    const info = describeApplyError(Object.assign(new Error('x'), { status: 409, code: 'CONFLICT' }))
    expect(info.regenerateRequired).toBe(false)
    expect(info.requiresRefresh).toBe(true)
    expect(info.nonRetryable).toBe(false)
  })

  it('falls back to a safe FAQ_CONTENT_CHANGED message when the backend sent none', () => {
    expect(describeApplyError({ status: 409, code: 'FAQ_CONTENT_CHANGED' }).message).toMatch(/no longer matches/i)
  })

  it('falls back to a safe RECOMMENDATION_REQUIRED message when the backend sent none', () => {
    const err = { status: 422, code: 'RECOMMENDATION_REQUIRED' }
    expect(describeApplyError(err).message).toMatch(/generate one/i)
  })
})
