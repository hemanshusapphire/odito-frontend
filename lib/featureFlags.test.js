import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { isBatchVerificationEnabled } from './featureFlags'

describe('isBatchVerificationEnabled (F4-019)', () => {
  let original

  beforeEach(() => {
    original = process.env.NEXT_PUBLIC_ENABLE_BATCH_VERIFICATION
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_ENABLE_BATCH_VERIFICATION = original
  })

  it('returns false when the env var is unset', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_BATCH_VERIFICATION
    expect(isBatchVerificationEnabled()).toBe(false)
  })

  it('returns false when the env var is "false"', () => {
    process.env.NEXT_PUBLIC_ENABLE_BATCH_VERIFICATION = 'false'
    expect(isBatchVerificationEnabled()).toBe(false)
  })

  it('returns false for any value other than the exact string "true" (defensive default)', () => {
    process.env.NEXT_PUBLIC_ENABLE_BATCH_VERIFICATION = 'TRUE'
    expect(isBatchVerificationEnabled()).toBe(false)
    process.env.NEXT_PUBLIC_ENABLE_BATCH_VERIFICATION = '1'
    expect(isBatchVerificationEnabled()).toBe(false)
  })

  it('returns true when the env var is exactly "true"', () => {
    process.env.NEXT_PUBLIC_ENABLE_BATCH_VERIFICATION = 'true'
    expect(isBatchVerificationEnabled()).toBe(true)
  })
})
