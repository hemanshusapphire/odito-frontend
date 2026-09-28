import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test.local/api')

const { default: apiService } = await import('./apiService')

/**
 * The Download button's only network path. It must call the backend's
 * on-demand-built endpoint (never a static file URL that a CDN/browser could
 * keep serving at an old version) and save under the server-chosen,
 * version-bearing filename.
 */

let fetchMock
let clicked

beforeEach(() => {
  localStorage.setItem('token', 'jwt-123')
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  clicked = null
  window.URL.createObjectURL = vi.fn(() => 'blob:x')
  window.URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () { clicked = this })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
})

const zipResponse = (disposition) => Promise.resolve({
  ok: true,
  blob: () => Promise.resolve(new Blob(['zip'])),
  headers: new Headers(disposition ? { 'Content-Disposition': disposition } : {}),
})

describe('downloadSeoBridgePlugin', () => {
  it('hits the authenticated on-demand endpoint', async () => {
    fetchMock.mockReturnValue(zipResponse('attachment; filename="odito-seo-bridge-1.3.0.zip"'))
    await apiService.downloadSeoBridgePlugin()
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.test.local/api/wordpress/plugin/seo-bridge/download')
    expect(opts.headers.Authorization).toBe('Bearer jwt-123')
  })

  it("saves under the server's versioned filename", async () => {
    fetchMock.mockReturnValue(zipResponse('attachment; filename="odito-seo-bridge-1.3.0.zip"'))
    await apiService.downloadSeoBridgePlugin()
    expect(clicked.download).toBe('odito-seo-bridge-1.3.0.zip')
  })

  it('falls back to a plain name when no Content-Disposition is exposed', async () => {
    fetchMock.mockReturnValue(zipResponse(null))
    await apiService.downloadSeoBridgePlugin()
    expect(clicked.download).toBe('odito-seo-bridge.zip')
  })

  it('surfaces a failed download instead of saving an error page as a ZIP', async () => {
    fetchMock.mockReturnValue(Promise.resolve({ ok: false, status: 404, headers: new Headers() }))
    await expect(apiService.downloadSeoBridgePlugin()).rejects.toThrow(/Failed to download the Odito SEO Bridge plugin package/)
    expect(clicked).toBeNull()
  })
})
