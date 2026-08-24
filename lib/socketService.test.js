import { describe, it, expect, vi, afterEach } from 'vitest'

// socketService is a singleton computed at import time from apiConfig's
// API_BASE_URL, so each case needs a fresh module instance (vi.resetModules)
// re-imported after setting process.env for that case.

const ORIGINAL_URL = process.env.NEXT_PUBLIC_API_URL

afterEach(() => {
  process.env.NEXT_PUBLIC_API_URL = ORIGINAL_URL
  vi.resetModules()
})

// Regression coverage for the production "wss://https/socket.io/..."
// incident: socketService never manually builds a ws://\wss:// string
// itself — it hands socket.io-client a plain http(s) origin and lets it
// derive the websocket URL internally (the officially-recommended
// approach). These tests lock down that the origin socketService computes
// is always a clean http(s) URL with no trailing "/api" and, critically,
// never just a bare protocol fragment — the exact shape that produced the
// malformed "wss://https/..." URL in production.
describe('socketService — server origin derivation (never a manually-built ws:// string)', () => {
  it('strips a trailing "/api" from the configured API base URL to get the Socket.IO origin', async () => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_API_URL = 'https://oditoai.com/api'
    const { default: socketService } = await import('./socketService')
    expect(socketService.serverUrl).toBe('https://oditoai.com')
  })

  it('works identically for a local development origin', async () => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000/api'
    const { default: socketService } = await import('./socketService')
    expect(socketService.serverUrl).toBe('http://localhost:5000')
  })

  it('the derived origin is always a real, parseable http(s) URL — never a bare protocol fragment', async () => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_API_URL = 'https://staging.oditoai.com/api'
    const { default: socketService } = await import('./socketService')
    expect(() => new URL(socketService.serverUrl)).not.toThrow()
    const parsed = new URL(socketService.serverUrl)
    expect(['http:', 'https:']).toContain(parsed.protocol)
    expect(parsed.host).not.toBe('') // never "https" (or any protocol name) used as the host
  })
})
