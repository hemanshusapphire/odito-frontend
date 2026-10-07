import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { screen, waitFor, fireEvent, act } from '@testing-library/react'
import {
  renderWithClient, managedPublication, approvalBlock, installPublicationsApi, statusResponse, ACTIVE_FACEBOOK, ACTIVE_INSTAGRAM, apiError,
} from '@/test-utils/socialMediaAI'

const api = vi.hoisted(() => ({
  getSocialAccountsStatus: vi.fn(),
  getSocialPublications: vi.fn(),
  getSocialApprovalSettings: vi.fn(),
  submitSocialContentForReview: vi.fn(),
  approveSocialContent: vi.fn(),
  requestSocialContentChanges: vi.fn(),
  submitSocialDesignForReview: vi.fn(),
  approveSocialDesign: vi.fn(),
  requestSocialDesignChanges: vi.fn(),
  updateSocialPublication: vi.fn(),
  scheduleSocialPublication: vi.fn(),
  uploadSocialMedia: vi.fn(),
  getSocialAIDesignStatus: vi.fn(),
  generateSocialAIDesign: vi.fn(),
}))
vi.mock('@/lib/apiService', () => ({ default: api }))

let searchParams = new URLSearchParams('tab=approved')
vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParams,
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/app/social-media/content-approvals',
}))
vi.mock('@/contexts/ProjectContext', () => ({
  useProject: () => ({ activeProject: { _id: 'proj-1', project_name: 'Acme' }, activeProjectId: 'proj-1', projects: [{ _id: 'proj-1', project_name: 'Acme' }], setActiveProject: vi.fn() }),
}))
vi.mock('next/link', async () => (await import('@/test-utils/socialMediaAI')).nextLinkMock())

import ContentApprovalsPage from './page'
import { useScheduledPosts, useCalendarPosts } from '@/hooks/useSocialMediaAI'

let store

beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset())
  searchParams = new URLSearchParams('tab=approved')
  api.getSocialAccountsStatus.mockResolvedValue(statusResponse({ facebook: ACTIVE_FACEBOOK, instagram: ACTIVE_INSTAGRAM }))
  api.getSocialApprovalSettings.mockResolvedValue({ success: true, data: { settings: { contentApprovalRequired: true, designApprovalRequired: true } } })
  api.getSocialAIDesignStatus.mockResolvedValue({ success: true, data: { status: 'none', generation: null, publication: null } })
})

const MEDIA = [{ url: 'http://localhost:5000/storage/social_media/p/a.jpg', type: 'image' }]
const seed = (rows) => { store = installPublicationsApi(api, rows); return store }
const row = (id) => store.rows.find((r) => r.id === id)
function setRow(id, patch, extra = {}) {
  store.rows = store.rows.map((r) => (r.id === id ? { ...r, ...patch } : r))
  return { success: true, data: { publication: row(id), ...extra } }
}
/** What the BACKEND does now for an edit that withdraws approval: draft, schedule gone, back to review - in one response. */
const serverClearsSchedule = (id, patch = {}) => setRow(id, { status: 'draft', scheduledAt: null, timezone: null, approval: approvalBlock('content_review', {}, 'draft'), ...patch }, { scheduleCleared: true })
const moves = (fn, id, state, over = {}) => fn.mockImplementation(async () => { const r = row(id); return setRow(id, { approval: approvalBlock(state, { ...r.approval, ...over, state, stage: state, publishable: state === 'design_approved' }, r.status) }) })
const tab = (name) => screen.getByRole('button', { name: new RegExp(`^${name} \\(`) })

function ScheduleViews() {
  const scheduled = useScheduledPosts('proj-1')
  const calendar = useCalendarPosts('proj-1', { from: '2099-03-01', to: '2099-03-31' })
  return (
    <div>
      <span data-testid="views-scheduled">{scheduled.posts.map((p) => p.id).join(',')}</span>
      <span data-testid="views-calendar">{calendar.posts.map((p) => p.id).join(',')}</span>
    </div>
  )
}
const scheduledRow = (over = {}) => managedPublication('design_approved', { id: 's1', status: 'scheduled', scheduledAt: '2099-03-10T09:00:00.000Z', timezone: 'UTC', content: 'Original caption', media: MEDIA, ...over })
const edit = async (text) => {
  fireEvent.change(await screen.findByRole('textbox', { name: 'Caption' }), { target: { value: text } })
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
}

