import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { screen, waitFor, fireEvent, act } from '@testing-library/react'
import {
  renderWithClient, strategyResponse, strategyDoc, apiError, contentGenerationDoc, contentDraft, contentStatusResponse, contentStartResponse,
} from '@/test-utils/socialMediaAI'

const api = vi.hoisted(() => ({ getSocialAIContentStatus: vi.fn(), generateSocialAIContent: vi.fn() }))
vi.mock('@/lib/apiService', () => ({ default: api }))
vi.mock('next/link', async () => (await import('@/test-utils/socialMediaAI')).nextLinkMock())

import { SingleAIPostGenerator } from './SingleAIPostGenerator'

beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset())
  api.getSocialAIContentStatus.mockResolvedValue(contentStatusResponse())
})
afterEach(() => { vi.useRealTimers() })

const state = (profile = {}) => strategyResponse({ status: 'ready', strategy: strategyDoc(), profile }).data
const renderGen = (strategyState = state(), opts) => renderWithClient(<SingleAIPostGenerator projectId="proj-1" strategyState={strategyState} />, opts)
const choose = (testId, value) => fireEvent.change(screen.getByTestId(testId), { target: { value } })
const fillValid = async () => {
  await screen.findByTestId('generate-post-button')
  choose('generator-platform', 'facebook')
  choose('generator-pillar', 'Dental tips')
  choose('generator-objective', 'educational')
}
const optionTexts = (testId) => Array.from(screen.getByTestId(testId).querySelectorAll('option')).map((o) => o.textContent)

describe('Single-post generator - options come from the stored strategy and the server\'s connection report', () => {
  it('offers only the strategy\'s pillars and content-mix objectives, with readable labels; an unconnected platform is disabled', async () => {
    renderGen()
    await screen.findByTestId('generate-post-button')
    expect(optionTexts('generator-pillar')).toEqual(['Select a pillar', 'Dental tips', 'Meet the team'])
    expect(optionTexts('generator-objective')).toEqual(['Select an objective', 'Educational', 'Behind the scenes', 'Soft sell'])
    expect(optionTexts('generator-platform')).toEqual(['Select a platform', 'Facebook', 'Instagram (not connected)'])
    const instagram = screen.getByRole('option', { name: 'Instagram (not connected)' })
    expect(instagram).toBeDisabled()
    expect(screen.getByRole('option', { name: 'Facebook' })).toBeEnabled()
  })

  it('the Generate button stays disabled until platform, pillar and objective are all chosen - and for a platform that is not connected', async () => {
    renderGen()
    const button = await screen.findByTestId('generate-post-button')
    expect(button).toBeDisabled()
    choose('generator-platform', 'facebook')
    choose('generator-pillar', 'Dental tips')
    expect(button).toBeDisabled()
    choose('generator-objective', 'educational')
    expect(button).toBeEnabled()
    choose('generator-platform', 'instagram') // not connected: even if forced, it cannot be submitted
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(api.generateSocialAIContent).not.toHaveBeenCalled()
  })

  it('no platform connected -> a clear note with a link to connect accounts', async () => {
    renderGen(state({ connectedPlatforms: { facebook: false, instagram: false } }))
    expect(await screen.findByTestId('generator-no-platform')).toHaveTextContent('Connect Facebook or Instagram')
    expect(screen.getByRole('link', { name: 'Connect accounts' })).toHaveAttribute('href', '/app/social-media/connect-accounts')
  })

  it('tells the user when the profile changed after the strategy, and that the post follows the strategy as it was', async () => {
    renderGen(state({ changed: true, changes: ['goals'] }))
    expect(await screen.findByTestId('generator-profile-changed')).toHaveTextContent('follows the strategy as it was')
  })
})

