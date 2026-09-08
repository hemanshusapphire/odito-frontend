import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import BulkUploadWizard from './BulkUploadWizard'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('@/contexts/ProjectContext', () => ({
  useProject: () => ({ activeProjectId: 'proj-1' }),
}))

let validateAsync
let importAsync
let importPending
let templateAsync
let errorsAsync
let rowsResult
let batchQueryResult
let progressResult

vi.mock('@/hooks/useBulkUpload', () => ({
  useValidateBulkUpload: () => ({ mutateAsync: validateAsync, isPending: false }),
  useImportBulkUpload: () => ({ mutateAsync: importAsync, isPending: importPending }),
  useDownloadBulkUploadTemplate: () => ({ mutateAsync: templateAsync, isPending: false }),
  useDownloadBulkUploadErrors: () => ({ mutateAsync: errorsAsync, isPending: false }),
  useBulkUploadRows: () => rowsResult,
  useBulkUploadBatch: () => batchQueryResult,
  bulkKeys: {
    batch: (p, b) => ['social', 'bulk-upload', 'batch', p, b],
    rowsForBatch: (p, b) => ['social', 'bulk-upload', 'rows', p, b],
  },
}))

// Mock the progress hook so socketService (and apiConfig) never load.
vi.mock('@/hooks/useBulkImportProgress', () => ({
  useBulkImportProgress: () => progressResult,
}))

let container
let root
const notify = vi.fn()
const onGoToTab = vi.fn()

function render() {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(React.createElement(BulkUploadWizard, { notify, onGoToTab }))
  })
}

function btn(text) {
  return Array.from(container.querySelectorAll('button')).find((b) => b.textContent.trim().toLowerCase().includes(text.toLowerCase()))
}

function makeFile(name, size, type = 'text/csv') {
  const f = new File(['x'], name, { type })
  Object.defineProperty(f, 'size', { value: size })
  return f
}

async function selectFileAndValidate(file = makeFile('posts.csv', 1234)) {
  const input = container.querySelector('input[type="file"]')
  Object.defineProperty(input, 'files', { value: [file], configurable: true })
  await act(async () => { input.dispatchEvent(new Event('change', { bubbles: true })) })
  await act(async () => { btn('Validate File').click(); await Promise.resolve() })
}

const flush = () => new Promise((r) => setTimeout(r, 0))

beforeEach(() => {
  vi.clearAllMocks()
  try { window.sessionStorage.clear() } catch { /* */ }
  validateAsync = vi.fn().mockResolvedValue({
    data: { batch: { id: 'batch-1', status: 'ready' }, validation: { total: 10, valid: 8, invalid: 2 } },
  })
  importAsync = vi.fn().mockResolvedValue({
    data: {
      batch: { id: 'batch-1', status: 'completed', importMode: 'valid-only' },
      result: { attempted: 8, imported: 7, failed: 1, drafts: 5, scheduled: 2 },
      schedulerEnabled: true,
      warnings: [],
      replay: false,
    },
  })
  importPending = false
  templateAsync = vi.fn().mockResolvedValue(undefined)
  errorsAsync = vi.fn().mockResolvedValue(undefined)
  rowsResult = { data: { data: [], pagination: { page: 1, pages: 1, total: 0 } }, isLoading: false, isFetching: false }
  batchQueryResult = { data: undefined, isError: false, isFetching: false, refetch: vi.fn() }
  progressResult = { status: 'idle', processed: 0, total: 0, attempted: 0, imported: 0, failed: 0, drafts: 0, scheduled: 0, currentRowNumber: null, code: null, message: null, lastEventAt: null, reconnectedAt: null }
})

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

