import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { screen, within, fireEvent, waitFor, act } from '@testing-library/react'
import { renderWithClient } from '@/test-utils/socialMediaAI'
import { calendarItem, calendarState, calendarResponse, calendarGeneration, calendarOptionsResponse } from '@/test-utils/socialMediaPlan'

vi.mock('next/link', async () => (await import('@/test-utils/socialMediaAI')).nextLinkMock())

const api = vi.hoisted(() => ({ getSocialContentCalendar: vi.fn(), getSocialContentCalendarStatus: vi.fn(), generateSocialContentCalendar: vi.fn(), getSocialAIContentStatus: vi.fn(), getSocialCalendarOptions: vi.fn() }))
vi.mock('@/lib/apiService', () => ({ default: api }))

import { ContentPlanSection } from './ContentPlanSection'
import { socialContentCalendarKey } from '@/hooks/useSocialMediaAI'

const ITEMS = [
  calendarItem({ id: 'i1', date: '2026-10-06', platforms: ['facebook'], format: 'static_post', topic: 'Meet Dr Lee', hook: 'The face behind your smile', contentPillar: 'Meet the team', contentType: 'educational', primaryCta: 'Book a check-up' }),
  calendarItem({ id: 'i2', date: '2026-10-07', platforms: ['instagram'], topic: '5 brushing mistakes', serviceId: 'svc-1', serviceName: 'Family check-up' }),
  calendarItem({ id: 'i3', date: '2026-10-09', platforms: ['facebook', 'instagram'], format: 'reel', topic: 'Whitening kit demo', productId: 'prod-1', productName: 'Whitening kit', objective: 'conversion', primaryKpi: 'clicks', requiresReview: true, approvalNotes: 'Avoid result guarantees.', footerDisclaimer: 'Results vary.' }),
  calendarItem({ id: 'i4', date: '2026-10-14', platforms: ['instagram'], topic: 'Cancelled idea', status: 'cancelled' }),
]
const ready = (over = {}) => calendarResponse({ status: 'ready', items: ITEMS, ...over })
const none = (over = {}) => calendarResponse({ status: 'none', ...over })

const load = (response) => api.getSocialContentCalendar.mockResolvedValue(response)
const mount = () => renderWithClient(<ContentPlanSection projectId="proj-1" />)

beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset())
  api.getSocialAIContentStatus.mockResolvedValue({ success: true, data: { status: 'none', generation: null, publication: null } })
  api.getSocialCalendarOptions.mockResolvedValue(calendarOptionsResponse())
})
afterEach(() => { vi.useRealTimers() })

describe('Content plan — states before a calendar exists', () => {
  it('shows a loading skeleton, then the form', async () => {
    let release
    api.getSocialContentCalendar.mockReturnValue(new Promise((r) => { release = r }))
    mount()
    expect(screen.getByTestId('plan-loading')).toHaveAttribute('aria-busy', 'true')
    await act(async () => { release(none()) })
    expect(await screen.findByTestId('calendar-plan-form')).toBeInTheDocument()
    expect(screen.queryByTestId('plan-loading')).not.toBeInTheDocument()
  })

  it('a load failure is an error with a retry, not an empty plan', async () => {
    api.getSocialContentCalendar.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(none())
    mount()
    const error = await screen.findByTestId('plan-error')
    expect(error).toHaveTextContent("Couldn't load your content plan")
    fireEvent.click(within(error).getByRole('button', { name: 'Try again' }))
    expect(await screen.findByTestId('calendar-plan-form')).toBeInTheDocument()
    expect(api.getSocialContentCalendar).toHaveBeenCalledTimes(2)
  })

  it('without a strategy it sends the user to AI Strategy and offers no generator', async () => {
    load(none({ strategy: { available: false } }))
    mount()
    const card = await screen.findByTestId('plan-no-strategy')
    expect(within(card).getByRole('link', { name: 'Go to AI Strategy' })).toHaveAttribute('href', '/app/social-media/ai-strategy')
    expect(screen.queryByTestId('calendar-plan-form')).not.toBeInTheDocument()
  })

  it('with no connected platform it says so and links to Connect accounts; Generate stays disabled', async () => {
    load(none({ connectedPlatforms: { facebook: false, instagram: false } }))
    mount()
    expect(await screen.findByTestId('plan-no-platforms')).toHaveTextContent('Connect Facebook or Instagram')
    expect(within(screen.getByTestId('plan-no-platforms')).getByRole('link', { name: 'Connect accounts' })).toHaveAttribute('href', '/app/social-media/connect-accounts')
    expect(screen.getByTestId('generate-calendar-button')).toBeDisabled()
    expect(screen.getByTestId('plan-problems')).toHaveTextContent('Choose at least one platform.')
  })
})

