import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { screen, waitFor, fireEvent, within } from '@testing-library/react'
import {
  renderWithClient, publication, managedPublication, approvalBlock, installPublicationsApi, statusResponse, ACTIVE_FACEBOOK, ACTIVE_INSTAGRAM, apiError,
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

let searchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParams,
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/app/social-media/content-approvals',
}))
let project = { _id: 'proj-1', project_name: 'Acme' }
vi.mock('@/contexts/ProjectContext', () => ({
  useProject: () => ({ activeProject: project, activeProjectId: project ? project._id : null, projects: project ? [project] : [], setActiveProject: vi.fn() }),
}))
vi.mock('next/link', async () => (await import('@/test-utils/socialMediaAI')).nextLinkMock())

import ContentApprovalsPage from './page'

let store

beforeEach(() => {
  // mockReset (not just clear): a never-resolving mock from one test must not leak into the next
  Object.values(api).forEach((fn) => fn.mockReset())
  searchParams = new URLSearchParams()
  project = { _id: 'proj-1', project_name: 'Acme' }
  api.getSocialAccountsStatus.mockResolvedValue(statusResponse({ facebook: ACTIVE_FACEBOOK, instagram: ACTIVE_INSTAGRAM }))
  api.getSocialApprovalSettings.mockResolvedValue({ success: true, data: { settings: { contentApprovalRequired: true, designApprovalRequired: true } } })
})

const seed = (rows) => { store = installPublicationsApi(api, rows); return store }
const renderPage = () => renderWithClient(<ContentApprovalsPage />)
const tab = (name) => screen.getByRole('button', { name: new RegExp(`^${name} \\(`) })
const item = (id) => screen.getByTestId(`approval-post-${id}`)
const row = (id) => store.rows.find((r) => r.id === id)
const ok = (id) => ({ success: true, data: { publication: row(id) } })

/**
 * Server-side state change: the stored row is REPLACED (never mutated in place — React Query's
 * structural sharing would otherwise treat the refetch as "no change"), so the next list fetch shows it.
 */
function setRow(id, patch) {
  store.rows = store.rows.map((r) => (r.id === id ? { ...r, ...patch } : r))
  return ok(id)
}

/** Makes a backend action move the stored row to a new approval block. */
function moves(fn, id, state, approvalOverrides = {}) {
  fn.mockImplementation(async () => {
    const r = row(id)
    return setRow(id, { approval: approvalBlock(state, { ...r.approval, ...approvalOverrides, state, stage: state, publishable: state === 'design_approved' }, r.status) })
  })
}

