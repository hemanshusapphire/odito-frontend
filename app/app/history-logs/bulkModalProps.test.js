import { describe, it, expect } from 'vitest'
import { buildBulkModalProps } from './bulkModalProps'
import { BatchState } from '@/lib/verification/bulkBatchState'

function snapshot(overrides = {}) {
  return {
    batchId: 'batch-1',
    state: BatchState.RUNNING,
    total: 3,
    queued: 1,
    running: 1,
    completed: 1,
    failed: 0,
    urls: new Map([
      ['/a', { status: 'completed', stage: 'Completed', percentage: 100 }],
      ['/b', { status: 'running', stage: 'SEO Scoring', percentage: 50 }],
      ['/c', { status: 'queued', stage: null, percentage: 0 }],
    ]),
    ...overrides,
  }
}

describe('buildBulkModalProps', () => {
  it('returns null when there is no progress yet', () => {
    expect(buildBulkModalProps(null, null, () => {}, () => {})).toBeNull()
  })

  it('groups urls by status into running/waiting/completed/failed lists', () => {
    const props = buildBulkModalProps(snapshot(), null, () => {}, () => {})
    expect(props.runningUrls).toEqual(['/b'])
    expect(props.waitingUrls).toEqual(['/c'])
    expect(props.completedUrls).toEqual(['/a'])
    expect(props.failedUrls).toEqual([])
    expect(props.isComplete).toBe(false)
  })

  it('marks isComplete (not isFailed) when the batch reaches COMPLETED', () => {
    const props = buildBulkModalProps(snapshot({ state: BatchState.COMPLETED }), null, () => {}, () => {})
    expect(props.isComplete).toBe(true)
    expect(props.isFailed).toBe(false)
  })

  it('marks isComplete + isFailed when the batch reaches FAILED', () => {
    const props = buildBulkModalProps(snapshot({ state: BatchState.FAILED }), null, () => {}, () => {})
    expect(props.isComplete).toBe(true)
    expect(props.isFailed).toBe(true)
  })

  it('is still computing results while complete but resultCounts is not yet available', () => {
    const props = buildBulkModalProps(snapshot({ state: BatchState.COMPLETED }), null, () => {}, () => {})
    expect(props.isComputingResults).toBe(true)
    expect(props.fixedCount).toBe(0)
    expect(props.stillFailingCount).toBe(0)
  })

  it('surfaces fixedCount/stillFailingCount once resultCounts resolves', () => {
    const props = buildBulkModalProps(
      snapshot({ state: BatchState.COMPLETED }),
      { fixedCount: 4, stillFailingCount: 1 },
      () => {},
      () => {}
    )
    expect(props.isComputingResults).toBe(false)
    expect(props.fixedCount).toBe(4)
    expect(props.stillFailingCount).toBe(1)
  })

  it('passes through onViewDetails/onClose unchanged', () => {
    const onViewDetails = () => 'a'
    const onClose = () => 'b'
    const props = buildBulkModalProps(snapshot(), null, onViewDetails, onClose)
    expect(props.onViewDetails).toBe(onViewDetails)
    expect(props.onClose).toBe(onClose)
  })
})
