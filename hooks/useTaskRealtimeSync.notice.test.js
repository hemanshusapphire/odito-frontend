import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTaskRealtimeSync, describeVerificationNotice } from './useTaskRealtimeSync'
import socketService from '@/lib/socketService'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('@/lib/socketService', () => ({
  default: {
    onTaskImplemented: vi.fn(), onTaskVerified: vi.fn(), onTaskReopened: vi.fn(),
    offTaskImplemented: vi.fn(), offTaskVerified: vi.fn(), offTaskReopened: vi.fn(),
    joinProject: vi.fn(),
  },
}))

const VERIFIED = 'Organization sameAs verified.'
const NOT_VERIFIED = 'WordPress value was saved, but the Organization schema output could not be verified.'

describe('describeVerificationNotice — what the user is told after the crawler checks an automated sameAs fix', () => {
  const sameAs = (over = {}) => ({ taskId: 't1', issueKey: 'sameas_array', pageUrl: 'https://naxonify.com/', origin: 'wordpress_auto', ...over })

  it('verified -> "Organization sameAs verified."', () => {
    expect(describeVerificationNotice('verified', sameAs({ status: 'verified_fixed' }))).toEqual({ message: VERIFIED, type: 'success' })
  })

  it('reopened -> WordPress saved it, but the rendered output could not be verified (a warning, not a success)', () => {
    expect(describeVerificationNotice('reopened', sameAs({ status: 'reopened' }))).toEqual({ message: NOT_VERIFIED, type: 'warning' })
  })

  it('a MANUALLY implemented sameAs fix gets no such message — "WordPress saved it" would be false', () => {
    for (const origin of [null, undefined, 'manual', 'diy']) {
      expect(describeVerificationNotice('reopened', sameAs({ origin }))).toBeNull()
      expect(describeVerificationNotice('verified', sameAs({ origin }))).toBeNull()
    }
  })

  it('other issue types are untouched', () => {
    expect(describeVerificationNotice('verified', sameAs({ issueKey: 'title_missing' }))).toBeNull()
    expect(describeVerificationNotice('reopened', sameAs({ issueKey: 'breadcrumblist_schema' }))).toBeNull()
  })

  it('unknown event names and empty payloads never throw', () => {
    expect(describeVerificationNotice('implemented', sameAs())).toBeNull()
    expect(describeVerificationNotice('verified', undefined)).toBeNull()
    expect(describeVerificationNotice('verified', null)).toBeNull()
  })
})

let container
let root
let queryClient
const lastHandler = (fn) => fn.mock.calls[fn.mock.calls.length - 1]?.[0]

function Harness({ onNotice }) {
  useTaskRealtimeSync('proj-1', { onNotice })
  return null
}

function mount(onNotice) {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(React.createElement(QueryClientProvider, { client: queryClient }, React.createElement(Harness, { onNotice })))
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})

afterEach(() => {
  if (root) act(() => root.unmount())
  container?.remove()
  container = null
  root = null
  vi.useRealTimers()
})

describe('useTaskRealtimeSync — onNotice', () => {
  it('reports the crawler verdict for an automated sameAs fix, on both events', () => {
    const onNotice = vi.fn()
    mount(onNotice)

    act(() => lastHandler(socketService.onTaskVerified)({ taskId: 't1', issueKey: 'sameas_array', status: 'verified_fixed', origin: 'wordpress_auto' }))
    expect(onNotice).toHaveBeenLastCalledWith({ message: VERIFIED, type: 'success' })

    act(() => lastHandler(socketService.onTaskReopened)({ taskId: 't1', issueKey: 'sameas_array', status: 'reopened', origin: 'wordpress_auto' }))
    expect(onNotice).toHaveBeenLastCalledWith({ message: NOT_VERIFIED, type: 'warning' })
    expect(onNotice).toHaveBeenCalledTimes(2)
  })

  it('stays silent for other issue types, manual fixes, and task:implemented', () => {
    const onNotice = vi.fn()
    mount(onNotice)

    act(() => lastHandler(socketService.onTaskVerified)({ taskId: 't2', issueKey: 'title_missing', status: 'verified_fixed', origin: 'wordpress_auto' }))
    act(() => lastHandler(socketService.onTaskReopened)({ taskId: 't3', issueKey: 'sameas_array', status: 'reopened', origin: null }))
    act(() => lastHandler(socketService.onTaskImplemented)({ taskId: 't4', issueKey: 'sameas_array', status: 'implemented' }))
    expect(onNotice).not.toHaveBeenCalled()
  })

  it('works without an onNotice callback (every existing caller)', () => {
    mount(undefined)
    expect(() => act(() => lastHandler(socketService.onTaskVerified)({ taskId: 't1', issueKey: 'sameas_array', origin: 'wordpress_auto' }))).not.toThrow()
  })

  it('a new callback identity on re-render does not re-subscribe the sockets, and the newest callback is the one called', () => {
    const first = vi.fn()
    const second = vi.fn()
    mount(first)
    act(() => {
      root.render(React.createElement(QueryClientProvider, { client: queryClient }, React.createElement(Harness, { onNotice: second })))
    })
    expect(socketService.onTaskVerified).toHaveBeenCalledTimes(1)

    act(() => lastHandler(socketService.onTaskVerified)({ taskId: 't1', issueKey: 'sameas_array', origin: 'wordpress_auto' }))
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })
})