describe('BulkUploadWizard — upload step', () => {
  it('renders the upload UI', () => {
    render()
    expect(container.textContent).toContain('Drag & drop your file here')
    expect(btn('Validate File')).toBeTruthy()
    expect(btn('Download CSV template')).toBeTruthy()
  })

  it('rejects an unsupported file client-side and never calls validate', async () => {
    render()
    const input = container.querySelector('input[type="file"]')
    Object.defineProperty(input, 'files', { value: [makeFile('evil.exe', 100, 'application/octet-stream')], configurable: true })
    await act(async () => { input.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(container.textContent).toMatch(/Unsupported file type/i)
    expect(btn('Validate File').disabled).toBe(true)
  })

  it('rejects an oversized file client-side', async () => {
    render()
    const input = container.querySelector('input[type="file"]')
    Object.defineProperty(input, 'files', { value: [makeFile('big.csv', 11 * 1024 * 1024)], configurable: true })
    await act(async () => { input.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(container.textContent).toMatch(/larger than 10 MB/i)
  })

  it('Download CSV template triggers the template mutation', async () => {
    render()
    await act(async () => { btn('Download CSV template').click(); await flush() })
    expect(templateAsync).toHaveBeenCalledTimes(1)
  })

  it('validate sends the selected File to the mutation', async () => {
    render()
    const file = makeFile('posts.csv', 999)
    await selectFileAndValidate(file)
    expect(validateAsync).toHaveBeenCalledWith(file)
  })

  it('a 413 FILE_TOO_LARGE from the backend is shown with its code, staying on the upload step', async () => {
    validateAsync = vi.fn().mockRejectedValue(Object.assign(new Error('File is larger than 10 MB.'), { details: { code: 'FILE_TOO_LARGE' }, status: 413 }))
    render()
    await selectFileAndValidate()
    await act(async () => { await flush() })
    expect(container.textContent).toContain('File is larger than 10 MB.')
    expect(container.textContent).toContain('FILE_TOO_LARGE')
    expect(btn('Validate File')).toBeTruthy() // still on the upload step
    expect(container.textContent).not.toContain('Review & import')
  })
})

describe('BulkUploadWizard — review step', () => {
  async function goToReview() {
    render()
    await selectFileAndValidate()
    await act(async () => { await flush() })
  }

  it('displays the backend validation counts', async () => {
    await goToReview()
    expect(container.textContent).toContain('Review & import')
    expect(container.textContent).toContain('8') // valid
    expect(container.textContent).toContain('2') // invalid
  })

  it('shows invalid rows with the backend error field/code/message verbatim', async () => {
    rowsResult = {
      data: {
        data: [{
          rowNumber: 3, status: 'invalid',
          normalized: { platform: null, content: 'hi', media: [], action: 'draft', scheduledAt: null, timezone: null },
          errors: [{ field: 'platform', code: 'UNSUPPORTED_PLATFORM', message: 'Unsupported platform "pinterest".' }],
        }],
        pagination: { page: 1, pages: 1, total: 1 },
      },
      isLoading: false, isFetching: false,
    }
    await goToReview()
    expect(container.textContent).toContain('platform: UNSUPPORTED_PLATFORM')
    expect(container.textContent).toContain('Unsupported platform "pinterest".')
  })

  it('valid-only is the default import mode', async () => {
    await goToReview()
    const validOnly = container.querySelector('input[type="radio"][value="valid-only"]')
    const allDraft = container.querySelector('input[type="radio"][value="all-as-draft"]')
    expect(validOnly.checked).toBe(true)
    expect(allDraft.checked).toBe(false)
  })

  it('import sends { batchId, mode } with the default mode', async () => {
    await goToReview()
    await act(async () => { btn('valid rows').click(); await flush() })
    expect(importAsync).toHaveBeenCalledWith({ batchId: 'batch-1', mode: 'valid-only' })
  })

  it('choosing all-as-draft sends the exact backend value', async () => {
    await goToReview()
    const allDraft = container.querySelector('input[type="radio"][value="all-as-draft"]')
    await act(async () => { allDraft.click() })
    await act(async () => { btn('valid rows').click(); await flush() })
    expect(importAsync).toHaveBeenCalledWith({ batchId: 'batch-1', mode: 'all-as-draft' })
  })

  it('a 409 IMPORT_ALREADY_IN_PROGRESS is shown as an actionable message, staying on review', async () => {
    importAsync = vi.fn().mockRejectedValue(Object.assign(new Error('nope'), { details: { code: 'IMPORT_ALREADY_IN_PROGRESS' }, status: 409 }))
    await goToReview()
    await act(async () => { btn('valid rows').click(); await flush() })
    expect(container.textContent).toMatch(/already running/i)
    expect(container.textContent).toContain('IMPORT_ALREADY_IN_PROGRESS')
    expect(container.textContent).toContain('Review & import') // still on review
  })

  it('imported content is rendered as text, never HTML', async () => {
    rowsResult = {
      data: {
        data: [{
          rowNumber: 1, status: 'valid',
          normalized: { platform: 'facebook', content: '<img src=x onerror=alert(1)>', media: [], action: 'draft', scheduledAt: null, timezone: null },
          errors: [],
        }],
        pagination: { page: 1, pages: 1, total: 1 },
      },
      isLoading: false, isFetching: false,
    }
    await goToReview()
    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toContain('<img src=x onerror=alert(1)>')
  })

  it('does not render sensitive backend fields even if present on a row', async () => {
    rowsResult = {
      data: {
        data: [{
          rowNumber: 1, status: 'valid', idempotencyKey: 'SECRET_IDEMP', raw: { fileHash: 'SECRET_HASH' },
          normalized: { platform: 'facebook', content: 'ok', media: [], action: 'draft', scheduledAt: null, timezone: null },
          errors: [],
        }],
        pagination: { page: 1, pages: 1, total: 1 },
      },
      isLoading: false, isFetching: false,
    }
    await goToReview()
    expect(container.textContent).not.toContain('SECRET_IDEMP')
    expect(container.textContent).not.toContain('SECRET_HASH')
  })
})

describe('BulkUploadWizard — result step', () => {
  async function goToResult(importOverride) {
    if (importOverride) importAsync = vi.fn().mockResolvedValue({ data: importOverride })
    render()
    await selectFileAndValidate()
    await act(async () => { await flush() })
    await act(async () => { btn('valid rows').click(); await flush() })
  }

  it('displays the result counts', async () => {
    await goToResult()
    expect(container.textContent).toContain('Import complete')
    expect(container.textContent).toContain('7') // imported
    expect(container.textContent).toContain('1') // failed
  })

  it('a partial failure is stated clearly', async () => {
    await goToResult()
    expect(container.textContent).toMatch(/7 of 8 attempted rows imported, 1 failed/i)
  })

  it('renders the scheduler-disabled warning verbatim when schedulerEnabled is false', async () => {
    await goToResult({
      batch: { id: 'batch-1', status: 'completed', importMode: 'valid-only' },
      result: { attempted: 3, imported: 3, failed: 0, drafts: 0, scheduled: 3 },
      schedulerEnabled: false,
      warnings: ['Scheduled publishing is disabled on this environment (SOCIAL_SCHEDULER_ENABLED is not "true").'],
      replay: false,
    })
    expect(container.textContent).toContain('Scheduled publishing is disabled on this environment')
  })

  it('offers the error report only when there are failures, and it calls the errors mutation', async () => {
    await goToResult()
    const report = btn('Download error report')
    expect(report).toBeTruthy()
    await act(async () => { report.click(); await flush() })
    expect(errorsAsync).toHaveBeenCalledWith('batch-1')
  })

  it('no error report button when nothing failed and nothing was invalid', async () => {
    validateAsync = vi.fn().mockResolvedValue({ data: { batch: { id: 'batch-1' }, validation: { total: 3, valid: 3, invalid: 0 } } })
    await goToResult({
      batch: { id: 'batch-1', status: 'completed', importMode: 'valid-only' },
      result: { attempted: 3, imported: 3, failed: 0, drafts: 3, scheduled: 0 },
      schedulerEnabled: true, warnings: [], replay: false,
    })
    expect(btn('Download error report')).toBeFalsy()
  })

  it('navigation buttons switch the Publishing tab and "Upload another file" resets the wizard', async () => {
    await goToResult()
    await act(async () => { btn('View Posts').click() })
    expect(onGoToTab).toHaveBeenCalledWith('posts')
    await act(async () => { btn('View Post History').click() })
    expect(onGoToTab).toHaveBeenCalledWith('history')
    await act(async () => { btn('Upload another file').click() })
    expect(container.textContent).toContain('Drag & drop your file here')
  })
})

describe('BulkUploadWizard — Phase 5 live progress', () => {
  it('shows the real "Importing N of M…" count from the progress hook (no fake percentage)', async () => {
    importPending = true
    progressResult = { ...progressResult, status: 'importing', processed: 37, total: 200, imported: 30, failed: 7 }
    render()
    await selectFileAndValidate()
    await act(async () => { await flush() })
    expect(container.textContent).toContain('Importing 37 of 200…')
    expect(container.textContent).toContain('Imported 30')
    expect(container.textContent).toContain('Failed 7')
    // no progress bar / percentage
    expect(container.querySelector('progress')).toBeNull()
    expect(container.textContent).not.toMatch(/\d+%/)
  })

  it('when the import HTTP response is lost but the socket reported completion, it replays once and lands on Results', async () => {
    importAsync = vi.fn()
      .mockRejectedValueOnce(new Error('Network error while importing.')) // no .code -> network-ish
      .mockResolvedValue({
        data: {
          batch: { id: 'batch-1', status: 'completed', importMode: 'valid-only' },
          result: { attempted: 8, imported: 8, failed: 0, drafts: 8, scheduled: 0 },
          schedulerEnabled: true, warnings: [], replay: true,
        },
      })
    progressResult = { ...progressResult, status: 'completed', total: 8, imported: 8 }
    render()
    await selectFileAndValidate()
    await act(async () => { await flush() })
    await act(async () => { btn('valid rows').click(); await flush(); await flush() })

    expect(importAsync).toHaveBeenCalledTimes(2)
    expect(container.textContent).toContain('Import complete')
  })
})

describe('BulkUploadWizard — Phase 5 refresh recovery', () => {
  function persistSession(data) {
    window.sessionStorage.setItem('odito.bulkUpload.proj-1', JSON.stringify({
      batchId: 'batch-9', step: 'review', mode: 'valid-only',
      validation: { total: 5, valid: 5, invalid: 0 }, savedAt: Date.now(), ...data,
    }))
  }
  const batchDoc = (status, counts = {}) => ({
    data: { data: { batch: { id: 'batch-9', status, importMode: 'valid-only', counts: { total: 5, valid: 5, invalid: 0, ...counts } } } },
    isError: false, isFetching: false, refetch: vi.fn(),
  })

  it('recovers a still-READY batch straight to the Review step', async () => {
    persistSession()
    batchQueryResult = batchDoc('ready')
    render()
    await act(async () => { await flush() })
    expect(container.textContent).toContain('Review & import')
    expect(container.textContent).not.toContain('Resuming your bulk upload')
  })

  it('recovers a COMPLETED batch by replaying the import (idempotent) → Results', async () => {
    persistSession()
    batchQueryResult = batchDoc('completed')
    render()
    await act(async () => { await flush(); await flush() })
    expect(importAsync).toHaveBeenCalledWith({ batchId: 'batch-9', mode: 'valid-only' })
    expect(container.textContent).toContain('Import complete')
  })

  it('shows a recovery panel while the batch is still IMPORTING, with backend counts and a Check status action', async () => {
    persistSession()
    batchQueryResult = batchDoc('importing', { imported: 12, failed: 0 })
    render()
    await act(async () => { await flush() })
    expect(container.textContent).toContain('An import for this file is still running')
    expect(container.textContent).toContain('Imported 12')
    const check = btn('Check status')
    expect(check).toBeTruthy()
    await act(async () => { check.click() })
    expect(batchQueryResult.refetch).toHaveBeenCalled()
  })

  it('a FAILED-mid-import batch recovers to Review with a retry banner', async () => {
    persistSession()
    batchQueryResult = batchDoc('failed')
    render()
    await act(async () => { await flush() })
    expect(container.textContent).toContain('Review & import')
    expect(container.textContent).toMatch(/interrupted before finishing/i)
  })

  it('an unrecoverable (404) persisted batch clears the session and returns to Upload', async () => {
    persistSession()
    batchQueryResult = { data: undefined, isError: true, isFetching: false, refetch: vi.fn() }
    render()
    await act(async () => { await flush() })
    expect(container.textContent).toContain('Drag & drop your file here')
    expect(container.textContent).toMatch(/could not be found/i)
    expect(window.sessionStorage.getItem('odito.bulkUpload.proj-1')).toBeNull()
  })

  it('with no persisted session, the wizard starts clean on Upload', async () => {
    render()
    expect(container.textContent).toContain('Drag & drop your file here')
    expect(container.textContent).not.toContain('Resuming your bulk upload')
  })
})
