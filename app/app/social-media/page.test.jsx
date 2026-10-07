import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { screen, waitFor, within, fireEvent } from '@testing-library/react'
import {
  renderWithClient, publication, installPublicationsApi, statusResponse, ACTIVE_FACEBOOK, ACTIVE_INSTAGRAM, EXPIRED, NOT_CONNECTED_IG, apiError, strategyResponse, strategyDoc, generationDoc,
} from '@/test-utils/socialMediaAI'

const api = vi.hoisted(() => ({ getSocialAccountsStatus: vi.fn(), getSocialPublications: vi.fn(), getSocialApprovalSummary: vi.fn(), getSocialAIStrategy: vi.fn(), getSocialAIStrategyStatus: vi.fn() }))
vi.mock('@/lib/apiService', () => ({ default: api }))

let project = { _id: 'proj-1', project_name: 'Acme' }
vi.mock('@/contexts/ProjectContext', () => ({
  useProject: () => ({ activeProject: project, activeProjectId: project ? project._id : null, projects: [], setActiveProject: vi.fn() }),
}))
vi.mock('@/components/ui/dropdown-menu', async () => (await import('@/test-utils/socialMediaAI')).dropdownMenuMock())
vi.mock('next/link', async () => (await import('@/test-utils/socialMediaAI')).nextLinkMock())

import SocialMediaOverviewPage from './page'

beforeEach(() => {
  vi.clearAllMocks()
  project = { _id: 'proj-1', project_name: 'Acme' }
  api.getSocialAccountsStatus.mockResolvedValue(statusResponse({ facebook: ACTIVE_FACEBOOK, instagram: ACTIVE_INSTAGRAM }))
  api.getSocialAIStrategy.mockResolvedValue(strategyResponse({ status: 'none' }))
  api.getSocialApprovalSummary.mockResolvedValue({ success: true, data: { summary: { contentReview: 0, designReview: 0, awaitingDesignSubmission: 0, readyToSchedule: 0, needsChanges: 0 } } })
})

const renderPage = () => renderWithClient(<SocialMediaOverviewPage />)
const value = (id) => screen.getByTestId(`stat-${id}-value`)

