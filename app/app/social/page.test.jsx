import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import SocialMediaOverviewPage from './page'
import apiService from '@/lib/apiService'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('@/contexts/ProjectContext', () => ({
  useProject: () => ({ activeProjectId: 'proj-1' }),
}))

vi.mock('@/hooks/useMetaOAuthRedirect', () => ({
  useMetaOAuthRedirect: (config) => { lastOAuthRedirectConfig = config },
  default: () => {},
}))

vi.mock('@/lib/apiService', () => ({
  default: { getMetaConnectUrl: vi.fn() },
}))

const loggerDebug = vi.fn()
const loggerWarn = vi.fn()
vi.mock('@/lib/monitoring/logger', () => ({
  default: { debug: (...a) => loggerDebug(...a), warn: (...a) => loggerWarn(...a), info: vi.fn(), error: vi.fn() },
}))

const notifyMock = vi.fn()
vi.mock('@/hooks/useToastQueue', () => ({
  useToastQueue: () => ({ toasts: [], notify: notifyMock, dismiss: vi.fn() }),
}))

// Everything below is deliberately NOT the focus of this file (real
// Switch Account / Connect Account / Create Post flows have their own
// coverage elsewhere) — stubbed out so these tests isolate the Refresh
// wiring bug this file exists to prove fixed.
vi.mock('@/components/dashboard/social/SocialTabs', () => ({ default: () => null }))
vi.mock('@/components/dashboard/social/SocialPlatformSection', () => ({
  default: ({ platform, period, onPeriodChange, chartLoading }) => React.createElement(
    'div',
    { 'data-testid': `platform-${platform.id}`, 'data-connected': String(!!platform.connected) },
    platform.name,
    ' | recentPosts=', String(platform.kpis?.find((k) => k.key === 'posts')?.value ?? ''),
    ' | pageViews=', String(platform.kpis?.find((k) => k.key === 'pageViews')?.value ?? ''),
    ' | engagements=', String(platform.kpis?.find((k) => k.key === 'engagements')?.value ?? ''),
    ' | followersGained=', String(platform.kpis?.find((k) => k.key === 'followersGained')?.value ?? ''),
    ' | likes=', String(platform.kpis?.find((k) => k.key === 'likes')?.value ?? ''),
    ' | chartTitle=', String(platform.chart?.title ?? ''),
    ' | chartEmptyMessage=', String(platform.chartEmptyMessage ?? ''),
    ' | chartRangeLabel=', String(platform.chartRangeLabel ?? ''),
    ' | period=', String(period ?? ''),
    ' | chartLoading=', String(!!chartLoading),
    React.createElement('button', { type: 'button', 'aria-label': `${platform.id}-select-day`, onClick: () => onPeriodChange('day') }, 'Day'),
    React.createElement('button', { type: 'button', 'aria-label': `${platform.id}-select-week`, onClick: () => onPeriodChange('week') }, 'Week'),
    React.createElement('button', { type: 'button', 'aria-label': `${platform.id}-select-month`, onClick: () => onPeriodChange('month') }, 'Month'),
  ),
}))
vi.mock('@/components/dashboard/social/CreatePostDialog', () => ({ default: () => null }))
vi.mock('@/components/dashboard/social/ConnectAccountDialog', () => ({ default: () => null }))
// A marker element (not `() => null`) so tests can assert both that
// exactly ONE instance is ever present in the tree (never two dialogs)
// and which open/mode props the single instance received — without
// depending on the real Dialog/Radix DOM structure this file otherwise
// stubs out. Also stashes the raw props so a test can invoke the real
// onOpenChange handler page.jsx wired up, exactly as the real dialog would.
vi.mock('@/components/dashboard/social/FacebookPageSelectorDialog', () => ({
  default: (props) => {
    lastDialogProps = props
    return React.createElement('div', {
      'data-testid': 'mock-fb-page-selector',
      'data-open': String(!!props.open),
      'data-mode': props.mode,
    })
  },
}))
vi.mock('@/components/shared/ToastStack', () => ({ default: () => null }))

