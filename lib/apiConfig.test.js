import { describe, it, expect, vi, afterEach } from 'vitest'

// apiConfig.js validates NEXT_PUBLIC_API_URL and throws at MODULE LOAD
// time — so each case needs a fresh module instance (vi.resetModules)
// re-imported after setting process.env for that case, not a single
// shared import.

const ORIGINAL_URL = process.env.NEXT_PUBLIC_API_URL

afterEach(() => {
  process.env.NEXT_PUBLIC_API_URL = ORIGINAL_URL
  vi.resetModules()
})

// Regression coverage for the production incident where a malformed
// NEXT_PUBLIC_API_URL (a bare "https" with no "://host") passed silently
// through apiConfig.js and only surfaced three layers away inside
// socket.io-client as a garbled "wss://https/socket.io/..." connection
// attempt (net::ERR_NAME_NOT_RESOLVED). apiConfig.js now validates the
// value with `new URL()` at load time so a bad value fails loudly and
// immediately, naming the exact bad value, instead of that confusing
// downstream symptom.
describe('apiConfig — NEXT_PUBLIC_API_URL validation', () => {
  it('exports a well-formed absolute URL unchanged', async () => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_API_URL = 'https://oditoai.com/api'
    const { default: API_BASE_URL } = await import('./apiConfig')
    expect(API_BASE_URL).toBe('https://oditoai.com/api')
  })

  it('accepts a local development URL unchanged', async () => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000/api'
    const { default: API_BASE_URL } = await import('./apiConfig')
    expect(API_BASE_URL).toBe('http://localhost:5000/api')
  })

  it('throws immediately when unset — never silently proceeds with an empty base URL', async () => {
    vi.resetModules()
    delete process.env.NEXT_PUBLIC_API_URL
    await expect(import('./apiConfig')).rejects.toThrow('NEXT_PUBLIC_API_URL is not defined')
  })

  it('throws a clear, actionable error for the exact production bug: a bare protocol with no host ("https")', async () => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_API_URL = 'https'
    await expect(import('./apiConfig')).rejects.toThrow(/NEXT_PUBLIC_API_URL is not a valid absolute URL: "https"/)
  })

  it('throws for a bare hostname with no protocol', async () => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_API_URL = 'oditoai.com/api'
    await expect(import('./apiConfig')).rejects.toThrow(/NEXT_PUBLIC_API_URL is not a valid absolute URL/)
  })

  it('throws for a root-relative path with no origin at all', async () => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_API_URL = '/api'
    await expect(import('./apiConfig')).rejects.toThrow(/NEXT_PUBLIC_API_URL is not a valid absolute URL/)
  })
})