describe('Single-post generator - generating', () => {
  it('sends ONLY platform, pillar and objective, then shows the server\'s generating state (no percentages) with the controls locked', async () => {
    api.generateSocialAIContent.mockResolvedValue(contentStartResponse())
    renderGen()
    await fillValid()
    api.getSocialAIContentStatus.mockResolvedValue(contentStatusResponse({ status: 'generating', generation: contentGenerationDoc() }))
    fireEvent.click(screen.getByTestId('generate-post-button'))
    await waitFor(() => expect(api.generateSocialAIContent).toHaveBeenCalledWith('proj-1', { platform: 'facebook', contentPillar: 'Dental tips', objective: 'educational' }))
    expect(Object.keys(api.generateSocialAIContent.mock.calls[0][1]).sort()).toEqual(['contentPillar', 'objective', 'platform'])
    expect(await screen.findByTestId('generator-generating')).toHaveTextContent('Writing your Facebook post')
    expect(screen.getByTestId('generate-post-button')).toBeDisabled()
    expect(screen.getByTestId('generate-post-button')).toHaveTextContent('Generating…')
    expect(screen.getByTestId('generator-platform')).toBeDisabled()
    expect(screen.queryByText(/\d+\s?%/)).not.toBeInTheDocument()
    expect(screen.queryByTestId('generator-result')).not.toBeInTheDocument()
  })

  it('a fast double-click sends ONE request', async () => {
    let resolve
    api.generateSocialAIContent.mockReturnValue(new Promise((r) => { resolve = r }))
    renderGen()
    await fillValid()
    const button = screen.getByTestId('generate-post-button')
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    await waitFor(() => expect(api.generateSocialAIContent).toHaveBeenCalledTimes(1))
    fireEvent.click(button)
    await act(async () => { await new Promise((r) => setTimeout(r, 30)) })
    expect(api.generateSocialAIContent).toHaveBeenCalledTimes(1)
    await act(async () => { resolve(contentStartResponse()) })
  })

  it('polls the status ONLY while the server says generating, and stops when it is done', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    // idle: nothing generating -> no polling
    renderGen()
    await screen.findByTestId('generate-post-button')
    const idleCalls = api.getSocialAIContentStatus.mock.calls.length
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000) })
    expect(api.getSocialAIContentStatus.mock.calls.length).toBe(idleCalls)
  })

  it('a generation already running when the page opens is picked up (generating, controls locked) and polled until ready', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    api.getSocialAIContentStatus.mockResolvedValue(contentStatusResponse({ status: 'generating', generation: contentGenerationDoc() }))
    renderGen()
    expect(await screen.findByTestId('generator-generating')).toBeInTheDocument()
    expect(screen.getByTestId('generate-post-button')).toBeDisabled()
    const whileGenerating = api.getSocialAIContentStatus.mock.calls.length

    api.getSocialAIContentStatus.mockResolvedValue(contentStatusResponse({ status: 'ready', generation: contentGenerationDoc({ status: 'ready' }), publication: contentDraft() }))
    await act(async () => { await vi.advanceTimersByTimeAsync(3000) })
    await waitFor(() => expect(screen.queryByTestId('generator-generating')).not.toBeInTheDocument())
    expect(api.getSocialAIContentStatus.mock.calls.length).toBeGreaterThan(whileGenerating)
    const afterReady = api.getSocialAIContentStatus.mock.calls.length
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000) })
    expect(api.getSocialAIContentStatus.mock.calls.length).toBe(afterReady) // polling stopped
  })
})

describe('Single-post generator - the result is the REAL saved draft', () => {
  async function generateAndFinish(draft, generation = contentGenerationDoc({ status: 'ready' })) {
    api.generateSocialAIContent.mockResolvedValue(contentStartResponse())
    const utils = renderGen()
    await fillValid()
    api.getSocialAIContentStatus.mockResolvedValue(contentStatusResponse({ status: 'ready', generation, publication: draft }))
    fireEvent.click(screen.getByTestId('generate-post-button'))
    await screen.findByTestId('generator-result')
    return utils
  }

  it('shows the saved draft\'s own text, provenance and approval state - and a Review content link to the EXISTING approvals page', async () => {
    await generateAndFinish(contentDraft())
    expect(screen.getByTestId('generator-result-content')).toHaveTextContent('Brushing for two minutes twice a day protects your smile. Book a check-up')
    expect(screen.getByTestId('generator-result-content')).toHaveTextContent('#DentalCare')
    expect(screen.getByTestId('generator-result')).toHaveTextContent('Draft saved - Waiting for content review')
    expect(screen.getByTestId('generator-result-meta')).toHaveTextContent('Facebook · AI-generated · Dental tips · Educational · strategy v1')
    expect(screen.getByTestId('review-content-link')).toHaveAttribute('href', '/app/social-media/content-approvals?tab=content-review')
    expect(screen.queryByTestId('generator-instagram-note')).not.toBeInTheDocument()
  })

  it('when the project auto-approves content, the link goes to the Approved tab and the state is stated honestly', async () => {
    await generateAndFinish(contentDraft({ approvalState: 'content_approved', approvalStage: 'content_approved' }))
    expect(screen.getByTestId('generator-result')).toHaveTextContent('Content approved - ready for the design step')
    expect(screen.getByTestId('review-content-link')).toHaveAttribute('href', '/app/social-media/content-approvals?tab=approved')
  })

  it('an Instagram draft says it needs media before publishing (caption only)', async () => {
    await generateAndFinish(contentDraft({ platform: 'instagram' }))
    expect(screen.getByTestId('generator-instagram-note')).toHaveTextContent('need an image or video before they can be published')
  })

  it('there is no approve, schedule or publish control anywhere in the generator', async () => {
    await generateAndFinish(contentDraft())
    const text = screen.getByTestId('single-post-generator').textContent
    expect(screen.queryByRole('button', { name: /approve|schedule|publish now|post now/i })).not.toBeInTheDocument()
    expect(text).not.toMatch(/Published|Scheduled for/)
  })

  it('a finished generation refreshes the publishing lists and approval counts (the draft is a real publication)', async () => {
    api.generateSocialAIContent.mockResolvedValue(contentStartResponse())
    const { queryClient } = renderGen()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    await fillValid()
    api.getSocialAIContentStatus.mockResolvedValue(contentStatusResponse({ status: 'ready', generation: contentGenerationDoc({ status: 'ready' }), publication: contentDraft() }))
    fireEvent.click(screen.getByTestId('generate-post-button'))
    await screen.findByTestId('generator-result')
    await waitFor(() => expect(spy).toHaveBeenCalledWith({ queryKey: ['social', 'publishing', 'proj-1'] }))
  })

  it('if the draft was deleted afterwards, it says so instead of showing invented content', async () => {
    api.generateSocialAIContent.mockResolvedValue(contentStartResponse())
    renderGen()
    await fillValid()
    api.getSocialAIContentStatus.mockResolvedValue(contentStatusResponse({ status: 'ready', generation: contentGenerationDoc({ status: 'ready' }), publication: null }))
    fireEvent.click(screen.getByTestId('generate-post-button'))
    expect(await screen.findByTestId('generator-draft-missing')).toHaveTextContent('no longer available')
    expect(screen.queryByTestId('generator-result')).not.toBeInTheDocument()
  })

  it('a finished generation from an EARLIER visit is not shown as if it had just happened (nothing fake on load)', async () => {
    api.getSocialAIContentStatus.mockResolvedValue(contentStatusResponse({ status: 'ready', generation: contentGenerationDoc({ id: 'old', status: 'ready' }), publication: contentDraft() }))
    renderGen()
    await screen.findByTestId('generate-post-button')
    await waitFor(() => expect(api.getSocialAIContentStatus).toHaveBeenCalled())
    expect(screen.queryByTestId('generator-result')).not.toBeInTheDocument()
    expect(screen.queryByTestId('generator-failed')).not.toBeInTheDocument()
    expect(screen.getByTestId('generate-post-button')).toBeDisabled() // nothing selected yet
  })
})