describe('Content Approvals — real workflow data', () => {
  it('NO PROJECT: asks for a project and calls nothing', () => {
    project = null
    renderPage()
    expect(screen.getByTestId('no-project')).toBeInTheDocument()
    expect(api.getSocialPublications).not.toHaveBeenCalled()
  })

  it('LOADING: skeleton rows and unknown tab counts (not zero) until the backend answers', async () => {
    api.getSocialPublications.mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(await screen.findByTestId('posts-loading')).toBeInTheDocument()
    expect(tab('Content review')).toHaveTextContent('Content review (–)')
  })

  it('ERROR: shows the failure with a retry (no sample posts as a fallback)', async () => {
    api.getSocialPublications.mockRejectedValue(apiError('Failed to load publications', { status: 500 }))
    renderPage()
    expect(await screen.findByText('Failed to load publications')).toBeInTheDocument()
    expect(screen.queryByText('Website tips')).not.toBeInTheDocument()
  })

  it('lists REAL posts per tab with counts computed from them — no dummy approval posts', async () => {
    seed([
      managedPublication('content_review', { id: 'c1', content: 'Content one' }),
      managedPublication('content_review', { id: 'c2', content: 'Content two' }, { needsChanges: true, changesRequested: { stage: 'content', reason: 'Shorter', at: '2026-10-01T11:00:00.000Z', by: 'u', byName: 'Sam Lee', forVersion: 1 } }),
      managedPublication('design_review', { id: 'd1', content: 'Design one' }),
      managedPublication('content_approved', { id: 'a1', content: 'Approved content' }),
      managedPublication('design_approved', { id: 'a2', content: 'Fully approved' }),
      publication({ id: 'u1', status: 'draft', scheduledAt: null, content: 'Plain draft' }),
      managedPublication('design_approved', { id: 'gone', status: 'published', content: 'Already published' }),
    ])
    renderPage()
    await waitFor(() => expect(tab('Content review')).toHaveTextContent('Content review (2)'))
    expect(tab('Design review')).toHaveTextContent('Design review (1)')
    expect(tab('Needs changes')).toHaveTextContent('Needs changes (1)')
    expect(tab('Approved')).toHaveTextContent('Approved (2)')
    expect(tab('Drafts')).toHaveTextContent('Drafts (1)')
    expect(screen.queryByText('Website tips')).not.toBeInTheDocument()
    expect(item('c1')).toBeInTheDocument()
    expect(item('c2')).toBeInTheDocument()
    expect(screen.queryByTestId('approval-post-gone')).not.toBeInTheDocument() // published posts are not reviewable

    fireEvent.click(tab('Drafts'))
    expect(item('u1')).toBeInTheDocument()
    fireEvent.click(tab('Design review'))
    expect(item('d1')).toBeInTheDocument()
  })

  it('the tab can be chosen by URL (the Overview tiles link here)', async () => {
    searchParams = new URLSearchParams('tab=design-review')
    seed([managedPublication('content_review', { id: 'c1' }), managedPublication('design_review', { id: 'd1', content: 'Design post' })])
    renderPage()
    expect(await screen.findByTestId('approval-post-d1')).toBeInTheDocument()
    expect(screen.queryByTestId('approval-post-c1')).not.toBeInTheDocument()
  })

  it('EMPTY tab: an honest empty state', async () => {
    seed([])
    renderPage()
    expect(await screen.findByTestId('approvals-empty')).toHaveTextContent('No content waiting for review')
    expect(tab('Content review')).toHaveTextContent('Content review (0)')
  })

  it('requests only approval-relevant lists, scoped to the active project', async () => {
    seed([])
    renderPage()
    await waitFor(() => expect(store.calls.length).toBeGreaterThanOrEqual(2))
    expect(store.calls.every((c) => c.projectId === 'proj-1')).toBe(true)
    expect(store.calls.some((c) => c.filters.approval === 'managed')).toBe(true)
    expect(store.calls.some((c) => c.filters.approval === 'unmanaged' && c.filters.status === 'draft')).toBe(true)
  })
})

