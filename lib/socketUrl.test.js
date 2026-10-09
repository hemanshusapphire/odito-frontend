import { describe, it, expect } from 'vitest'
import { resolveSocketOrigin } from './socketUrl'

// Regression: socketService used API_BASE_URL.replace('/api', ''), which for
// "https://api.oditoai.com/api" matched the "/api" inside "//api." and produced
// "https:/.oditoai.com/api" -> socket.io-client connected to wss://https/socket.io/.
describe('resolveSocketOrigin', () => {
  it('same-origin production API (https://oditoai.com/api)', () => {
    expect(resolveSocketOrigin({ apiUrl: 'https://oditoai.com/api' })).toBe('https://oditoai.com')
  })

  it('API on an "api." subdomain — the exact production bug', () => {
    expect(resolveSocketOrigin({ apiUrl: 'https://api.oditoai.com/api' })).toBe('https://api.oditoai.com')
    expect(resolveSocketOrigin({ apiUrl: 'https://api.oditoai.com' })).toBe('https://api.oditoai.com')
  })

  it('local development keeps the backend port', () => {
    expect(resolveSocketOrigin({ apiUrl: 'http://localhost:5000/api' })).toBe('http://localhost:5000')
  })

  it('drops default ports, trailing slashes and paths', () => {
    expect(resolveSocketOrigin({ apiUrl: 'https://oditoai.com:443/api/' })).toBe('https://oditoai.com')
  })

  it('explicit NEXT_PUBLIC_SOCKET_URL wins for a separately hosted backend', () => {
    expect(
      resolveSocketOrigin({ socketUrl: 'https://realtime.oditoai.com', apiUrl: 'https://oditoai.com/api' })
    ).toBe('https://realtime.oditoai.com')
  })

  it('normalises ws(s):// to http(s):// so socket.io negotiates the transport', () => {
    expect(resolveSocketOrigin({ socketUrl: 'wss://realtime.oditoai.com/socket.io' })).toBe('https://realtime.oditoai.com')
    expect(resolveSocketOrigin({ socketUrl: 'ws://localhost:5000' })).toBe('http://localhost:5000')
  })

  it('blank socketUrl falls back to the API origin', () => {
    expect(resolveSocketOrigin({ socketUrl: '  ', apiUrl: 'https://oditoai.com/api' })).toBe('https://oditoai.com')
  })

  it('throws when nothing is configured', () => {
    expect(() => resolveSocketOrigin({})).toThrow(/NEXT_PUBLIC_API_URL/)
    expect(() => resolveSocketOrigin()).toThrow(/NEXT_PUBLIC_API_URL/)
  })

  it.each(['https', 'wss://', 'https://', 'https:/', 'oditoai.com', '/api', 'not a url'])(
    'rejects invalid API value %j',
    (apiUrl) => {
      expect(() => resolveSocketOrigin({ apiUrl })).toThrow(/NEXT_PUBLIC_API_URL/)
    }
  )

  it('rejects a protocol word used as a hostname (the wss://https symptom)', () => {
    expect(() => resolveSocketOrigin({ apiUrl: 'https://https/api' })).toThrow(/invalid host/)
    expect(() => resolveSocketOrigin({ socketUrl: 'wss://wss' })).toThrow(/invalid host/)
  })

  it('rejects unsupported protocols and names the offending variable', () => {
    expect(() => resolveSocketOrigin({ socketUrl: 'ftp://oditoai.com' })).toThrow(/NEXT_PUBLIC_SOCKET_URL/)
  })

  it('never returns a result with a protocol word as host', () => {
    for (const apiUrl of ['https://oditoai.com/api', 'https://api.oditoai.com/api', 'http://localhost:5000/api']) {
      const { hostname } = new URL(resolveSocketOrigin({ apiUrl }))
      expect(['http', 'https', 'ws', 'wss']).not.toContain(hostname)
    }
  })
})