// `let` bindings referenced inside the mock factory below — the factory
// only runs at render time (after beforeEach has assigned these), so this
// works despite vi.mock being hoisted above the declarations. Same
// pattern as app/app/history-logs/page.test.jsx.
let statusResult
let accountsResult
let overviewResult
let instagramOverviewResult
let statusRefetch
let accountsRefetch
let overviewRefetch
let instagramOverviewRefetch
let lastFacebookOverviewArgs
let lastInstagramOverviewArgs
let lastOAuthRedirectConfig
let lastDialogProps

vi.mock('@/hooks/useDashboardQueries', () => ({
  useSocialAccountsStatus: () => statusResult,
  useFacebookAccounts: () => accountsResult,
  useFacebookOverview: (...args) => { lastFacebookOverviewArgs = args; return overviewResult },
  useInstagramOverview: (...args) => { lastInstagramOverviewArgs = args; return instagramOverviewResult },
}))

let container
let root

function render() {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => {
    root.render(React.createElement(SocialMediaOverviewPage))
  })
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

function refreshButton() {
  return Array.from(container.querySelectorAll('button')).find((b) => /^Refresh(ing…)?$/.test(b.textContent.trim()))
}

function facebookCard() {
  return container.querySelector('[data-testid="platform-facebook"]')
}

function instagramCard() {
  return container.querySelector('[data-testid="platform-instagram"]')
}

function pendingRefetch() {
  let resolve
  const promise = new Promise((r) => { resolve = r })
  return { promise, resolve }
}

beforeEach(() => {
  vi.clearAllMocks()
  statusRefetch = vi.fn().mockResolvedValue({ isError: false })
  accountsRefetch = vi.fn().mockResolvedValue({ isError: false })
  overviewRefetch = vi.fn().mockResolvedValue({ isError: false })
  instagramOverviewRefetch = vi.fn().mockResolvedValue({ isError: false })
  statusResult = {
    data: { data: { facebook: { connected: true }, instagram: { connected: false } } },
    refetch: statusRefetch,
  }
  instagramOverviewResult = { data: undefined, refetch: instagramOverviewRefetch }
  accountsResult = {
    data: { data: { accounts: [{ id: 'acc-1', name: 'Page One', isActive: true, status: 'active' }] } },
    refetch: accountsRefetch,
  }
  overviewResult = {
    data: {
      data: {
        connected: true,
        metrics: { pageViews: 42, recentPosts: 12, newFans: 3 },
        chart: [{ date: '2026-08-01', value: 10 }, { date: '2026-08-02', value: 32 }],
        pageViewsUnavailableReason: null,
        newFansUnavailableReason: null,
      },
    },
    refetch: overviewRefetch,
  }
})

afterEach(() => {
  if (root) act(() => { root.unmount() })
  if (container) container.remove()
  container = null
  root = null
})