describe('Content Approvals - editing a SCHEDULED post', () => {
  it('warns BEFORE the edit that it will withdraw approval and remove the schedule', async () => {
    seed([scheduledRow()])
    renderWithClient(<ContentApprovalsPage />)
    await screen.findByTestId('approval-post-s1')
    expect(screen.getByTestId('approval-badge')).toHaveTextContent('Approved · scheduled')
    expect(screen.getByText(/withdraws its approval and removes its schedule/)).toBeInTheDocument()
  })

  it('saving the edit: the server clears the schedule -> the UI says so, follows the post to Content review, and drops it from Scheduled Posts AND Calendar - no reload', async () => {
    seed([scheduledRow()])
    api.updateSocialPublication.mockImplementation(async (pid, id, changes) => serverClearsSchedule(id, { content: changes.content }))
    renderWithClient(<><ContentApprovalsPage /><ScheduleViews /></>)
    await screen.findByTestId('approval-post-s1')
    await waitFor(() => expect(screen.getByTestId('views-scheduled')).toHaveTextContent('s1'))
    await waitFor(() => expect(screen.getByTestId('views-calendar')).toHaveTextContent('s1'))

    await edit('Edited caption')
    await waitFor(() => expect(api.updateSocialPublication).toHaveBeenCalledWith('proj-1', 's1', { content: 'Edited caption' }))
    expect(await screen.findByText(/its schedule was removed\. Approve it again, then schedule it again\./)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId('views-scheduled').textContent).toBe(''))
    await waitFor(() => expect(screen.getByTestId('views-calendar').textContent).toBe(''))
    // followed to the tab it now lives in, showing the real (server) state
    await waitFor(() => expect(screen.getByTestId('approval-badge')).toHaveTextContent('Content in review'))
    expect(screen.getByTestId('approval-post-s1')).toBeInTheDocument()
    expect(tab('Content review')).toHaveTextContent('Content review (1)')
    expect(tab('Approved')).toHaveTextContent('Approved (0)')
    expect(screen.queryByTestId('action-schedule')).not.toBeInTheDocument()
    expect(screen.getByTestId('action-approve-content')).toBeInTheDocument()
  })

  it('the way back through the UI: approve content -> submit + approve design -> Schedule is offered again -> schedule -> it is back in Scheduled Posts and the Calendar', async () => {
    seed([scheduledRow()])
    api.updateSocialPublication.mockImplementation(async (pid, id, changes) => serverClearsSchedule(id, { content: changes.content }))
    moves(api.approveSocialContent, 's1', 'content_approved')
    moves(api.submitSocialDesignForReview, 's1', 'design_review')
    moves(api.approveSocialDesign, 's1', 'design_approved')
    api.scheduleSocialPublication.mockImplementation(async (pid, id, scheduledAt, timezone) => setRow(id, { status: 'scheduled', scheduledAt, timezone, approval: approvalBlock('design_approved', {}, 'scheduled') }))
    renderWithClient(<><ContentApprovalsPage /><ScheduleViews /></>)
    await screen.findByTestId('approval-post-s1')

    await edit('Edited caption')
    fireEvent.click(await screen.findByTestId('action-approve-content'))
    await waitFor(() => expect(api.approveSocialContent).toHaveBeenCalled())
    fireEvent.click(tab('Approved'))
    fireEvent.click(await screen.findByTestId('approval-post-s1'))
    fireEvent.click(await screen.findByTestId('action-submit-design'))
    await waitFor(() => expect(api.submitSocialDesignForReview).toHaveBeenCalled())
    fireEvent.click(tab('Design review'))
    fireEvent.click(await screen.findByTestId('approval-post-s1'))
    fireEvent.click(await screen.findByTestId('action-approve-design'))
    await waitFor(() => expect(api.approveSocialDesign).toHaveBeenCalled())
    fireEvent.click(tab('Approved'))
    fireEvent.click(await screen.findByTestId('approval-post-s1'))

    fireEvent.click(await screen.findByTestId('action-schedule'))
    fireEvent.change(await screen.findByLabelText('Date'), { target: { value: '2099-03-12' } })
    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '11:00' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm schedule' }))
    await waitFor(() => expect(api.scheduleSocialPublication).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.getByTestId('views-scheduled')).toHaveTextContent('s1'))
    await waitFor(() => expect(screen.getByTestId('views-calendar')).toHaveTextContent('s1'))
    expect(row('s1').content).toBe('Edited caption')
  })

  it('replacing the design of a scheduled post: the server clears the schedule and the toast says so', async () => {
    seed([scheduledRow()])
    api.uploadSocialMedia.mockResolvedValue({ success: true, data: { url: 'http://localhost:5000/storage/social_media/p/new.jpg', type: 'image' } })
    api.updateSocialPublication.mockImplementation(async (pid, id, changes) => setRow(id, { status: 'draft', scheduledAt: null, timezone: null, media: changes.media, approval: approvalBlock('design_review', {}, 'draft') }, { scheduleCleared: true }))
    renderWithClient(<ContentApprovalsPage />)
    await screen.findByTestId('approval-post-s1')
    expect(screen.getByTestId('design-panel')).toHaveTextContent('Replacing the design removes the schedule')
    const file = new File(['x'], 'new.jpg', { type: 'image/jpeg' })
    fireEvent.change(screen.getByTestId('design-file-input'), { target: { files: [file] } })
    expect(await screen.findByText(/Design replaced\. The change withdrew the post's approval, so its schedule was removed/)).toBeInTheDocument()
    await waitFor(() => expect(tab('Design review')).toHaveTextContent('Design review (1)'))
  })

  it('an edit that does NOT clear the schedule (project needs no re-approval) shows the ordinary message and stays on the Approved tab, still scheduled', async () => {
    seed([scheduledRow()])
    api.updateSocialPublication.mockImplementation(async (pid, id, changes) => setRow(id, { content: changes.content }, { scheduleCleared: false }))
    renderWithClient(<><ContentApprovalsPage /><ScheduleViews /></>)
    await screen.findByTestId('approval-post-s1')
    await edit('Small tweak')
    expect(await screen.findByText('Changes saved.')).toBeInTheDocument()
    expect(screen.queryByText(/schedule was removed/)).not.toBeInTheDocument()
    expect(row('s1').status).toBe('scheduled')
    await waitFor(() => expect(screen.getByTestId('views-scheduled')).toHaveTextContent('s1'))
  })

  it('a server refusal (the scheduler already claimed it) is shown verbatim and nothing moves', async () => {
    seed([scheduledRow()])
    api.updateSocialPublication.mockRejectedValue(apiError('A publishing publication can no longer be edited.', { status: 409, code: 'NOT_EDITABLE' }))
    renderWithClient(<ContentApprovalsPage />)
    await screen.findByTestId('approval-post-s1')
    await edit('Too late')
    expect((await screen.findAllByText(/can no longer be edited/)).length).toBeGreaterThan(0)
    expect(row('s1').status).toBe('scheduled')
    expect(screen.queryByText(/schedule was removed/)).not.toBeInTheDocument()
  })

  it('a repeated Save click sends ONE request', async () => {
    seed([scheduledRow()])
    let resolve
    api.updateSocialPublication.mockReturnValue(new Promise((r) => { resolve = r }))
    renderWithClient(<ContentApprovalsPage />)
    await screen.findByTestId('approval-post-s1')
    fireEvent.change(await screen.findByRole('textbox', { name: 'Caption' }), { target: { value: 'Edited caption' } })
    const save = screen.getByRole('button', { name: 'Save changes' })
    act(() => { save.click(); save.click(); save.click() })
    await waitFor(() => expect(api.updateSocialPublication).toHaveBeenCalledTimes(1))
    await act(async () => { resolve(serverClearsSchedule('s1', { content: 'Edited caption' })) })
    expect(api.updateSocialPublication).toHaveBeenCalledTimes(1)
  })
})