describe('Content plan — the planning form', () => {
  const form = async (response = none()) => { load(response); mount(); return screen.findByTestId('calendar-plan-form') }

  it('offers 1–7 posts per week, defaults to the strategy recommendation, and says the number is a TOTAL', async () => {
    const f = await form()
    const options = within(within(f).getByTestId('posts-per-week')).getAllByRole('radio')
    expect(options.map((o) => o.value)).toEqual(['1', '2', '3', '4', '5', '6', '7'])
    expect(options.find((o) => o.checked).value).toBe('4')
    expect(f).toHaveTextContent('Total posts, not per platform.')
    expect(f).toHaveTextContent('Your strategy recommends 3-5 posts/week')
  })

  it('lists only CONNECTED platforms as choosable; a disconnected one is disabled with a Connect link', async () => {
    const f = await form(none({ connectedPlatforms: { facebook: true, instagram: false } }))
    const platforms = within(f).getByTestId('platforms')
    const [fb, ig] = within(platforms).getAllByRole('checkbox')
    expect(fb).toBeChecked()
    expect(fb).toBeEnabled()
    expect(ig).toBeDisabled()
    expect(ig).not.toBeChecked()
    expect(within(platforms).getByRole('link', { name: 'Connect' })).toHaveAttribute('href', '/app/social-media/connect-accounts')
    expect(within(f).queryByTestId('distribution')).not.toBeInTheDocument() // one platform: nothing to distribute
  })

  it('a connected platform that the strategy does not cover cannot be chosen either', async () => {
    const f = await form(none({ strategy: { ...calendarState().strategy, platforms: ['facebook'] } }))
    const [, ig] = within(within(f).getByTestId('platforms')).getAllByRole('checkbox')
    expect(ig).toBeDisabled()
    expect(f).toHaveTextContent('Not in your strategy')
  })

  it('shows the distribution modes only when two platforms are selected', async () => {
    const f = await form()
    const dist = within(f).getByTestId('distribution')
    expect(within(dist).getAllByRole('radio').map((r) => r.value)).toEqual(['ai_optimized', 'balanced', 'platform_specific'])
    expect(within(dist).getByRole('radio', { name: /AI optimized/ })).toBeChecked()
    fireEvent.click(within(within(f).getByTestId('platforms')).getAllByRole('checkbox')[1])
    expect(within(f).queryByTestId('distribution')).not.toBeInTheDocument()
  })

  it('summarises how many posts to expect and never doubles them per platform', async () => {
    const f = await form()
    fireEvent.click(within(f).getByRole('radio', { name: '2 posts per week' }))
    fireEvent.click(within(within(f).getByTestId('quick-ranges')).getByRole('button', { name: /14/ }))
    expect(within(f).getByTestId('plan-summary')).toHaveTextContent('About 4 posts over 14 days (2 per week)')
    expect(within(f).getByTestId('plan-summary')).toHaveTextContent('may become more than one publication')
  })

  it('validates: no platform, a range that is too short, an end before the start, and a past start', async () => {
    const f = await form()
    const generate = within(f).getByTestId('generate-calendar-button')
    expect(generate).toBeEnabled()

    const [fb, ig] = within(within(f).getByTestId('platforms')).getAllByRole('checkbox')
    fireEvent.click(fb); fireEvent.click(ig)
    expect(within(f).getByTestId('plan-problems')).toHaveTextContent('Choose at least one platform.')
    expect(generate).toBeDisabled()
    fireEvent.click(fb)
    expect(generate).toBeEnabled()

    fireEvent.change(within(f).getByLabelText('End date'), { target: { value: within(f).getByLabelText('Start date').value } })
    expect(within(f).getByTestId('plan-problems')).toHaveTextContent('Plan at least 7 days.')
    expect(generate).toBeDisabled()

    fireEvent.change(within(f).getByLabelText('Start date'), { target: { value: '2020-01-01' } })
    expect(within(f).getByTestId('plan-problems')).toHaveTextContent('The calendar cannot start in the past.')

    fireEvent.change(within(f).getByLabelText('End date'), { target: { value: '2019-01-01' } })
    expect(within(f).getByTestId('plan-problems')).toHaveTextContent('Choose a start date and an end date that is on or after it.')
    expect(generate).toBeDisabled()
  })

  it('rejects a range longer than the server limit', async () => {
    const f = await form()
    const start = within(f).getByLabelText('Start date').value
    const end = new Date(`${start}T00:00:00Z`); end.setUTCDate(end.getUTCDate() + 60)
    fireEvent.change(within(f).getByLabelText('End date'), { target: { value: end.toISOString().slice(0, 10) } })
    expect(within(f).getByTestId('plan-problems')).toHaveTextContent('Plan at most 31 days.')
    expect(within(f).getByTestId('generate-calendar-button')).toBeDisabled()
  })

  it('sends ONLY the user\'s choices — never strategy, profile, catalog, prompt or model fields', async () => {
    api.getSocialContentCalendar.mockResolvedValueOnce(none()).mockResolvedValue(none({ status: 'generating', generation: calendarGeneration() }))
    api.generateSocialContentCalendar.mockResolvedValue({ success: true, data: { status: 'generating' } })
    const f = await form()
    fireEvent.click(within(f).getByRole('radio', { name: '5 posts per week' }))
    fireEvent.click(within(within(f).getByTestId('distribution')).getByRole('radio', { name: /Balanced/ }))
    fireEvent.click(within(f).getByTestId('generate-calendar-button'))
    await waitFor(() => expect(api.generateSocialContentCalendar).toHaveBeenCalledTimes(1))
    const [pid, body] = api.generateSocialContentCalendar.mock.calls[0]
    expect(pid).toBe('proj-1')
    expect(Object.keys(body).sort()).toEqual(['distributionMode', 'endDate', 'platforms', 'postsPerWeek', 'startDate'])
    expect(body).toMatchObject({ postsPerWeek: 5, platforms: ['facebook', 'instagram'], distributionMode: 'balanced' })
    expect(body.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('a single selected platform is always sent as balanced, whatever mode was picked before', async () => {
    api.generateSocialContentCalendar.mockResolvedValue({ success: true, data: { status: 'generating' } })
    const f = await form()
    fireEvent.click(within(within(f).getByTestId('distribution')).getByRole('radio', { name: /Platform-specific/ }))
    fireEvent.click(within(within(f).getByTestId('platforms')).getAllByRole('checkbox')[1])
    fireEvent.click(within(f).getByTestId('generate-calendar-button'))
    await waitFor(() => expect(api.generateSocialContentCalendar).toHaveBeenCalled())
    expect(api.generateSocialContentCalendar.mock.calls[0][1]).toMatchObject({ platforms: ['facebook'], distributionMode: 'balanced' })
  })

  it('a double-click starts ONE generation', async () => {
    let release
    api.generateSocialContentCalendar.mockReturnValue(new Promise((r) => { release = r }))
    const f = await form()
    const button = within(f).getByTestId('generate-calendar-button')
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.submit(f)
    expect(await screen.findByText('Starting…')).toBeInTheDocument()
    await waitFor(() => expect(api.generateSocialContentCalendar).toHaveBeenCalledTimes(1))
    fireEvent.submit(f)
    await act(async () => { release({ success: true, data: { status: 'generating' } }) })
    expect(api.generateSocialContentCalendar).toHaveBeenCalledTimes(1)
  })

  it('a refused start shows the server message in the form and keeps the choices', async () => {
    api.generateSocialContentCalendar.mockRejectedValue(Object.assign(new Error('x'), { response: { status: 409, data: { code: 'CALENDAR_GENERATION_IN_PROGRESS', message: 'A calendar is already being generated.' } } }))
    const f = await form()
    fireEvent.click(within(f).getByRole('radio', { name: '6 posts per week' }))
    fireEvent.click(within(f).getByTestId('generate-calendar-button'))
    expect(await screen.findByTestId('plan-start-error')).toBeInTheDocument()
    expect(within(screen.getByTestId('calendar-plan-form')).getByRole('radio', { name: '6 posts per week' })).toBeChecked()
    expect(within(screen.getByTestId('calendar-plan-form')).getByTestId('generate-calendar-button')).toBeEnabled()
  })
})

describe('Content plan — asynchronous generation', () => {
  it('while the server is generating: a status banner, no form, no regenerate, and it polls the cheap status endpoint', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    load(none({ status: 'generating', generation: calendarGeneration() }))
    api.getSocialContentCalendarStatus.mockResolvedValue({ success: true, data: { status: 'generating' } })
    mount()
    const banner = await screen.findByTestId('plan-generating')
    expect(banner).toHaveTextContent('Planning and writing your content calendar from your strategy')
    expect(banner).toHaveTextContent('You can leave this page')
    expect(screen.queryByTestId('calendar-plan-form')).not.toBeInTheDocument()
    await waitFor(() => expect(api.getSocialContentCalendarStatus).toHaveBeenCalledTimes(1))
    await act(async () => { await vi.advanceTimersByTimeAsync(3100) })
    expect(api.getSocialContentCalendarStatus.mock.calls.length).toBeGreaterThanOrEqual(2)
    expect(api.getSocialContentCalendar).toHaveBeenCalledTimes(1) // polling never re-downloads the whole plan
  })

  it('when the poll reports it finished, the full plan is fetched and the banner goes', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    api.getSocialContentCalendar
      .mockResolvedValueOnce(none({ status: 'generating', generation: calendarGeneration() }))
      .mockResolvedValue(ready())
    api.getSocialContentCalendarStatus.mockResolvedValue({ success: true, data: { status: 'ready' } })
    mount()
    await screen.findByTestId('plan-generating')
    await act(async () => { await vi.advanceTimersByTimeAsync(3500) })
    expect(await screen.findByTestId('plan-table')).toBeInTheDocument()
    expect(screen.queryByTestId('plan-generating')).not.toBeInTheDocument()
    expect(api.getSocialContentCalendar).toHaveBeenCalledTimes(2)
  })

  it('a failed attempt shows the server message, keeps the form for another try, and says a previous calendar is unchanged', async () => {
    load(none({ status: 'failed', generation: calendarGeneration({ status: 'failed', failure: { code: 'AI_UNAVAILABLE', message: 'The AI service is unavailable. Please try again.' } }) }))
    mount()
    expect(await screen.findByTestId('plan-failed-message')).toHaveTextContent('The AI service is unavailable.')
    expect(screen.getByTestId('calendar-plan-form')).toBeInTheDocument()
    expect(screen.getByTestId('plan-failed')).not.toHaveTextContent('previous calendar')
  })

  it('a failed regeneration leaves the previous calendar visible and untouched', async () => {
    // the fixture only attaches a calendar for status 'ready', so build the "failed regeneration" state from a ready one
    load({ success: true, data: { ...ready().data, status: 'failed', generation: calendarGeneration({ status: 'failed', failure: { code: 'CALENDAR_INVALID_OUTPUT', message: 'The plan could not be completed.' } }) } })
    mount()
    const failed = await screen.findByTestId('plan-failed')
    expect(failed).toHaveTextContent('Your previous calendar (version 1) is shown below and is unchanged.')
    expect(screen.getByTestId('plan-table')).toBeInTheDocument()
  })
})

describe('Content plan — a ready calendar', () => {
  const open = async (response = ready()) => { load(response); mount(); return screen.findByTestId('plan-table') }

  it('shows one compact row per post with date, platforms, format, pillar, topic/hook, focus, CTA and status', async () => {
    const table = await open()
    expect(within(table).getAllByTestId(/^plan-row-/)).toHaveLength(4)
    const row = within(table).getByTestId('plan-row-i1')
    expect(row).toHaveTextContent('Facebook')
    expect(within(row).getByTestId('item-format')).toHaveTextContent('Static post')
    expect(within(row).getByTestId('item-pillar')).toHaveTextContent('Meet the team')
    expect(within(row).getByTestId('item-topic')).toHaveTextContent('Meet Dr Lee')
    expect(within(row).getByTestId('item-hook')).toHaveTextContent('The face behind your smile')
    expect(within(row).getByTestId('item-cta')).toHaveTextContent('Book a check-up')
    expect(within(row).getByTestId('item-focus')).toHaveTextContent('Brand')
    expect(row).toHaveTextContent('Planned')
  })

  it('shows the linked service or product name — and "Brand" when a post is about neither', async () => {
    const table = await open()
    expect(within(within(table).getByTestId('plan-row-i2')).getByTestId('item-focus')).toHaveTextContent('Family check-up')
    expect(within(within(table).getByTestId('plan-row-i3')).getByTestId('item-focus')).toHaveTextContent('Whitening kit')
    expect(within(within(table).getByTestId('plan-row-i3')).getByTestId('item-platforms')).toHaveTextContent('FacebookInstagram')
  })

  it('flags posts that need a careful review and shows cancelled ones as such', async () => {
    const table = await open()
    expect(within(within(table).getByTestId('plan-row-i3')).getByLabelText('Needs review')).toBeInTheDocument()
    expect(within(within(table).getByTestId('plan-row-i1')).queryByLabelText('Needs review')).not.toBeInTheDocument()
    expect(within(table).getByTestId('plan-row-i4')).toHaveTextContent('Cancelled')
  })

  it('has a responsive layout: the column header only from xl, rows stack on small screens', async () => {
    const table = await open()
    expect(within(table).getByTestId('plan-table-head').className).toMatch(/hidden[^"]*xl:grid/)
    expect(within(table).getByTestId('plan-row-i1').className).toMatch(/grid-cols-1[^"]*xl:grid-cols-\[/)
  })

  it('summary: provenance, size, range, per-platform counts, planned-vs-target pillar mix', async () => {
    await open()
    expect(screen.getByTestId('plan-provenance')).toHaveTextContent('Generated from Strategy v3 · Calendar v1')
    const facts = screen.getByTestId('plan-facts')
    expect(facts).toHaveTextContent('4 posts')
    expect(facts).toHaveTextContent('3 per week')
    expect(facts).toHaveTextContent('Facebook 1, Instagram 2')
    const dist = screen.getByTestId('pillar-distribution')
    expect(within(dist).getByTestId('distribution-Dental tips')).toHaveTextContent('2 posts · 66.7% (target 60%)')
    expect(within(dist).getByTestId('distribution-Meet the team')).toHaveTextContent('(target 40%)')
  })

  it('warnings are collapsed until asked for', async () => {
    await open(ready({ calendar: { ...calendarState({ status: 'ready', items: ITEMS }).calendar, plan: { ...calendarState({ status: 'ready', items: ITEMS }).calendar.plan, warnings: ['Two hooks were reused to keep the topics distinct.'] } } }))
    const toggle = screen.getByRole('button', { name: 'Odito adjusted 1 thing' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Two hooks were reused to keep the topics distinct.')).not.toBeInTheDocument()
    fireEvent.click(toggle)
    expect(within(screen.getByTestId('plan-warnings')).getByText('Two hooks were reused to keep the topics distinct.')).toBeInTheDocument()
  })

  it('an empty calendar says so', async () => {
    load(ready({ items: [] }))
    mount()
    expect(await screen.findByTestId('plan-empty')).toBeInTheDocument()
  })

  it('switches between the table and the weekly calendar grid', async () => {
    await open()
    fireEvent.click(screen.getByRole('button', { name: 'Calendar' }))
    const grid = await screen.findByTestId('plan-grid')
    expect(screen.queryByTestId('plan-table')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Calendar' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(grid).getAllByTestId(/^plan-chip-/)).toHaveLength(4)
    // 2026-10-06 and 2026-10-14 are Tuesdays of different weeks
    expect(within(grid).getAllByTestId(/^plan-week-/)).toHaveLength(2)
    expect(within(grid).getByTestId('plan-chip-i1')).toHaveTextContent('Meet Dr Lee')
    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    expect(await screen.findByTestId('plan-table')).toBeInTheDocument()
  })

  it('opens a centered MODAL (not a drawer) with the post\'s planning fields, its status and its plan provenance', async () => {
    const table = await open()
    fireEvent.click(within(table).getByTestId('plan-row-i3'))
    expect(await screen.findByLabelText('Topic')).toHaveValue('Whitening kit demo')
    const modal = screen.getByTestId('item-modal')
    expect(screen.getByRole('dialog')).toBe(modal)
    expect(screen.queryByTestId('plan-drawer')).not.toBeInTheDocument()
    expect(modal.className).toMatch(/left-\[50%\]/)
    expect(modal.className).not.toMatch(/\bright-0\b|slide-in-from-right/)
    expect(within(modal).getByTestId('item-modal-title')).toHaveTextContent('Edit content plan')
    expect(modal).toHaveTextContent('Whitening kit demo')
    expect(within(modal).getByTestId('item-status')).toHaveTextContent('Planned')
    expect(within(modal).getByTestId('item-content-id')).toHaveTextContent('OCT-P01')
    expect(within(modal).getByTestId('item-provenance')).toHaveTextContent('Planned from Strategy v3')
    expect(within(modal).queryByRole('button', { name: /publish|schedule/i })).not.toBeInTheDocument()
  })

  it('a grid chip opens the same modal', async () => {
    await open()
    fireEvent.click(screen.getByRole('button', { name: 'Calendar' }))
    fireEvent.click(await screen.findByTestId('plan-chip-i2'))
    expect(await screen.findByLabelText('Topic')).toHaveValue('5 brushing mistakes')
    expect(screen.getByTestId('item-modal')).toHaveTextContent('5 brushing mistakes')
    expect(screen.queryByTestId('plan-drawer')).not.toBeInTheDocument()
  })

  it('the modal closes with Escape (nothing unsaved, so no confirmation)', async () => {
    const table = await open()
    fireEvent.click(within(table).getByTestId('plan-row-i1'))
    await screen.findByTestId('item-modal')
    fireEvent.keyDown(document.activeElement || document.body, { key: 'Escape', code: 'Escape' })
    await waitFor(() => expect(screen.queryByTestId('item-modal')).not.toBeInTheDocument())
  })
})

describe('Content plan — staleness and regeneration', () => {
  it('no stale notice when nothing changed', async () => {
    load(ready())
    mount()
    await screen.findByTestId('plan-table')
    expect(screen.queryByTestId('calendar-stale')).not.toBeInTheDocument()
  })

  it('tells the user when the strategy changed, names both versions, and promises nothing was regenerated', async () => {
    load(ready({ stale: { strategyChanged: true, currentStrategyVersion: 4, profileChanged: false } }))
    mount()
    const banner = await screen.findByTestId('calendar-stale')
    expect(banner).toHaveTextContent('Your strategy has changed since this calendar was generated.')
    expect(banner).toHaveTextContent('Strategy v3; the current strategy is v4')
    expect(banner).toHaveTextContent('Nothing was regenerated automatically.')
    expect(screen.getByTestId('plan-table')).toBeInTheDocument()
    expect(api.generateSocialContentCalendar).not.toHaveBeenCalled()
  })

  it('tells the user when only the business profile changed', async () => {
    load(ready({ stale: { strategyChanged: false, currentStrategyVersion: 3, profileChanged: true } }))
    mount()
    expect(await screen.findByTestId('calendar-stale')).toHaveTextContent('Your business profile has changed since this calendar was generated.')
    expect(screen.getByRole('link', { name: 'Review strategy' })).toHaveAttribute('href', '/app/social-media/ai-strategy')
  })

  it('Regenerate opens the form (with the old calendar still showing) and Cancel closes it', async () => {
    load(ready())
    mount()
    await screen.findByTestId('plan-table')
    expect(screen.queryByTestId('calendar-plan-form')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('regenerate-calendar'))
    const form = await screen.findByTestId('calendar-plan-form')
    expect(screen.getByTestId('plan-table')).toBeInTheDocument()
    expect(within(form).getByTestId('generate-calendar-button')).toHaveTextContent('Regenerate calendar')
    fireEvent.click(within(form).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByTestId('calendar-plan-form')).not.toBeInTheDocument()
  })

  it('regeneration is CONFIRMED first: nothing is sent until the user agrees; keeping the calendar sends nothing', async () => {
    load(ready())
    mount()
    await screen.findByTestId('plan-table')
    fireEvent.click(screen.getByTestId('regenerate-calendar'))
    fireEvent.click(within(await screen.findByTestId('calendar-plan-form')).getByTestId('generate-calendar-button'))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Regenerate the content calendar?')
    expect(dialog).toHaveTextContent('Version 1 is kept in history')
    expect(dialog).toHaveTextContent('version 2')
    expect(api.generateSocialContentCalendar).not.toHaveBeenCalled()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Keep current calendar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(api.generateSocialContentCalendar).not.toHaveBeenCalled()
  })

  it('confirming starts generation once, then the calendar is refetched (query invalidation) and the banner shows', async () => {
    api.getSocialContentCalendar.mockResolvedValueOnce(ready()).mockResolvedValue(ready({ status: 'generating', generation: calendarGeneration({ version: 2 }) }))
    api.getSocialContentCalendarStatus.mockResolvedValue({ success: true, data: { status: 'generating' } })
    api.generateSocialContentCalendar.mockResolvedValue({ success: true, data: { status: 'generating' } })
    const { queryClient } = mount()
    await screen.findByTestId('plan-table')
    fireEvent.click(screen.getByTestId('regenerate-calendar'))
    fireEvent.click(within(await screen.findByTestId('calendar-plan-form')).getByTestId('generate-calendar-button'))
    const dialog = await screen.findByRole('dialog')
    const confirm = within(dialog).getByRole('button', { name: 'Regenerate calendar' })
    fireEvent.click(confirm)
    fireEvent.click(confirm)
    await waitFor(() => expect(api.generateSocialContentCalendar).toHaveBeenCalledTimes(1))
    expect(await screen.findByTestId('plan-generating')).toBeInTheDocument()
    expect(api.getSocialContentCalendar).toHaveBeenCalledTimes(2)
    expect(queryClient.getQueryData(socialContentCalendarKey('proj-1')).status).toBe('generating')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('the stale banner\'s Regenerate button opens the same form', async () => {
    load(ready({ stale: { strategyChanged: true, currentStrategyVersion: 4, profileChanged: false } }))
    mount()
    const banner = await screen.findByTestId('calendar-stale')
    fireEvent.click(within(banner).getByRole('button', { name: 'Regenerate calendar' }))
    expect(await screen.findByTestId('calendar-plan-form')).toBeInTheDocument()
  })

  it('is planning only: no caption, design, schedule or publish control anywhere on the plan', async () => {
    load(ready())
    mount()
    await screen.findByTestId('plan-table')
    expect(screen.queryByRole('button', { name: /generate (caption|content|design)|create design|schedule|publish|post now/i })).not.toBeInTheDocument()
  })
})
