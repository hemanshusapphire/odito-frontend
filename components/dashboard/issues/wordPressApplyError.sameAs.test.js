import { describe, it, expect } from 'vitest'
import { describeApplyError } from './wordPressApplyError'

describe('describeApplyError — sameAs profile errors', () => {
  it('INVALID_PROFILES uses the backend message, is not a conflict, and is retryable once the entries are fixed', () => {
    const info = describeApplyError({ status: 400, code: 'INVALID_PROFILES', message: 'URL must start with http:// or https://.' })
    expect(info.message).toBe('URL must start with http:// or https://.')
    expect(info.isConflict).toBe(false)
    expect(info.requiresRefresh).toBe(false)
    expect(info.nonRetryable).toBe(false)
    expect(info.isProfileProblem).toBe(true)
  })

  it('INVALID_PROFILES without a message never falls back to "close and reopen this dialog"', () => {
    const info = describeApplyError({ status: 400, code: 'INVALID_PROFILES' })
    expect(info.message).toMatch(/social profile URLs are not valid/i)
    expect(info.message).not.toMatch(/reopen/i)
  })

  it('PROFILE_PROTECTED is a profile problem, not a refresh-worthy conflict', () => {
    const info = describeApplyError({ status: 422, code: 'PROFILE_PROTECTED' })
    expect(info.isProfileProblem).toBe(true)
    expect(info.requiresRefresh).toBe(false)
    expect(info.message).toMatch(/managed by Rank Math/i)
  })

  it('a stale-profiles CONFLICT still requires an explicit refresh', () => {
    const info = describeApplyError({ status: 409, code: 'CONFLICT', message: 'The social profiles on WordPress have changed since this dialog was opened.' })
    expect(info.isConflict).toBe(true)
    expect(info.requiresRefresh).toBe(true)
  })

  it('a write that failed part-way is flagged so the dialog can say some profiles may be saved', () => {
    const info = describeApplyError({ status: 502, code: 'WRITE_FAILED', message: 'Failed to write.', details: { partialWrite: true, profilesWritten: 1 } })
    expect(info.partialWrite).toBe(true)
    expect(describeApplyError({ status: 502, code: 'WRITE_FAILED' }).partialWrite).toBe(false)
  })
})