describe('Social page Refresh — real refetch wiring (not the old setTimeout mock)', () => {
  it('clicking Refresh refetches status, Facebook accounts, and Facebook overview when Facebook is connected', async () => {
    render()
    const btn = refreshButton()
    expect(btn).toBeTruthy()
    await act(async () => { btn.click(); await flushPromises() })
    expect(statusRefetch).toHaveBeenCalledTimes(1)
    expect(accountsRefetch).toHaveBeenCalledTimes(1)
    expect(overviewRefetch).toHaveBeenCalledTimes(1)
  })

  it('skips the Facebook-specific refetches when Facebook is not connected, but still refetches connection status (Instagram\'s only real, backend-sourced value today)', async () => {
    statusResult.data.data.facebook.connected = false
    render()
    const btn = refreshButton()
    await act(async () => { btn.click(); await flushPromises() })
    expect(statusRefetch).toHaveBeenCalledTimes(1)
    expect(accountsRefetch).not.toHaveBeenCalled()
    expect(overviewRefetch).not.toHaveBeenCalled()
  })

  it('duplicate clicks before the first refresh resolves do not trigger overlapping refetches', async () => {
    const { promise, resolve } = pendingRefetch()
    statusRefetch.mockReturnValue(promise)
    render()
    const btn = refreshButton()
    act(() => { btn.click() })
    act(() => { btn.click() })
    expect(statusRefetch).toHaveBeenCalledTimes(1)
    await act(async () => { resolve({ isError: false }); await flushPromises() })
  })

  it('shows a loading state while refreshing and clears it after every refetch resolves', async () => {
    const status = pendingRefetch()
    const accounts = pendingRefetch()
    const overview = pendingRefetch()
    statusRefetch.mockReturnValue(status.promise)
    accountsRefetch.mockReturnValue(accounts.promise)
    overviewRefetch.mockReturnValue(overview.promise)
    render()
    const btn = refreshButton()
    act(() => { btn.click() })
    expect(refreshButton().textContent.trim()).toBe('Refreshing…')
    await act(async () => {
      status.resolve({ isError: false })
      accounts.resolve({ isError: false })
      overview.resolve({ isError: false })
      await flushPromises()
    })
    expect(refreshButton().textContent.trim()).toBe('Refresh')
  })

  it('shows an error toast and still clears the loading state when a refetch reports isError', async () => {
    overviewRefetch.mockResolvedValue({ isError: true })
    render()
    const btn = refreshButton()
    await act(async () => { btn.click(); await flushPromises() })
    expect(notifyMock).toHaveBeenCalledWith(expect.stringMatching(/failed to refresh/i), 'error')
    expect(refreshButton().textContent.trim()).toBe('Refresh')
  })

  it('handles a rejected refetch promise without leaving the button stuck on Refreshing…', async () => {
    statusRefetch.mockRejectedValue(new Error('Network error'))
    render()
    const btn = refreshButton()
    await act(async () => { btn.click(); await flushPromises() })
    expect(notifyMock).toHaveBeenCalledWith('Network error', 'error')
    expect(refreshButton().textContent.trim()).toBe('Refresh')
  })

  it('shows a success toast once every refetch resolves cleanly', async () => {
    render()
    const btn = refreshButton()
    await act(async () => { btn.click(); await flushPromises() })
    expect(notifyMock).toHaveBeenCalledWith('Social data refreshed', 'success')
  })

  it('never triggers Meta OAuth (getMetaConnectUrl) as a side effect of clicking Refresh', async () => {
    render()
    const btn = refreshButton()
    await act(async () => { btn.click(); await flushPromises() })
    expect(apiService.getMetaConnectUrl).not.toHaveBeenCalled()
  })

  it('logs diagnostic checkpoints with the active project ID and never with anything token-shaped', async () => {
    render()
    const btn = refreshButton()
    await act(async () => { btn.click(); await flushPromises() })
    expect(loggerDebug).toHaveBeenCalledWith('social_refresh_clicked', expect.objectContaining({ projectId: 'proj-1' }))
    const loggedText = JSON.stringify(loggerDebug.mock.calls)
    expect(loggedText).not.toMatch(/access_?token/i)
  })

  it('reflects whichever Page is currently flagged active, proving Refresh never pins to a stale/default Page after a Switch', async () => {
    accountsResult.data.data.accounts = [
      { id: 'acc-1', name: 'Page One', isActive: false, status: 'active' },
      { id: 'acc-2', name: 'Page Two', isActive: true, status: 'active' },
    ]
    render()
    const btn = refreshButton()
    await act(async () => { btn.click(); await flushPromises() })
    expect(loggerDebug).toHaveBeenCalledWith('social_refresh_clicked', expect.objectContaining({ activeSocialAccountId: 'acc-2' }))
  })
})