describe('Single-post generator - failures are the server\'s, never faked', () => {
  it('a failed generation shows the backend\'s safe message, no draft, and lets the user try again', async () => {
    api.generateSocialAIContent.mockResolvedValue(contentStartResponse())
    renderGen()
    await fillValid()
    api.getSocialAIContentStatus.mockResolvedValue(contentStatusResponse({
      status: 'failed',
      generation: contentGenerationDoc({ status: 'failed', failure: { code: 'AI_BAD_OUTPUT', message: 'The AI returned a post that did not meet Odito\'s checks. Please try again.' } }),
    }))
    fireEvent.click(screen.getByTestId('generate-post-button'))
    expect(await screen.findByTestId('generator-failed-message')).toHaveTextContent('did not meet Odito')
    expect(screen.getByTestId('generator-failed')).toHaveTextContent('Nothing was saved')
    expect(screen.queryByTestId('generator-result')).not.toBeInTheDocument()
    expect(screen.queryByTestId('review-content-link')).not.toBeInTheDocument()
    expect(screen.getByTestId('generate-post-button')).toBeEnabled()
  })

  it.each([
    [409, 'PLATFORM_NOT_CONNECTED', 'Connect your Facebook Page before generating a post for it.'],
    [409, 'NO_STRATEGY', 'Generate an AI strategy first - posts are written from your strategy.'],
    [422, 'OBJECTIVE_NOT_IN_STRATEGY', 'That objective is not part of your current strategy\'s content mix.'],
    [429, 'RATE_LIMITED', 'Too many post generations. Please wait a few minutes and try again.'],
    [503, 'AI_UNAVAILABLE', 'AI generation is not available right now. Please try again later.'],
  ])('a refused start (%s %s) shows the server\'s own message and creates no result', async (status, code, message) => {
    api.generateSocialAIContent.mockRejectedValue(apiError(message, { status, code }))
    renderGen()
    await fillValid()
    fireEvent.click(screen.getByTestId('generate-post-button'))
    expect(await screen.findByTestId('generator-start-error')).toHaveTextContent(message)
    expect(screen.queryByTestId('generator-generating')).not.toBeInTheDocument()
    expect(screen.queryByTestId('generator-result')).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId('generate-post-button')).toBeEnabled())
  })

  it('shows no sample post, preview or placeholder text before anything has been generated', async () => {
    renderGen()
    await screen.findByTestId('generate-post-button')
    for (const id of ['generator-result', 'generator-result-content', 'generator-generating', 'generator-failed', 'generator-draft-missing']) expect(screen.queryByTestId(id)).not.toBeInTheDocument()
  })
})
