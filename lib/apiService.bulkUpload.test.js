import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// apiService reads NEXT_PUBLIC_API_URL at import time via apiConfig.
vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test.local/api')

const { default: apiService } = await import('./apiService')

/**
 * Bulk Upload — apiService request shape. Confirms each method hits the
 * right backend endpoint with the right payload, without a real network.
 */

let fetchMock

beforeEach(() => {
  localStorage.setItem('token', 'jwt-123')
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
})

function jsonOk(body) {
  return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body), headers: new Headers() })
}

describe('validateBulkUpload', () => {
  it('POSTs multipart/form-data with projectId + file to /bulk-upload/validate', async () => {
    fetchMock.mockReturnValue(jsonOk({ success: true, data: { batch: { id: 'b1' }, validation: { total: 1, valid: 1, invalid: 0 } } }))
    const file = new File(['a,b\n1,2'], 'posts.csv', { type: 'text/csv' })

    const res = await apiService.validateBulkUpload('proj-1', file)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.test.local/api/social/publishing/bulk-upload/validate')
    expect(opts.method).toBe('POST')
    expect(opts.body).toBeInstanceOf(FormData)
    expect(opts.body.get('projectId')).toBe('proj-1')
    expect(opts.body.get('file')).toBe(file)
    expect(opts.headers.Authorization).toBe('Bearer jwt-123')
    // no explicit Content-Type — the browser sets the multipart boundary
    expect(opts.headers['Content-Type']).toBeUndefined()
    expect(res.data.batch.id).toBe('b1')
  })

  it('throws with .details.code + .status on a backend error', async () => {
    fetchMock.mockReturnValue(Promise.resolve({
      ok: false, status: 413,
      json: () => Promise.resolve({ success: false, message: 'File is larger than 10 MB.', details: { code: 'FILE_TOO_LARGE' } }),
      headers: new Headers(),
    }))
    await expect(apiService.validateBulkUpload('proj-1', new File(['x'], 'x.csv'))).rejects.toMatchObject({
      message: 'File is larger than 10 MB.',
      details: { code: 'FILE_TOO_LARGE' },
      status: 413,
    })
  })
})

describe('importBulkUpload', () => {
  it('POSTs JSON { projectId, mode } to /bulk-upload/:batchId/import', async () => {
    fetchMock.mockReturnValue(jsonOk({ success: true, data: { result: {}, batch: {}, schedulerEnabled: true, warnings: [] } }))

    await apiService.importBulkUpload('proj-1', 'batch-9', 'all-as-draft')

    const [url, opts] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.test.local/api/social/publishing/bulk-upload/batch-9/import')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toEqual({ projectId: 'proj-1', mode: 'all-as-draft' })
    expect(opts.headers['Content-Type']).toBe('application/json')
  })
})

describe('getBulkUploadRows', () => {
  it('GETs /bulk-upload/:batchId/rows with projectId, page, limit and optional status', async () => {
    fetchMock.mockReturnValue(jsonOk({ success: true, data: [], pagination: {} }))
    await apiService.getBulkUploadRows('proj-1', 'b2', { status: 'invalid', page: 2, limit: 50 })
    const [url] = fetchMock.mock.calls[0]
    expect(url).toContain('/social/publishing/bulk-upload/b2/rows?')
    expect(url).toContain('projectId=proj-1')
    expect(url).toContain('page=2')
    expect(url).toContain('limit=50')
    expect(url).toContain('status=invalid')
  })
})

describe('downloadBulkUploadTemplate / downloadBulkUploadErrors', () => {
  it('template: fetches the endpoint as a blob and drives an <a download> click', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:x', revokeObjectURL: vi.fn() })
    fetchMock.mockReturnValue(Promise.resolve({
      ok: true, status: 200,
      blob: () => Promise.resolve(new Blob(['csv'])),
      headers: new Headers({ 'Content-Disposition': 'attachment; filename="odito-bulk-upload-template.csv"' }),
    }))

    await apiService.downloadBulkUploadTemplate('proj-1')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toContain('/social/publishing/bulk-upload/template?')
    expect(url).toContain('projectId=proj-1')
    expect(clickSpy).toHaveBeenCalledTimes(1)
    clickSpy.mockRestore()
  })

  it('errors: hits /bulk-upload/:batchId/errors?format=csv', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:x', revokeObjectURL: vi.fn() })
    fetchMock.mockReturnValue(Promise.resolve({
      ok: true, status: 200, blob: () => Promise.resolve(new Blob(['csv'])), headers: new Headers(),
    }))

    await apiService.downloadBulkUploadErrors('proj-1', 'batch-77')

    const [url] = fetchMock.mock.calls[0]
    expect(url).toContain('/social/publishing/bulk-upload/batch-77/errors?')
    expect(url).toContain('format=csv')
    clickSpy.mockRestore()
  })
})