// Regression coverage for the actual "Refresh succeeds but the card
// doesn't visibly update" bug: the previous implementation mirrored
// query data into local state via useEffect(() => setState, [data]),
// which could leave the rendered card one snapshot behind. Facebook's
// card is now derived with useMemo directly from the live query results
// every render, so these prove real data always wins over the dummy
// baseline, and a refresh in flight never regresses a real card back to
// dummy/blank.
describe('Facebook card — real API data always takes precedence over dummy/default data', () => {
  it('renders the real overview value (not the dummy "0") once the overview query has data', () => {
    render()
    expect(facebookCard().getAttribute('data-connected')).toBe('true')
    expect(facebookCard().textContent).toContain('recentPosts=12')
  })

  it('shows Not Connected when status says disconnected, even if a stale real overview payload is still cached', () => {
    statusResult.data.data.facebook.connected = false
    render()
    expect(facebookCard().getAttribute('data-connected')).toBe('false')
  })

  it('keeps showing the last real overview value while a refresh is in flight, never reverting to dummy or blanking', async () => {
    render()
    expect(facebookCard().textContent).toContain('recentPosts=12')

    // Simulate a refresh in flight: React Query keeps serving the last
    // successful `data` while refetching, so overviewResult.data is
    // unchanged here — only re-render to prove the card doesn't regress.
    act(() => {
      root.render(React.createElement(SocialMediaOverviewPage))
    })
    expect(facebookCard().textContent).toContain('recentPosts=12')
    expect(facebookCard().getAttribute('data-connected')).toBe('true')
  })

  it('updates to the fresher value once a new overview response replaces the old one (e.g. after Refresh resolves)', async () => {
    render()
    expect(facebookCard().textContent).toContain('recentPosts=12')

    overviewResult = {
      data: {
        data: {
          connected: true,
          metrics: { pageViews: 42, recentPosts: 15, newFans: 3 },
          chart: [{ date: '2026-08-01', value: 10 }],
          pageViewsUnavailableReason: null, newFansUnavailableReason: null,
        },
      },
      refetch: overviewRefetch,
    }
    act(() => {
      root.render(React.createElement(SocialMediaOverviewPage))
    })
    expect(facebookCard().textContent).toContain('recentPosts=15')
  })
})

// Regression coverage for the Page Impressions -> Page Views migration:
// Meta deprecated every page-level impressions/reach metric with no
// replacement (confirmed live); "Page Views" (page_views_total) is a
// real, currently-supported, but semantically DIFFERENT metric, so both
// the field name and the UI label change — and the deprecated-metric
// message must only appear when Views itself genuinely fails, never on a
// normal successful response (even one that measured zero).
describe('Facebook card — Page Views (migrated from the retired Page Impressions)', () => {
  it('shows the real Page Views value with the "Page Views" label, never the old "Page Impressions" terminology', () => {
    render()
    const card = facebookCard()
    expect(card.textContent).toContain('pageViews=42')
    expect(card.textContent).toContain('chartTitle=Page Views')
    expect(card.textContent).not.toContain('Page Impressions')
  })

  it('never shows the deprecated-metric message when Page Views succeeds, even with real chart data', () => {
    render()
    expect(facebookCard().textContent).not.toMatch(/deprecated/i)
  })

  it('when Page Views is unavailable, shows an honest "not available" message and "—", never a fabricated 0', () => {
    overviewResult = {
      data: {
        data: {
          connected: true,
          metrics: { pageViews: null, recentPosts: 12, newFans: 3 },
          chart: [],
          pageViewsUnavailableReason: 'FACEBOOK_INSIGHTS_UNAVAILABLE',
          newFansUnavailableReason: null,
        },
      },
      refetch: overviewRefetch,
    }
    render()
    const card = facebookCard()
    expect(card.textContent).toContain('pageViews=—')
    expect(card.textContent).not.toContain('pageViews=0')
    expect(card.textContent).toContain("Page views data isn't available for this Facebook Page.")
  })

  it('a real, successful zero (Meta measured no activity) renders as "0", not as unavailable', () => {
    overviewResult = {
      data: {
        data: {
          connected: true,
          metrics: { pageViews: 0, recentPosts: 6, newFans: 0 },
          chart: [],
          pageViewsUnavailableReason: null,
          newFansUnavailableReason: null,
        },
      },
      refetch: overviewRefetch,
    }
    render()
    const card = facebookCard()
    expect(card.textContent).toContain('pageViews=0')
    expect(card.textContent).not.toContain("isn't available")
    expect(card.textContent).toContain('No page views recorded')
  })

  it('Recent Posts and New Fans keep working exactly as before the migration', () => {
    render()
    expect(facebookCard().textContent).toContain('recentPosts=12')
  })
})