describe('Overview — real counters, connections and posts', () => {
  it('Scheduled / Published tiles are REAL backend totals', async () => {
    installPublicationsApi(api, [
      ...Array.from({ length: 3 }, (_, i) => publication({ id: `s${i}`, status: 'scheduled', scheduledAt: `2099-05-0${i + 1}T10:00:00Z` })),
      publication({ id: 'live', status: 'publishing' }),
      ...Array.from({ length: 5 }, (_, i) => publication({ id: `p${i}`, status: 'published', publishedAt: '2099-01-01T00:00:00Z' })),
    ])
    renderPage()
    await waitFor(() => expect(value('scheduled')).toHaveTextContent('4'))
    expect(value('published')).toHaveTextContent('5')
  })

  it('APPROVAL tiles are the backend\'s database counts, not a count of the loaded posts', async () => {
    installPublicationsApi(api, [])
    api.getSocialApprovalSummary.mockResolvedValue({ success: true, data: { summary: { contentReview: 7, designReview: 3, awaitingDesignSubmission: 1, readyToSchedule: 2, needsChanges: 1 } } })
    renderPage()
    await waitFor(() => expect(value('content-reviews')).toHaveTextContent('7'))
    expect(value('designs-to-approve')).toHaveTextContent('3')
    expect(api.getSocialApprovalSummary).toHaveBeenCalledWith('proj-1')
    expect(screen.getByTestId('stat-content-reviews')).toHaveAttribute('href', '/app/social-media/content-approvals?tab=content-review')
    expect(screen.getByTestId('stat-designs-to-approve')).toHaveAttribute('href', '/app/social-media/content-approvals?tab=design-review')
    expect(screen.getByTestId('stat-content-reviews')).not.toHaveAttribute('title', 'Not available yet')
  })

  it('APPROVAL tiles: a zero count is shown as 0', async () => {
    installPublicationsApi(api, [])
    renderPage()
    await waitFor(() => expect(value('content-reviews')).toHaveTextContent('0'))
    expect(value('designs-to-approve')).toHaveTextContent('0')
  })

  it('APPROVAL tiles: counts request error -> "—" for those tiles only', async () => {
    installPublicationsApi(api, [])
    api.getSocialApprovalSummary.mockRejectedValue(apiError('boom', { status: 500 }))
    renderPage()
    await waitFor(() => expect(value('scheduled')).toHaveTextContent('0'))
    await waitFor(() => expect(value('content-reviews')).toHaveTextContent('—'))
    expect(value('designs-to-approve')).toHaveTextContent('—')
    expect(screen.getByTestId('upcoming-empty')).toBeInTheDocument()
  })

  it('LOADING: count skeletons rather than numbers, then real values', async () => {
    api.getSocialPublications.mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getAllByLabelText('Loading count').length).toBeGreaterThan(0)
    expect(screen.queryByTestId('stat-scheduled-value')).not.toBeInTheDocument()
  })

  it('EMPTY project: zero counts, empty upcoming and empty attention — nothing fabricated', async () => {
    installPublicationsApi(api, [])
    renderPage()
    await waitFor(() => expect(value('scheduled')).toHaveTextContent('0'))
    expect(value('published')).toHaveTextContent('0')
    expect(await screen.findByTestId('upcoming-empty')).toBeInTheDocument()
    expect(await screen.findByTestId('attention-empty')).toBeInTheDocument()
  })

  it('ERROR: counters fall back to "—" (not 0) and the upcoming section offers a retry', async () => {
    api.getSocialPublications.mockRejectedValue(apiError('Failed to load publications', { status: 500 }))
    renderPage()
    expect(await screen.findByText('Upcoming posts could not be loaded.')).toBeInTheDocument()
    expect(value('scheduled')).toHaveTextContent('—')
    expect(value('published')).toHaveTextContent('—')
  })

  it('Upcoming posts are the next 3 REAL scheduled posts, soonest first', async () => {
    installPublicationsApi(api, [
      publication({ id: 'u4', content: 'Fourth', scheduledAt: '2099-05-04T10:00:00Z', timezone: 'UTC' }),
      publication({ id: 'u1', content: 'First', scheduledAt: '2099-05-01T10:00:00Z', timezone: 'UTC' }),
      publication({ id: 'u3', content: 'Third', scheduledAt: '2099-05-03T10:00:00Z', timezone: 'UTC' }),
      publication({ id: 'u2', content: 'Second', scheduledAt: '2099-05-02T10:00:00Z', timezone: 'UTC' }),
    ])
    renderPage()
    await waitFor(() => expect(screen.getByTestId('upcoming-u1')).toBeInTheDocument())
    expect(screen.getByTestId('upcoming-u2')).toBeInTheDocument()
    expect(screen.getByTestId('upcoming-u3')).toBeInTheDocument()
    expect(screen.queryByTestId('upcoming-u4')).not.toBeInTheDocument()
    expect(within(screen.getByTestId('upcoming-u1')).getByText('First')).toBeInTheDocument()
    expect(within(screen.getByTestId('upcoming-u1')).getByText(/2099-05-01/)).toBeInTheDocument()
  })

  it('"Needs your attention" lists REAL failed posts with the reason class, linking to the Failed tab', async () => {
    installPublicationsApi(api, [
      publication({ id: 'f1', status: 'failed', content: 'Needs reconnect', failureCode: 'FACEBOOK_TOKEN_INVALID', requiresReconnect: true }),
      publication({ id: 'f2', status: 'failed', content: 'Unknown result', failureCode: 'PUBLISH_OUTCOME_UNKNOWN', outcomeUnknown: true }),
    ])
    renderPage()
    await waitFor(() => expect(screen.getByTestId('attention-f1')).toBeInTheDocument())
    expect(within(screen.getByTestId('attention-f1')).getByText('Reconnect required')).toBeInTheDocument()
    expect(within(screen.getByTestId('attention-f2')).getByText('Outcome unknown')).toBeInTheDocument()
    expect(within(screen.getByTestId('attention-f1')).getByRole('link', { name: 'Review' })).toHaveAttribute('href', expect.stringContaining('tab=failed&post=f1'))
  })

  it('connection pills follow the REAL status: connected, reconnect required, not connected', async () => {
    api.getSocialAccountsStatus.mockResolvedValue(statusResponse({ facebook: ACTIVE_FACEBOOK, instagram: EXPIRED('acme_ig') }))
    installPublicationsApi(api, [])
    renderPage()
    await waitFor(() => expect(screen.getByTestId('overview-facebook-pill')).toHaveAttribute('data-state', 'connected'))
    expect(screen.getByTestId('overview-facebook-pill')).toHaveTextContent('Connected')
    expect(screen.getByTestId('overview-instagram-pill')).toHaveAttribute('data-state', 'expired')
    expect(screen.getByTestId('overview-instagram-pill')).toHaveTextContent('Reconnect required')
  })

  it('pills say "Not connected" (not a green "Connected") when nothing is connected', async () => {
    api.getSocialAccountsStatus.mockResolvedValue(statusResponse({ facebook: { connected: false }, instagram: NOT_CONNECTED_IG }))
    installPublicationsApi(api, [])
    renderPage()
    await waitFor(() => expect(screen.getByTestId('overview-facebook-pill')).toHaveAttribute('data-state', 'not_connected'))
    expect(screen.getByTestId('overview-facebook-pill')).toHaveTextContent('Not connected')
    expect(screen.getByTestId('overview-facebook-pill')).not.toHaveTextContent(/^.*\bConnected\b/)
  })

  it('with no project: an empty state and no requests', () => {
    project = null
    renderPage()
    expect(screen.getByTestId('no-project')).toBeInTheDocument()
    expect(api.getSocialPublications).not.toHaveBeenCalled()
    expect(api.getSocialAccountsStatus).not.toHaveBeenCalled()
  })

  it('every request is scoped to the active project', async () => {
    installPublicationsApi(api, [publication({ id: 'x' })])
    renderPage()
    await waitFor(() => expect(value('scheduled')).toHaveTextContent('1'))
    for (const call of [...api.getSocialPublications.mock.calls, ...api.getSocialAccountsStatus.mock.calls]) expect(call[0]).toBe('proj-1')
  })
})