describe('Content Approvals — content review', () => {
  it('APPROVE content sends the version the reviewer saw, then the post leaves Content review (from the refetched backend state)', async () => {
    seed([managedPublication('content_review', { id: 'c1', content: 'Review me' }, { contentVersion: 3 })])
    moves(api.approveSocialContent, 'c1', 'content_approved', { contentVersion: 3 })
    renderPage()
    await screen.findByTestId('approval-post-c1')
    fireEvent.click(screen.getByTestId('action-approve-content'))
    await waitFor(() => expect(api.approveSocialContent).toHaveBeenCalledWith('proj-1', 'c1', 3))
    await waitFor(() => expect(tab('Content review')).toHaveTextContent('Content review (0)'))
    expect(tab('Approved')).toHaveTextContent('Approved (1)')
    expect(await screen.findByText('Content approved.')).toBeInTheDocument()
  })

  it('REQUEST CHANGES needs a reason, persists it via the backend, and the post stays in review showing the reason', async () => {
    seed([managedPublication('content_review', { id: 'c1', content: 'Review me' })])
    api.requestSocialContentChanges.mockImplementation(async (pid, id, version, reason) => setRow(id, {
      approval: approvalBlock('content_review', { needsChanges: true, changesRequested: { stage: 'content', reason, at: '2026-10-01T12:00:00.000Z', by: 'u', byName: 'Sam Lee', forVersion: version } }),
    }))
    renderPage()
    await screen.findByTestId('approval-post-c1')
    fireEvent.click(screen.getByTestId('action-request-content-changes'))

    const dialog = await screen.findByRole('dialog')
    const submit = within(dialog).getByRole('button', { name: 'Request changes' })
    expect(submit).toBeDisabled() // reason is required
    fireEvent.change(within(dialog).getByLabelText('Reason'), { target: { value: '   ' } })
    expect(submit).toBeDisabled()
    fireEvent.change(within(dialog).getByLabelText('Reason'), { target: { value: '  Tone is too casual  ' } })
    fireEvent.click(submit)

    await waitFor(() => expect(api.requestSocialContentChanges).toHaveBeenCalledWith('proj-1', 'c1', 1, 'Tone is too casual'))
    const notice = await screen.findByTestId('changes-requested')
    expect(notice).toHaveTextContent('Tone is too casual')
    expect(notice).toHaveTextContent('Sam Lee')
    expect(tab('Content review')).toHaveTextContent('Content review (1)') // same review state
    expect(tab('Needs changes')).toHaveTextContent('Needs changes (1)')
  })

  it('a refusal (stale version) shows the backend\'s message and changes nothing locally', async () => {
    seed([managedPublication('content_review', { id: 'c1' })])
    api.approveSocialContent.mockRejectedValue(apiError('This content was changed since you reviewed it. Reload and review the latest version.', { status: 409, code: 'VERSION_MISMATCH' }))
    renderPage()
    await screen.findByTestId('approval-post-c1')
    fireEvent.click(screen.getByTestId('action-approve-content'))
    expect((await screen.findAllByText(/was changed since you reviewed it/)).length).toBeGreaterThan(0)
    expect(tab('Content review')).toHaveTextContent('Content review (1)')
    expect(screen.getByTestId('approval-post-c1')).toBeInTheDocument()
  })

  it('an error while requesting changes stays inside the dialog (and the dialog stays open)', async () => {
    seed([managedPublication('content_review', { id: 'c1' })])
    api.requestSocialContentChanges.mockRejectedValue(apiError('That publication was not found.', { status: 404, code: 'NOT_FOUND' }))
    renderPage()
    await screen.findByTestId('approval-post-c1')
    fireEvent.click(screen.getByTestId('action-request-content-changes'))
    const dialog = await screen.findByRole('dialog')
    fireEvent.change(within(dialog).getByLabelText('Reason'), { target: { value: 'x' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Request changes' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('That publication was not found.')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('unsaved caption edits block approval until saved; saving sends the new caption through the existing edit endpoint', async () => {
    seed([managedPublication('content_review', { id: 'c1', content: 'Old caption' })])
    api.updateSocialPublication.mockImplementation(async (pid, id, changes) => setRow(id, { content: changes.content, approval: approvalBlock('content_review', { contentVersion: 2 }) }))
    renderPage()
    await screen.findByTestId('approval-post-c1')
    const caption = screen.getByLabelText('Caption')
    expect(caption).toHaveValue('Old caption')
    fireEvent.change(caption, { target: { value: 'New caption' } })
    expect(screen.getByTestId('action-approve-content')).toBeDisabled()
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(api.updateSocialPublication).toHaveBeenCalledWith('proj-1', 'c1', { content: 'New caption' }))
    await waitFor(() => expect(screen.getByTestId('action-approve-content')).not.toBeDisabled())
    expect(screen.getByLabelText('Caption')).toHaveValue('New caption')
    expect(screen.getByText('Version 1')).toBeInTheDocument() // design version unchanged
  })

  it('editing APPROVED content tells the user the approval was withdrawn (the backend decided it)', async () => {
    searchParams = new URLSearchParams('tab=approved')
    seed([managedPublication('content_approved', { id: 'a1', content: 'Approved text' })])
    api.updateSocialPublication.mockImplementation(async (pid, id, changes) => setRow(id, { content: changes.content, approval: approvalBlock('content_review', { contentVersion: 2 }) }))
    renderPage()
    await screen.findByTestId('approval-post-a1')
    expect(screen.getByText(/Editing approved content withdraws its approval/)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Caption'), { target: { value: 'Changed after approval' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText(/withdrew an earlier approval/)).toBeInTheDocument()
    await waitFor(() => expect(tab('Content review')).toHaveTextContent('Content review (1)'))
    expect(tab('Approved')).toHaveTextContent('Approved (0)')
  })
})

describe('Content Approvals — drafts and design', () => {
  it('a plain draft can be SUBMITTED for review; it then appears under Content review', async () => {
    searchParams = new URLSearchParams('tab=drafts')
    seed([publication({ id: 'u1', status: 'draft', scheduledAt: null, content: 'Draft copy' })])
    moves(api.submitSocialContentForReview, 'u1', 'content_review')
    renderPage()
    await screen.findByTestId('approval-post-u1')
    expect(screen.getByTestId('approval-badge')).toHaveTextContent('Not submitted')
    fireEvent.click(screen.getByTestId('action-submit-content'))
    await waitFor(() => expect(api.submitSocialContentForReview).toHaveBeenCalledWith('proj-1', 'u1'))
    await waitFor(() => expect(tab('Content review')).toHaveTextContent('Content review (1)'))
    expect(tab('Drafts')).toHaveTextContent('Drafts (0)')
  })

  it('approved content -> SUBMIT DESIGN; design review -> APPROVE / REQUEST CHANGES with the design version', async () => {
    searchParams = new URLSearchParams('tab=approved')
    seed([managedPublication('content_approved', { id: 'a1', media: [{ url: 'https://cdn.example.com/a.jpg', type: 'image' }] })])
    moves(api.submitSocialDesignForReview, 'a1', 'design_review', { designVersion: 2 })
    renderPage()
    await screen.findByTestId('approval-post-a1')
    expect(screen.getByTestId('design-status')).toHaveTextContent('Not submitted yet')
    fireEvent.click(screen.getByTestId('action-submit-design'))
    await waitFor(() => expect(api.submitSocialDesignForReview).toHaveBeenCalledWith('proj-1', 'a1'))
    await waitFor(() => expect(tab('Design review')).toHaveTextContent('Design review (1)'))

    fireEvent.click(tab('Design review'))
    await screen.findByTestId('approval-post-a1')
    moves(api.approveSocialDesign, 'a1', 'design_approved', { designVersion: 2 })
    fireEvent.click(screen.getByTestId('action-approve-design'))
    await waitFor(() => expect(api.approveSocialDesign).toHaveBeenCalledWith('proj-1', 'a1', 2))
    await waitFor(() => expect(tab('Design review')).toHaveTextContent('Design review (0)'))
    expect(tab('Approved')).toHaveTextContent('Approved (1)')
  })

  it('design REQUEST CHANGES requires a reason and sends the design version', async () => {
    searchParams = new URLSearchParams('tab=design-review')
    seed([managedPublication('design_review', { id: 'd1' }, { designVersion: 4 })])
    api.requestSocialDesignChanges.mockImplementation(async (pid, id, version, reason) => setRow(id, {
      approval: approvalBlock('design_review', { designVersion: 4, needsChanges: true, changesRequested: { stage: 'design', reason, at: '2026-10-01T12:00:00.000Z', byName: 'Sam Lee', forVersion: version } }),
    }))
    renderPage()
    await screen.findByTestId('approval-post-d1')
    fireEvent.click(screen.getByTestId('action-request-design-changes'))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: 'Request design changes' })).toBeInTheDocument()
    fireEvent.change(within(dialog).getByLabelText('Reason'), { target: { value: 'Logo is cropped' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Request changes' }))
    await waitFor(() => expect(api.requestSocialDesignChanges).toHaveBeenCalledWith('proj-1', 'd1', 4, 'Logo is cropped'))
    expect(await screen.findByTestId('changes-requested')).toHaveTextContent('Logo is cropped')
    expect(tab('Design review')).toHaveTextContent('Design review (1)')
  })

  it('REPLACE DESIGN uploads through the existing upload endpoint, then edits the post media (the backend versions it)', async () => {
    searchParams = new URLSearchParams('tab=design-review')
    seed([managedPublication('design_review', { id: 'd1' })])
    api.uploadSocialMedia.mockResolvedValue({ success: true, data: { url: 'https://api.example.com/storage/social_media/proj-1/new.jpg', type: 'image' } })
    api.updateSocialPublication.mockImplementation(async (pid, id, changes) => setRow(id, { media: changes.media, approval: approvalBlock('design_review', { designVersion: 2 }) }))
    renderPage()
    await screen.findByTestId('approval-post-d1')
    const file = new File(['x'], 'new.jpg', { type: 'image/jpeg' })
    fireEvent.change(screen.getByTestId('design-file-input'), { target: { files: [file] } })
    await waitFor(() => expect(api.uploadSocialMedia).toHaveBeenCalledWith('proj-1', file, undefined))
    await waitFor(() => expect(api.updateSocialPublication).toHaveBeenCalledWith('proj-1', 'd1', { media: [{ url: 'https://api.example.com/storage/social_media/proj-1/new.jpg', type: 'image' }] }))
    // the refetched post carries designVersion 2 (shown in the design card and the brief)
    expect(await screen.findByText('Version 2')).toBeInTheDocument()
  })

  it('a failed upload is shown and the post is not edited', async () => {
    searchParams = new URLSearchParams('tab=design-review')
    seed([managedPublication('design_review', { id: 'd1' })])
    api.uploadSocialMedia.mockRejectedValue(Object.assign(new Error('The file is too large.'), { code: 'MEDIA_TOO_LARGE' }))
    renderPage()
    await screen.findByTestId('approval-post-d1')
    fireEvent.change(screen.getByTestId('design-file-input'), { target: { files: [new File(['x'], 'big.jpg', { type: 'image/jpeg' })] } })
    expect(await screen.findByText('The file is too large.')).toBeInTheDocument()
    expect(api.updateSocialPublication).not.toHaveBeenCalled()
  })

  it('there is no fake AI: no regenerate, topic, CTA, hashtags, goal or voice controls', async () => {
    seed([managedPublication('content_review', { id: 'c1' })])
    renderPage()
    await screen.findByTestId('approval-post-c1')
    for (const gone of [/regenerate/i, /^topic$/i, /^cta$/i, /^hashtags$/i, /^goal$/i, /^voice$/i]) expect(screen.queryByText(gone)).not.toBeInTheDocument()
  })
})

describe('Content Approvals — ready to schedule', () => {
  it('a fully approved draft offers Schedule; confirming calls the real schedule endpoint and the post becomes scheduled', async () => {
    searchParams = new URLSearchParams('tab=approved')
    seed([managedPublication('design_approved', { id: 'r1', content: 'Ready post' })])
    api.scheduleSocialPublication.mockImplementation(async (pid, id, scheduledAt, timezone) => setRow(id, {
      status: 'scheduled', scheduledAt, timezone, approval: approvalBlock('design_approved', {}, 'scheduled'),
    }))
    renderPage()
    await screen.findByTestId('approval-post-r1')
    expect(screen.getByTestId('approval-badge')).toHaveTextContent('Approved · ready to schedule')
    fireEvent.click(screen.getByTestId('action-schedule'))

    fireEvent.change(await screen.findByLabelText('Date'), { target: { value: '2099-03-10' } })
    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '10:00' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm schedule' }))
    await waitFor(() => expect(api.scheduleSocialPublication).toHaveBeenCalledWith('proj-1', 'r1', expect.stringMatching(/^2099-03-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/), expect.any(String)))
    expect(await screen.findByText('Post scheduled.')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId('approval-badge')).toHaveTextContent('Approved · scheduled'))
    expect(screen.queryByTestId('action-schedule')).not.toBeInTheDocument()
  })

  it('the backend can still refuse scheduling (APPROVAL_REQUIRED) — its message is shown in the panel', async () => {
    searchParams = new URLSearchParams('tab=approved')
    seed([managedPublication('design_approved', { id: 'r1' })])
    api.scheduleSocialPublication.mockRejectedValue(apiError('This post\'s content has not been approved yet.', { status: 409, code: 'APPROVAL_REQUIRED' }))
    renderPage()
    await screen.findByTestId('approval-post-r1')
    fireEvent.click(screen.getByTestId('action-schedule'))
    fireEvent.change(await screen.findByLabelText('Date'), { target: { value: '2099-03-10' } })
    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '10:00' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm schedule' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('has not been approved yet')
  })

  it('a post that is NOT fully approved never offers scheduling', async () => {
    searchParams = new URLSearchParams('tab=approved')
    seed([managedPublication('content_approved', { id: 'a1' })])
    renderPage()
    await screen.findByTestId('approval-post-a1')
    expect(screen.queryByTestId('action-schedule')).not.toBeInTheDocument()
  })
})

describe('Content Approvals — project approval settings', () => {
  it('shows the backend\'s settings (e.g. content approval turned off), never a hardcoded rule', async () => {
    api.getSocialApprovalSettings.mockResolvedValue({ success: true, data: { settings: { contentApprovalRequired: false, designApprovalRequired: true } } })
    seed([managedPublication('content_review', { id: 'c1' })])
    renderPage()
    await screen.findByTestId('approval-post-c1')
    expect(await screen.findByTestId('approval-setting-note')).toHaveTextContent('Content approval is turned off for this project')
  })
})