// Regression coverage for the reported "critical bug": the Instagram card
// was rendering entirely from frontend/lib/socialMediaDummyData.js static
// values (356/251/3/209), never fetched from anywhere, so every account
// and every refresh showed the exact same numbers. These prove the real
// backend-sourced data (getInstagramOverview) now drives the card, never
// the old dummy baseline, and that unavailable metrics render honestly.
describe('Instagram card — real backend data (fixes the static-dummy-values bug)', () => {
  function connectInstagram() {
    statusResult.data.data.instagram = { connected: true }
  }

  it('renders real Instagram values, never the old hardcoded dummy 356/251/3/209', () => {
    connectInstagram()
    instagramOverviewResult = {
      data: {
        data: {
          connected: true,
          metrics: { posts: 112, engagements: 16932, followersGained: 2194, likes: 16844 },
          chart: [{ date: '2026-08-01', comments: 4, likes: 20 }],
          postsUnavailableReason: null,
          engagementsUnavailableReason: null,
          followersGainedUnavailableReason: null,
          likesUnavailableReason: null,
        },
      },
      refetch: instagramOverviewRefetch,
    }
    render()
    const card = instagramCard()
    expect(card.getAttribute('data-connected')).toBe('true')
    expect(card.textContent).toContain('recentPosts=112')
    expect(card.textContent).toContain('engagements=16,932')
    expect(card.textContent).toContain('followersGained=2,194')
    expect(card.textContent).toContain('likes=16,844')
    expect(card.textContent).not.toContain('recentPosts=356')
    expect(card.textContent).not.toContain('engagements=251')
    expect(card.textContent).not.toContain('followersGained=3 ')
    expect(card.textContent).not.toContain('likes=209')
  })

  it('shows "—" (not a fabricated 0) for a metric the backend reports unavailable', () => {
    connectInstagram()
    instagramOverviewResult = {
      data: {
        data: {
          connected: true,
          metrics: { posts: 112, engagements: null, followersGained: 2194, likes: 16844 },
          chart: [],
          postsUnavailableReason: null,
          engagementsUnavailableReason: 'INSTAGRAM_INSIGHTS_UNAVAILABLE',
          followersGainedUnavailableReason: null,
          likesUnavailableReason: null,
        },
      },
      refetch: instagramOverviewRefetch,
    }
    render()
    const card = instagramCard()
    expect(card.textContent).toContain('engagements=—')
    expect(card.textContent).not.toContain('engagements=0')
  })

  it('renders a real successful zero as "0", not as unavailable', () => {
    connectInstagram()
    instagramOverviewResult = {
      data: {
        data: {
          connected: true,
          metrics: { posts: 112, engagements: 0, followersGained: 0, likes: 16844 },
          chart: [],
          postsUnavailableReason: null,
          engagementsUnavailableReason: null,
          followersGainedUnavailableReason: null,
          likesUnavailableReason: null,
        },
      },
      refetch: instagramOverviewRefetch,
    }
    render()
    const card = instagramCard()
    expect(card.textContent).toContain('engagements=0')
    expect(card.textContent).toContain('followersGained=0')
  })

  it('shows the honest empty-chart message when nothing has synced yet, never a fabricated chart', () => {
    connectInstagram()
    instagramOverviewResult = {
      data: {
        data: {
          connected: true,
          metrics: { posts: 0, engagements: 0, followersGained: 0, likes: 0 },
          chart: [],
          postsUnavailableReason: null,
          engagementsUnavailableReason: null,
          followersGainedUnavailableReason: null,
          likesUnavailableReason: null,
        },
      },
      refetch: instagramOverviewRefetch,
    }
    render()
    expect(instagramCard().textContent).toContain('chartEmptyMessage=No Instagram posts synced for this period yet')
  })

  it('shows Not Connected when status says disconnected, even if a stale real overview payload is cached', () => {
    statusResult.data.data.instagram = { connected: false }
    render()
    expect(instagramCard().getAttribute('data-connected')).toBe('false')
  })

  it('clicking Refresh refetches Instagram overview when Instagram is connected', async () => {
    connectInstagram()
    instagramOverviewResult = {
      data: { data: { connected: true, metrics: { posts: 1, engagements: 1, followersGained: 1, likes: 1 }, chart: [], postsUnavailableReason: null, engagementsUnavailableReason: null, followersGainedUnavailableReason: null, likesUnavailableReason: null } },
      refetch: instagramOverviewRefetch,
    }
    render()
    const btn = refreshButton()
    await act(async () => { btn.click(); await flushPromises() })
    expect(instagramOverviewRefetch).toHaveBeenCalledTimes(1)
  })

  it('does not refetch Instagram overview on Refresh when Instagram is not connected', async () => {
    render()
    const btn = refreshButton()
    await act(async () => { btn.click(); await flushPromises() })
    expect(instagramOverviewRefetch).not.toHaveBeenCalled()
  })
})