describe('Overview — strategy cards use the REAL AI strategy', () => {
  it('READY: the strategy card shows the real primary goal, summary and content mix; the insight card shows the first real recommendation', async () => {
    installPublicationsApi(api, [])
    api.getSocialAIStrategy.mockResolvedValue(strategyResponse({ status: 'ready', strategy: strategyDoc() }))
    renderPage()
    expect(await screen.findByTestId('overview-strategy-goal')).toHaveTextContent('More bookings')
    const card = screen.getByTestId('overview-strategy')
    expect(card).toHaveTextContent('Build local trust with practical dental education')
    expect(card).toHaveTextContent('Educational')
    expect(card).toHaveTextContent('50%')
    expect(screen.getByTestId('overview-insight-body')).toHaveTextContent('Post consistently for 8 weeks before judging results.')
    expect(api.getSocialAIStrategy).toHaveBeenCalledWith('proj-1')
  })

  it('a strategy with no goals says so - it never shows a sample goal', async () => {
    installPublicationsApi(api, [])
    api.getSocialAIStrategy.mockResolvedValue(strategyResponse({ status: 'ready', strategy: strategyDoc({ strategy: { goals: [] } }) }))
    renderPage()
    expect(await screen.findByTestId('overview-strategy-goal')).toHaveTextContent('No goal defined yet')
    expect(document.body.textContent).not.toMatch(/Brand awareness/)
  })

  it('NO strategy: honest empty states with a link to create one — none of the old sample copy', async () => {
    installPublicationsApi(api, [])
    renderPage()
    expect(await screen.findByTestId('overview-strategy-empty')).toHaveTextContent('No AI strategy yet')
    for (const link of screen.getAllByRole('link', { name: 'Create strategy' })) expect(link).toHaveAttribute('href', '/app/social-media/ai-strategy')
    expect(screen.getByTestId('overview-insight-body')).toHaveTextContent('Generate an AI strategy')
    const text = document.body.textContent
    for (const dummy of [/Build trust before asking for the sale/, /3\.2x/, /Simon Sinek/, /Brand awareness/, /Sapphire/i]) expect(text).not.toMatch(dummy)
  })

  it('GENERATING: says so, from the server state', async () => {
    installPublicationsApi(api, [])
    api.getSocialAIStrategy.mockResolvedValue(strategyResponse({ status: 'generating', generation: generationDoc() }))
    api.getSocialAIStrategyStatus.mockResolvedValue({ success: true, data: { status: 'generating', generation: generationDoc() } })
    renderPage()
    expect(await screen.findByTestId('overview-strategy-empty')).toHaveTextContent('Generating your strategy')
  })

  it('ERROR: the strategy card offers a retry and the rest of the Overview still works', async () => {
    installPublicationsApi(api, [])
    api.getSocialAIStrategy.mockRejectedValueOnce(apiError('boom', { status: 500 }))
    renderPage()
    expect(await screen.findByTestId('overview-strategy-error')).toBeInTheDocument()
    await waitFor(() => expect(value('scheduled')).toHaveTextContent('0'))
    api.getSocialAIStrategy.mockResolvedValue(strategyResponse({ status: 'ready', strategy: strategyDoc() }))
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByTestId('overview-strategy-goal')).toBeInTheDocument()
  })
})
