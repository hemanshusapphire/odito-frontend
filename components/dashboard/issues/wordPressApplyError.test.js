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
    expect(Object.keys(info).sort()).toEqual(['isConflict', 'message', 'requiresRefresh', 'wordpressWriteSucceeded'])
  })
})