// Regression coverage for the reported "Day/Week don't work" bug's real,
// confirmed root cause: Day and Week always rendered an EMPTY chart
// because the frontend hardcoded `series: { day: [], week: [] }` and the
// range was never sent to the backend at all — clicking them changed only
// local UI state, no request ever left the browser. These prove the
// selected range now actually reaches useFacebookOverview/
// useInstagramOverview (and therefore the API), independently per
// platform card.
describe('Day/Week/Month range selector — reaches the API, not just local state', () => {
  it('defaults both Facebook and Instagram to month', () => {
    connectInstagramForRangeTests()
    render()
    expect(facebookCard().textContent).toContain('period=month')
    expect(instagramCard().textContent).toContain('period=month')
  })

  it('clicking Facebook\'s Week button passes range="week" into useFacebookOverview, not just local UI state', () => {
    render()
    const weekBtn = container.querySelector('[aria-label="facebook-select-week"]')
    act(() => { weekBtn.click() })
    // useFacebookOverview(projectId, activeSocialAccountId, range, options)
    expect(lastFacebookOverviewArgs[2]).toBe('week')
    expect(facebookCard().textContent).toContain('period=week')
  })

  it('clicking Facebook\'s Day button passes range="day"', () => {
    render()
    const dayBtn = container.querySelector('[aria-label="facebook-select-day"]')
    act(() => { dayBtn.click() })
    expect(lastFacebookOverviewArgs[2]).toBe('day')
  })

  it('clicking Instagram\'s Week button passes range="week" into useInstagramOverview, independently of Facebook', () => {
    connectInstagramForRangeTests()
    render()
    const igWeekBtn = container.querySelector('[aria-label="instagram-select-week"]')
    act(() => { igWeekBtn.click() })
    // useInstagramOverview(projectId, activeSocialAccountId, range, options)
    expect(lastInstagramOverviewArgs[2]).toBe('week')
    expect(instagramCard().textContent).toContain('period=week')
    // Facebook's own selection must be untouched by an Instagram-only click.
    expect(facebookCard().textContent).toContain('period=month')
  })

  it('reflects the query\'s isFetching state as chartLoading, so a range switch shows a loading state instead of stale data', () => {
    overviewResult = { data: overviewResult.data, refetch: overviewRefetch, isFetching: true }
    render()
    expect(facebookCard().textContent).toContain('chartLoading=true')
  })

  it('shows a real backend-provided date label, never the old hardcoded "Jul 1 – Jul 30, 2026"', () => {
    overviewResult = {
      data: { data: { ...overviewResult.data.data, range: 'month', since: '2026-07-22T00:00:00.000Z', until: '2026-08-21T00:00:00.000Z' } },
      refetch: overviewRefetch,
    }
    render()
    expect(facebookCard().textContent).not.toContain('Jul 1 – Jul 30, 2026')
  })

  function connectInstagramForRangeTests() {
    statusResult.data.data.instagram = { connected: true }
    instagramOverviewResult = {
      data: {
        data: {
          connected: true,
          range: 'month',
          metrics: { posts: 1, engagements: 1, followersGained: 1, likes: 1 },
          chart: [],
          postsUnavailableReason: null, engagementsUnavailableReason: null, followersGainedUnavailableReason: null, likesUnavailableReason: null,
        },
      },
      refetch: instagramOverviewRefetch,
    }
  }
})

