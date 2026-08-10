import { describe, it, expect, beforeEach } from 'vitest'
import { storeBatchId, readBatchId, clearBatchId } from './batchRecoveryStorage'

describe('batchRecoveryStorage (F4-019 §5)', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('stores and reads back a batchId for a project', () => {
    storeBatchId('proj-1', 'batch-abc')
    expect(readBatchId('proj-1')).toBe('batch-abc')
  })

  it('reads null for a project with nothing stored', () => {
    expect(readBatchId('proj-never-stored')).toBe(null)
  })

  it('is scoped per project — storing for one project does not affect another', () => {
    storeBatchId('proj-1', 'batch-abc')
    storeBatchId('proj-2', 'batch-xyz')
    expect(readBatchId('proj-1')).toBe('batch-abc')
    expect(readBatchId('proj-2')).toBe('batch-xyz')
  })

  it('clearBatchId removes only that project\'s entry', () => {
    storeBatchId('proj-1', 'batch-abc')
    storeBatchId('proj-2', 'batch-xyz')
    clearBatchId('proj-1')
    expect(readBatchId('proj-1')).toBe(null)
    expect(readBatchId('proj-2')).toBe('batch-xyz')
  })

  it('storeBatchId overwrites a previous value for the same project', () => {
    storeBatchId('proj-1', 'batch-abc')
    storeBatchId('proj-1', 'batch-def')
    expect(readBatchId('proj-1')).toBe('batch-def')
  })

  it('is a safe no-op for missing projectId/batchId rather than throwing', () => {
    expect(() => storeBatchId(null, 'batch-abc')).not.toThrow()
    expect(() => storeBatchId('proj-1', null)).not.toThrow()
    expect(() => readBatchId(null)).not.toThrow()
    expect(() => clearBatchId(null)).not.toThrow()
  })
})