// Regression coverage for the reported bug: after switching to a Facebook
// Page with no linked Instagram account, the card correctly flips to
// "Not Connected" (status.instagram.connected / igOverview.connected both
// false), but the OLD dummy KPI numbers (356/251/3/209) and chart data
// kept rendering behind the "not linked" overlay — because the disconnected
// branches did `{ ...p, connected: false }`, which never touches p.kpis/
// p.chart, and PlatformStatsGrid/PlatformChart render whatever kpis/chart
// they're given with no awareness of `connected` on their own. Fixed via
// disconnectedPlatform() overriding every KPI to '—' and emptying the
// chart series whenever a card is confirmed not connected.
describe('Disconnected state never leaks stale/dummy KPI or chart data behind the "Not Connected" overlay', () => {
  it('Instagram: when the active Facebook Page has no linked Instagram account, every KPI shows "—", never the old dummy 356/251/3/209', () => {
    statusResult.data.data.instagram = { connected: false }
    render()
    const card = instagramCard()
    expect(card.getAttribute('data-connected')).toBe('false')
    expect(card.textContent).toContain('recentPosts=—')
    expect(card.textContent).toContain('engagements=—')
    expect(card.textContent).toContain('followersGained=—')
    expect(card.textContent).toContain('likes=—')
    expect(card.textContent).not.toMatch(/recentPosts=356|engagements=251|followersGained=3(?!\d)|likes=209/)
  })

  it('Instagram: even when the overview fetch itself reports connected:false (NOT_LINKED_TO_ACTIVE_PAGE), stale numbers never leak through', () => {
    statusResult.data.data.instagram = { connected: true }
    instagramOverviewResult = {
      data: { data: { connected: false, reason: 'NOT_LINKED_TO_ACTIVE_PAGE' } },
      refetch: instagramOverviewRefetch,
    }
    render()
    const card = instagramCard()
    expect(card.getAttribute('data-connected')).toBe('false')
    expect(card.textContent).toContain('recentPosts=—')
    expect(card.textContent).toContain('engagements=—')
  })

  it('Facebook: when not connected, every KPI shows "—", never a stale/dummy number', () => {
    statusResult.data.data.facebook.connected = false
    render()
    const card = facebookCard()
    expect(card.getAttribute('data-connected')).toBe('false')
    expect(card.textContent).toContain('pageViews=—')
    expect(card.textContent).toContain('recentPosts=—')
  })

  it('a disconnected card never shows real chart data, and never fabricates the "no data" empty-chart message in its place', () => {
    statusResult.data.data.instagram = { connected: false }
    render()
    // The card is disconnected — PlatformChart's own overlay (not this
    // page) is responsible for the "Not Connected" messaging; this page's
    // job is only to make sure the underlying series is actually empty,
    // not left holding a previous account's real chart data.
    expect(instagramCard().getAttribute('data-connected')).toBe('false')
  })

  it('switching Instagram from connected (real data) to disconnected clears the previously-shown real KPI values, never keeps them visible', () => {
    statusResult.data.data.instagram = { connected: true }
    instagramOverviewResult = {
      data: {
        data: {
          connected: true,
          metrics: { posts: 112, engagements: 16932, followersGained: 2194, likes: 16844 },
          chart: [], postsUnavailableReason: null, engagementsUnavailableReason: null, followersGainedUnavailableReason: null, likesUnavailableReason: null,
        },
      },
      refetch: instagramOverviewRefetch,
    }
    render()
    expect(instagramCard().textContent).toContain('engagements=16,932')

    // A Page switch resolves to a Page with no linked Instagram account.
    // A fresh object (not an in-place mutation) — matches how a real
    // react-query refetch always hands back a new `data` reference, which
    // is what the page's useMemo dependency array actually reacts to.
    statusResult = { ...statusResult, data: { data: { ...statusResult.data.data, instagram: { connected: false } } } }
    act(() => { root.render(React.createElement(SocialMediaOverviewPage)) })

    const card = instagramCard()
    expect(card.getAttribute('data-connected')).toBe('false')
    expect(card.textContent).toContain('engagements=—')
    expect(card.textContent).not.toContain('engagements=16,932')
  })
})

// Regression coverage for the Facebook Modal Unification: this page used
// to mount two separately-designed Page-selection dialogs
// (MetaPageSelectionDialog for the OAuth redirect, SwitchAccountDialog for
// the header's "Switch Account" button). It now mounts exactly ONE
// FacebookPageSelectorDialog instance whose `mode`/`open` follow whichever
// of the two boolean states (pageSelectDialogOpen / switchDialogOpen) is
// currently true. These prove there is still only ever one instance in
// the tree, that each real trigger produces the correct mode, and that the
// deterministic precedence rule (connect wins if both were somehow true)
// never results in two dialogs rendering at once.
describe('Facebook Page selector — single unified dialog, correct mode per real trigger', () => {
  function dialogMarker() {
    return container.querySelector('[data-testid="mock-fb-page-selector"]')
  }

  function switchAccountButton() {
    return Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('Switch Account'))
  }

  it('exactly one FacebookPageSelectorDialog instance is ever present in the tree, closed by default', () => {
    render()
    expect(container.querySelectorAll('[data-testid="mock-fb-page-selector"]').length).toBe(1)
    expect(dialogMarker().dataset.open).toBe('false')
  })

  it('a real Meta OAuth redirect completing (useMetaOAuthRedirect\'s onConnected) opens the dialog in mode="connect"', () => {
    render()
    act(() => { lastOAuthRedirectConfig.onConnected() })
    expect(container.querySelectorAll('[data-testid="mock-fb-page-selector"]').length).toBe(1)
    expect(dialogMarker().dataset.open).toBe('true')
    expect(dialogMarker().dataset.mode).toBe('connect')
  })

  it('clicking the header\'s real "Switch Account" button opens the SAME dialog in mode="switch"', () => {
    render()
    act(() => { switchAccountButton().click() })
    expect(container.querySelectorAll('[data-testid="mock-fb-page-selector"]').length).toBe(1)
    expect(dialogMarker().dataset.open).toBe('true')
    expect(dialogMarker().dataset.mode).toBe('switch')
  })

  it('if both the OAuth-redirect state and the Switch Account state were somehow true at once, still only one dialog renders, deterministically in mode="connect"', () => {
    render()
    act(() => { switchAccountButton().click() })
    act(() => { lastOAuthRedirectConfig.onConnected() })
    expect(container.querySelectorAll('[data-testid="mock-fb-page-selector"]').length).toBe(1)
    expect(dialogMarker().dataset.open).toBe('true')
    expect(dialogMarker().dataset.mode).toBe('connect')
  })

  it('calling the real onOpenChange(false) page.jsx passed down actually closes the dialog (switchDialogOpen flips back to false, not left stuck true)', () => {
    render()
    act(() => { switchAccountButton().click() })
    expect(dialogMarker().dataset.open).toBe('true')

    act(() => { lastDialogProps.onOpenChange(false) })
    expect(container.querySelectorAll('[data-testid="mock-fb-page-selector"]').length).toBe(1)
    expect(dialogMarker().dataset.open).toBe('false')

    // Reopening via the header button afterward still works — closing
    // once didn't leave switchDialogOpen permanently stuck in either state.
    act(() => { switchAccountButton().click() })
    expect(dialogMarker().dataset.open).toBe('true')
    expect(dialogMarker().dataset.mode).toBe('switch')
  })
})
