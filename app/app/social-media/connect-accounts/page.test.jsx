import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { screen, waitFor, fireEvent, within } from '@testing-library/react'
import {
  renderWithClient, statusResponse, ACTIVE_FACEBOOK, ACTIVE_INSTAGRAM, EXPIRED, NOT_CONNECTED_FB, NOT_CONNECTED_IG,
  apiError, businessProfileData, fact,
} from '@/test-utils/socialMediaAI'

const api = vi.hoisted(() => ({
  getSocialAccountsStatus: vi.fn(),
  getMetaConnectUrl: vi.fn(),
  verifySocialAccounts: vi.fn(),
  disconnectSocialAccount: vi.fn(),
  retryMetaInstagramDiscovery: vi.fn(),
  getSocialBusinessProfile: vi.fn(),
  updateSocialBusinessProfile: vi.fn(),
}))
vi.mock('@/lib/apiService', () => ({ default: api }))

let searchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParams,
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/app/social-media/connect-accounts',
}))

let project = { _id: 'proj-1', project_name: 'Acme', main_url: 'https://www.acme-agency.com/', location: 'Pune' }
vi.mock('@/contexts/ProjectContext', () => ({
  useProject: () => ({ activeProject: project, activeProjectId: project ? project._id : null, projects: project ? [project] : [], setActiveProject: vi.fn() }),
}))

vi.mock('next/link', async () => (await import('@/test-utils/socialMediaAI')).nextLinkMock())
vi.mock('@/components/ui/dropdown-menu', async () => (await import('@/test-utils/socialMediaAI')).dropdownMenuMock())
// The Page picker has its own tests (components/dashboard/social/FacebookPageSelectorDialog.test.jsx); a marker shows when/how this page opens it.
vi.mock('@/components/dashboard/social/FacebookPageSelectorDialog', () => ({
  default: (props) => React.createElement('div', { 'data-testid': 'page-selector', 'data-open': String(!!props.open), 'data-mode': props.mode, 'data-project': props.projectId }),
}))

import ConnectAccountsPage from './page'

let assign
beforeEach(() => {
  vi.clearAllMocks()
  searchParams = new URLSearchParams()
  project = { _id: 'proj-1', project_name: 'Acme', main_url: 'https://www.acme-agency.com/', location: 'Pune' }
  api.getSocialBusinessProfile.mockResolvedValue(businessProfileData({ google: false }))
  assign = vi.fn()
  Object.defineProperty(window, 'location', { configurable: true, writable: true, value: { ...window.location, assign, href: 'http://localhost/' } })
})
afterEach(() => { vi.useRealTimers() })

const setStatus = (facebook, instagram) => api.getSocialAccountsStatus.mockResolvedValue(statusResponse({ facebook, instagram }))
const renderPage = () => renderWithClient(<ConnectAccountsPage />)
const fbCard = () => screen.getByTestId('facebook-account-card')
const igCard = () => screen.getByTestId('instagram-account-card')

describe('Connect Accounts — states come from the real backend status', () => {
  it('LOADING: skeletons and a "Checking…" badge while the status request is in flight (no connected/disconnected flash)', async () => {
    api.getSocialAccountsStatus.mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(fbCard()).toHaveAttribute('data-state', 'loading')
    expect(igCard()).toHaveAttribute('data-state', 'loading')
    expect(within(fbCard()).getByLabelText('Loading account')).toBeInTheDocument()
    expect(within(fbCard()).getByTestId('facebook-status-badge')).toHaveTextContent('Checking…')
    expect(screen.queryByText('Connect Facebook')).not.toBeInTheDocument()
  })

  it('NOT CONNECTED: Facebook offers Connect; Instagram offers Connect Instagram (OAuth) because Facebook is not connected', async () => {
    setStatus(NOT_CONNECTED_FB, NOT_CONNECTED_IG)
    renderPage()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'not_connected'))
    expect(within(fbCard()).getByTestId('facebook-status-badge')).toHaveTextContent('Not connected')
    expect(within(fbCard()).getByRole('button', { name: /Connect Facebook/ })).toBeEnabled()
    expect(within(igCard()).getByRole('button', { name: /Connect Instagram/ })).toBeEnabled()
  })

  it('CONNECTED: real name, profile image, category, last-verified time and the granted publishing permission', async () => {
    setStatus(ACTIVE_FACEBOOK, ACTIVE_INSTAGRAM)
    renderPage()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'connected'))
    expect(within(fbCard()).getByText('Acme Studio')).toBeInTheDocument()
    expect(within(fbCard()).getByText(/Marketing agency/)).toBeInTheDocument()
    expect(within(fbCard()).getByText(/Verified/)).toBeInTheDocument()
    expect(within(fbCard()).getByTestId('permissions-ok')).toBeInTheDocument()
    expect(fbCard().querySelector('img')).toHaveAttribute('src', 'https://cdn.example.com/fb.jpg')
    expect(within(igCard()).getByText('acme_studio')).toBeInTheDocument()
    expect(within(igCard()).getByText(/@acme_studio/)).toBeInTheDocument()
    expect(within(igCard()).getByText(/Business account/)).toBeInTheDocument()
    expect(within(igCard()).getByText('Not verified yet', { exact: false })).toBeInTheDocument()
  })

  it('never renders anything token-like: the status payload has none and the page shows none', async () => {
    setStatus(ACTIVE_FACEBOOK, ACTIVE_INSTAGRAM)
    const { container } = renderPage()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'connected'))
    expect(container.innerHTML).not.toMatch(/access_?token|EAA[A-Za-z0-9]{10,}|client_secret/i)
  })

  it('CONNECTED but missing publishing permission is NOT shown as healthy', async () => {
    setStatus({ ...ACTIVE_FACEBOOK, publishingReady: false }, NOT_CONNECTED_IG)
    renderPage()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'connected'))
    expect(within(fbCard()).getByTestId('facebook-status-badge')).toHaveTextContent('Permission needed')
    expect(within(fbCard()).getByTestId('permissions-missing')).toBeInTheDocument()
    expect(within(fbCard()).queryByTestId('permissions-ok')).not.toBeInTheDocument()
  })

  it('EXPIRED: "Reconnect required" state with a Reconnect action (not "Connected")', async () => {
    setStatus(EXPIRED('Acme Studio'), { connected: false, status: 'expired', requiresReconnect: true, accountName: 'acme_ig' })
    renderPage()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'expired'))
    expect(within(fbCard()).getByTestId('facebook-status-badge')).toHaveTextContent('Reconnect required')
    expect(within(fbCard()).getByText('Acme Studio')).toBeInTheDocument()
    expect(within(fbCard()).getByTestId('reconnect-panel')).toBeInTheDocument()
    expect(igCard()).toHaveAttribute('data-state', 'expired')
    expect(screen.queryByText('Connected')).not.toBeInTheDocument()
  })

  it('API ERROR: an error body with Try again that refetches (and nothing is shown as disconnected)', async () => {
    api.getSocialAccountsStatus.mockRejectedValueOnce(apiError('Server error', { status: 500 }))
    renderPage()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'error'))
    expect(within(fbCard()).getByRole('alert')).toHaveTextContent("Couldn't load this connection")
    expect(within(fbCard()).queryByRole('button', { name: /Connect Facebook/ })).not.toBeInTheDocument()

    setStatus(ACTIVE_FACEBOOK, NOT_CONNECTED_IG)
    fireEvent.click(within(fbCard()).getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'connected'))
    expect(api.getSocialAccountsStatus).toHaveBeenCalledTimes(2)
  })
})

describe('Connect Accounts — OAuth', () => {
  it('Connect asks the backend for the OAuth URL (returnTo social-media) and sends the browser to Meta', async () => {
    setStatus(NOT_CONNECTED_FB, NOT_CONNECTED_IG)
    api.getMetaConnectUrl.mockResolvedValue({ success: true, data: { url: 'https://www.facebook.com/v21.0/dialog/oauth?state=abc' } })
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: /Connect Facebook/ }))
    await waitFor(() => expect(assign).toHaveBeenCalledWith('https://www.facebook.com/v21.0/dialog/oauth?state=abc'))
    expect(api.getMetaConnectUrl).toHaveBeenCalledWith('proj-1', 'social-media', false)
  })

  it('Reconnect (expired) starts the OAuth flow with reconnect=true', async () => {
    setStatus(EXPIRED(), NOT_CONNECTED_IG)
    api.getMetaConnectUrl.mockResolvedValue({ success: true, data: { url: 'https://www.facebook.com/dialog/oauth?x=1' } })
    renderPage()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'expired'))
    fireEvent.click(within(fbCard()).getByRole('button', { name: 'Reconnect Facebook' }))
    await waitFor(() => expect(assign).toHaveBeenCalled())
    expect(api.getMetaConnectUrl).toHaveBeenCalledWith('proj-1', 'social-media', true)
  })

  it('a failure to start OAuth is shown, and the page does not navigate', async () => {
    setStatus(NOT_CONNECTED_FB, NOT_CONNECTED_IG)
    api.getMetaConnectUrl.mockRejectedValue(apiError('Meta connection is not configured on this server', { status: 500 }))
    renderPage()
    fireEvent.click(await screen.findByRole('button', { name: /Connect Facebook/ }))
    expect(await screen.findByText('Meta connection is not configured on this server')).toBeInTheDocument()
    expect(assign).not.toHaveBeenCalled()
  })

  it('SUCCESS return (?meta_connected=1): opens the Page picker in connect mode — it does not claim "connected" itself', async () => {
    searchParams = new URLSearchParams('meta_connected=1')
    setStatus(NOT_CONNECTED_FB, NOT_CONNECTED_IG)
    renderPage()
    await waitFor(() => expect(screen.getByTestId('page-selector')).toHaveAttribute('data-open', 'true'))
    expect(screen.getByTestId('page-selector')).toHaveAttribute('data-mode', 'connect')
    expect(screen.getByTestId('page-selector')).toHaveAttribute('data-project', 'proj-1')
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'not_connected'))
  })

  it.each([
    ['access_denied', /cancelled/i],
    ['expired_or_invalid_request', /expired/i],
    ['invalid_request', /invalid/i],
    ['connection_failed', /failed/i],
    ['something_new', /Failed to connect/i],
  ])('FAILURE return (?meta_error=%s) shows a clear message and does not open the picker', async (code, pattern) => {
    searchParams = new URLSearchParams(`meta_error=${code}`)
    setStatus(NOT_CONNECTED_FB, NOT_CONNECTED_IG)
    renderPage()
    expect(await screen.findByText(pattern)).toBeInTheDocument()
    expect(screen.getByTestId('page-selector')).toHaveAttribute('data-open', 'false')
  })
})

describe('Connect Accounts — verify', () => {
  it('Verify calls POST /social/accounts/verify once, shows the result, and refetches the status', async () => {
    setStatus(ACTIVE_FACEBOOK, NOT_CONNECTED_IG)
    api.verifySocialAccounts.mockResolvedValue({ success: true, data: { accounts: [{ platform: 'facebook', status: 'active', valid: true, requiresReconnect: false }] } })
    renderPage()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'connected'))
    expect(api.verifySocialAccounts).not.toHaveBeenCalled() // never automatic
    fireEvent.click(within(fbCard()).getByRole('button', { name: 'Verify connection' }))
    expect(await screen.findByText('Connection verified with Meta.')).toBeInTheDocument()
    expect(api.verifySocialAccounts).toHaveBeenCalledTimes(1)
    expect(api.verifySocialAccounts).toHaveBeenCalledWith('proj-1')
    await waitFor(() => expect(api.getSocialAccountsStatus).toHaveBeenCalledTimes(2))
  })

  it('a verification that finds the token dead flips the card to "Reconnect required" from the refetched status', async () => {
    setStatus(ACTIVE_FACEBOOK, NOT_CONNECTED_IG)
    renderPage()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'connected'))
    setStatus(EXPIRED(), NOT_CONNECTED_IG)
    api.verifySocialAccounts.mockResolvedValue({ success: true, data: { accounts: [{ platform: 'facebook', status: 'expired', valid: false, requiresReconnect: true }] } })
    fireEvent.click(within(fbCard()).getByRole('button', { name: 'Verify connection' }))
    expect(await screen.findByText('A connection has expired — reconnect required.')).toBeInTheDocument()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'expired'))
  })

  it('shows an error (and still refetches) when verification fails', async () => {
    setStatus(ACTIVE_FACEBOOK, NOT_CONNECTED_IG)
    api.verifySocialAccounts.mockRejectedValue(apiError('Failed to verify social connections', { status: 500 }))
    renderPage()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'connected'))
    fireEvent.click(within(fbCard()).getByRole('button', { name: 'Verify connection' }))
    expect(await screen.findByText('Failed to verify social connections')).toBeInTheDocument()
    await waitFor(() => expect(api.getSocialAccountsStatus).toHaveBeenCalledTimes(2))
  })

  it('"could not verify" (Meta unreachable) is not reported as success', async () => {
    setStatus(ACTIVE_FACEBOOK, NOT_CONNECTED_IG)
    api.verifySocialAccounts.mockResolvedValue({ success: true, data: { accounts: [{ platform: 'facebook', status: 'active', valid: null, requiresReconnect: false }] } })
    renderPage()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'connected'))
    fireEvent.click(within(fbCard()).getByRole('button', { name: 'Verify connection' }))
    expect(await screen.findByText(/Could not reach Meta to verify/)).toBeInTheDocument()
    expect(screen.queryByText('Connection verified with Meta.')).not.toBeInTheDocument()
  })
})

describe('Connect Accounts — disconnect', () => {
  it('asks for confirmation, calls DELETE for the platform, and the card changes only after the status is REFETCHED', async () => {
    setStatus(ACTIVE_FACEBOOK, ACTIVE_INSTAGRAM)
    api.disconnectSocialAccount.mockResolvedValue({ success: true, data: { platform: 'facebook', connected: false } })
    renderPage()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'connected'))

    fireEvent.click(within(fbCard()).getByRole('button', { name: 'Disconnect' }))
    expect(await screen.findByText('Disconnect Facebook?')).toBeInTheDocument()
    expect(api.disconnectSocialAccount).not.toHaveBeenCalled() // not yet: needs confirmation
    expect(fbCard()).toHaveAttribute('data-state', 'connected')

    setStatus(NOT_CONNECTED_FB, NOT_CONNECTED_IG) // what the database says after the disconnect
    fireEvent.click(screen.getAllByRole('button', { name: 'Disconnect' }).find((b) => b.closest('[role="dialog"]')))
    await waitFor(() => expect(api.disconnectSocialAccount).toHaveBeenCalledWith('proj-1', 'facebook'))
    expect(await screen.findByText('Facebook disconnected.')).toBeInTheDocument()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'not_connected'))
    expect(igCard()).toHaveAttribute('data-state', 'not_connected')
  })

  it('a failed disconnect keeps the connection and shows the error inside the dialog', async () => {
    setStatus(ACTIVE_FACEBOOK, NOT_CONNECTED_IG)
    api.disconnectSocialAccount.mockRejectedValue(apiError('Failed to disconnect this account', { code: 'SOCIAL_DISCONNECT_FAILED', status: 500 }))
    renderPage()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'connected'))
    fireEvent.click(within(fbCard()).getByRole('button', { name: 'Disconnect' }))
    await screen.findByText('Disconnect Facebook?')
    fireEvent.click(screen.getAllByRole('button', { name: 'Disconnect' }).find((b) => b.closest('[role="dialog"]')))
    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to disconnect this account')
    expect(fbCard()).toHaveAttribute('data-state', 'connected')
  })

  it('an already-disconnected account (stale UI) resolves cleanly and the page refetches the truth', async () => {
    setStatus(ACTIVE_FACEBOOK, NOT_CONNECTED_IG)
    api.disconnectSocialAccount.mockRejectedValue(apiError('No active connection to disconnect', { code: 'SOCIAL_ACCOUNT_NOT_FOUND', status: 404 }))
    renderPage()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'connected'))
    setStatus(NOT_CONNECTED_FB, NOT_CONNECTED_IG)
    fireEvent.click(within(fbCard()).getByRole('button', { name: 'Disconnect' }))
    await screen.findByText('Disconnect Facebook?')
    fireEvent.click(screen.getAllByRole('button', { name: 'Disconnect' }).find((b) => b.closest('[role="dialog"]')))
    expect(await screen.findByText('Facebook was already disconnected.')).toBeInTheDocument()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'not_connected'))
  })

  it('cancelling the confirmation never calls the backend', async () => {
    setStatus(ACTIVE_FACEBOOK, NOT_CONNECTED_IG)
    renderPage()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'connected'))
    fireEvent.click(within(fbCard()).getByRole('button', { name: 'Disconnect' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Keep connected' }))
    expect(api.disconnectSocialAccount).not.toHaveBeenCalled()
  })
})

describe('Connect Accounts — Instagram', () => {
  it('Facebook connected but no Instagram: "Check for linked account" re-runs discovery for the active Page and explains the result', async () => {
    setStatus(ACTIVE_FACEBOOK, NOT_CONNECTED_IG)
    api.retryMetaInstagramDiscovery.mockResolvedValue({ success: true, data: { instagram: { connected: false, reason: 'NOT_CONNECTED' } } })
    renderPage()
    await waitFor(() => expect(igCard()).toHaveAttribute('data-state', 'not_connected'))
    fireEvent.click(within(igCard()).getByRole('button', { name: 'Check for linked account' }))
    await waitFor(() => expect(api.retryMetaInstagramDiscovery).toHaveBeenCalledWith('proj-1', 'pg_100'))
    expect(await within(igCard()).findByRole('status')).toHaveTextContent('No Instagram professional account is linked')
  })

  it('a discovery that finds the account connects it from the refetched status', async () => {
    setStatus(ACTIVE_FACEBOOK, NOT_CONNECTED_IG)
    api.retryMetaInstagramDiscovery.mockResolvedValue({ success: true, data: { instagram: { connected: true, accountId: 'ig_200', username: 'acme_studio' } } })
    renderPage()
    await waitFor(() => expect(igCard()).toHaveAttribute('data-state', 'not_connected'))
    setStatus(ACTIVE_FACEBOOK, ACTIVE_INSTAGRAM)
    fireEvent.click(within(igCard()).getByRole('button', { name: 'Check for linked account' }))
    expect(await screen.findByText('Instagram account connected.')).toBeInTheDocument()
    await waitFor(() => expect(igCard()).toHaveAttribute('data-state', 'connected'))
  })

  it('Facebook expired: Instagram says reconnect Facebook first (and offers it)', async () => {
    setStatus(EXPIRED(), NOT_CONNECTED_IG)
    renderPage()
    await waitFor(() => expect(igCard()).toHaveAttribute('data-state', 'not_connected'))
    expect(within(igCard()).getByText(/Reconnect your Facebook Page first/)).toBeInTheDocument()
    expect(within(igCard()).getByRole('button', { name: 'Reconnect Facebook' })).toBeEnabled()
  })
})

describe('Connect Accounts — other behavior', () => {
  it('Switch Page opens the picker in switch mode', async () => {
    setStatus(ACTIVE_FACEBOOK, NOT_CONNECTED_IG)
    renderPage()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'connected'))
    fireEvent.click(within(fbCard()).getByRole('button', { name: 'Switch Page' }))
    expect(screen.getByTestId('page-selector')).toHaveAttribute('data-open', 'true')
    expect(screen.getByTestId('page-selector')).toHaveAttribute('data-mode', 'switch')
  })

  it('is for CONNECTIONS only: no business information, brand, services, products or "how Social AI sees it" is shown here', async () => {
    setStatus(NOT_CONNECTED_FB, NOT_CONNECTED_IG)
    api.getSocialBusinessProfile.mockResolvedValue(businessProfileData({ google: true }))
    renderPage()
    await screen.findByTestId('gbp-status')
    expect(screen.getByText('Connect and manage the external accounts Odito uses.')).toBeInTheDocument()
    for (const id of ['resolved-facts', 'business-model', 'editor-overrides', 'editor-strategy', 'editor-identity', 'editor-messaging', 'editor-brand', 'brand-logo', 'brand-preview', 'services', 'product-catalog', 'fact-name', 'fact-phone', 'fact-address', 'fact-description', 'fact-category', 'fact-website', 'fact-model']) {
      expect(screen.queryByTestId(id), id).not.toBeInTheDocument()
    }
    expect(screen.queryByText(/as Social AI sees/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/What type of business/i)).not.toBeInTheDocument()
    // the only place the business name appears is the Google connection's "Location" line (which location is connected), never as a profile fact
    expect(screen.getAllByText('Acme Dental')).toHaveLength(1)
    expect(within(screen.getByTestId('gbp-location')).getByText('Acme Dental')).toBeInTheDocument()
    expect(screen.queryByText('+91 20 5550100')).not.toBeInTheDocument()
    expect(screen.queryByText('1 Main Street')).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument() // nothing editable at all
  })

  it('has no setup-progress stepper (Connect accounts / Business profile / AI strategy): the page goes straight to the accounts', async () => {
    setStatus(NOT_CONNECTED_FB, NOT_CONNECTED_IG)
    renderPage()
    await screen.findByTestId('gbp-status')
    for (const step of ['Connect accounts', 'Business profile', 'AI strategy']) expect(screen.queryByText(step)).not.toBeInTheDocument()
    const heading = screen.getByRole('heading', { level: 1, name: 'Connect your accounts' })
    expect(heading.parentElement.nextElementSibling).toBe(fbCard().parentElement) // the account cards follow the title directly
  })

  it('Google Business Profile: a connection-only card (status, location, last sync, health, manage link) that points to Business Profile for the details', async () => {
    setStatus(NOT_CONNECTED_FB, NOT_CONNECTED_IG)
    api.getSocialBusinessProfile.mockResolvedValue(businessProfileData({ google: true }))
    renderPage()
    const section = await screen.findByTestId('gbp-section')
    const card = await within(section).findByTestId('gbp-status')
    expect(within(card).getByTestId('gbp-connection-label')).toHaveTextContent('Connected')
    expect(within(card).getByTestId('gbp-sync')).toHaveTextContent(/Last synced .* · Up to date/)
    expect(within(card).getByTestId('gbp-location')).toHaveTextContent(/Location\s*Acme Dental/)
    expect(within(card).getByText('Connected as owner@example.com')).toBeInTheDocument()
    expect(within(card).getByRole('link', { name: 'Manage Google Business Profile' })).toHaveAttribute('href', '/app/google-visibility/business-profile')
    expect(within(section).getByRole('link', { name: 'Business Profile' })).toHaveAttribute('href', '/app/social-media/business-profile')
    expect(api.getSocialBusinessProfile).toHaveBeenCalledTimes(1)
  })

  it('Google Business Profile connection state uses its own colours (green / grey / amber / red), never the violet of the active sidebar item', async () => {
    const stateOf = async (data) => {
      setStatus(NOT_CONNECTED_FB, NOT_CONNECTED_IG)
      api.getSocialBusinessProfile.mockResolvedValue(data)
      const view = renderPage()
      const badge = await screen.findByTestId('gbp-connection-label')
      const result = { text: badge.textContent, cls: badge.className, dot: badge.querySelector('span').className }
      view.unmount()
      return result
    }
    const connected = await stateOf(businessProfileData({ google: true }))
    expect(connected.text).toBe('Connected')
    expect(connected.cls).toMatch(/emerald/)
    expect(connected.dot).toMatch(/bg-emerald-500/)
    const none = await stateOf(businessProfileData({ google: false }))
    expect(none.text).toBe('Not connected')
    expect(none.cls).toMatch(/slate/)
    const expired = await stateOf(businessProfileData({ google: true, googleStatus: { connected: false, connectionStatus: 'expired' } }))
    expect(expired.text).toBe('Reconnect required')
    expect(expired.cls).toMatch(/amber/)
    const revoked = await stateOf(businessProfileData({ google: false, googleStatus: { connected: false, connectionStatus: 'revoked' } }))
    expect(revoked.text).toBe('Disconnected')
    expect(revoked.cls).toMatch(/red/)
    for (const r of [connected, none, expired, revoked]) expect(r.cls + r.dot).not.toMatch(/violet|indigo|purple|blue/)
  })

  describe('Google Business Profile card — the connection state is clear at a glance', () => {
    const gbp = async (data) => {
      setStatus(NOT_CONNECTED_FB, NOT_CONNECTED_IG)
      api.getSocialBusinessProfile.mockResolvedValue(data)
      renderPage()
      return screen.findByTestId('gbp-status')
    }

    it('HEALTHY: the whole card is green-tinted with a prominent Connected pill, the real location and account, the real last sync and "Up to date", and a Manage button', async () => {
      const card = await gbp(businessProfileData({ google: true }))
      expect(card).toHaveAttribute('data-state', 'healthy')
      expect(card.className).toMatch(/border-emerald-200 bg-emerald-50/)
      const pill = within(card).getByTestId('gbp-connection-label')
      expect(pill).toHaveTextContent('Connected')
      expect(pill.className).toMatch(/bg-emerald-100/)
      expect(pill.className).toMatch(/text-sm font-semibold/)
      expect(pill.querySelector('span').className).toMatch(/bg-emerald-500/) // the status dot
      const details = within(card).getByTestId('gbp-details')
      expect(within(details).getByTestId('gbp-location')).toHaveTextContent('Acme Dental')
      expect(within(details).getByText('Connected as owner@example.com')).toBeInTheDocument()
      expect(within(details).getByTestId('gbp-sync')).toHaveTextContent(/^Last synced .+ · Up to date$/)
      expect(within(within(details).getByTestId('gbp-sync')).getByText('Up to date').className).toMatch(/text-emerald-700/)
      const manage = within(card).getByRole('link', { name: 'Manage Google Business Profile' })
      expect(manage).toHaveAttribute('href', '/app/google-visibility/business-profile')
      expect(manage.className).not.toMatch(/violet/) // a healthy connection has nothing to do: a quiet button
    })

    it('the data is the real status, not constants: another account, location and sync time are what is shown', async () => {
      const card = await gbp(businessProfileData({
        google: true,
        business: { name: fact('Zed Salon', 'google_business_profile') },
        googleStatus: { googleEmail: 'zed@salon.example' },
        meta: { lastGoogleSyncAt: '2026-01-15T08:30:00.000Z' },
      }))
      expect(within(card).getByTestId('gbp-location')).toHaveTextContent('Zed Salon')
      expect(within(card).getByText('Connected as zed@salon.example')).toBeInTheDocument()
      expect(within(card).getByTestId('gbp-sync')).toHaveTextContent(/(15 Jan 2026|Jan 15, 2026)/)
      expect(card.textContent).not.toMatch(/Sapphire|owner@example\.com/)
    })

    it('NOT CONNECTED: a neutral card with Not connected, the connect button, and no sync, location, account or business details', async () => {
      const card = await gbp(businessProfileData({ google: false }))
      expect(card).toHaveAttribute('data-state', 'neutral')
      expect(card.className).toMatch(/border-slate-200 bg-white/)
      expect(card.className).not.toMatch(/emerald|amber|red/)
      expect(within(card).getByTestId('gbp-connection-label')).toHaveTextContent('Not connected')
      expect(within(card).getByRole('link', { name: 'Connect Google Business Profile' })).toBeInTheDocument()
      for (const id of ['gbp-sync', 'gbp-location', 'gbp-details']) expect(within(card).queryByTestId(id)).not.toBeInTheDocument()
      expect(card.textContent).not.toMatch(/Last synced|Connected as|Acme Dental|Up to date/)
    })

    it('EXPIRED: amber, "Reconnect required", reconnect action, the last synced data is marked as old data — never shown as healthy', async () => {
      const card = await gbp(businessProfileData({ google: true, googleStatus: { connected: false, connectionStatus: 'expired' } }))
      expect(card).toHaveAttribute('data-state', 'attention')
      expect(card.className).toMatch(/amber/)
      expect(card.className).not.toMatch(/emerald/)
      expect(within(card).getByTestId('gbp-connection-label')).toHaveTextContent('Reconnect required')
      expect(within(card).getByTestId('gbp-connection-label').className).toMatch(/amber/)
      expect(within(card).getByText(/Showing the last synced data/)).toBeInTheDocument()
      expect(within(card).getByRole('link', { name: 'Reconnect Google Business Profile' })).toBeInTheDocument()
      expect(within(card).queryByText('Connected as owner@example.com')).not.toBeInTheDocument() // the connection is not currently valid
    })

    it('REVOKED: red, "Disconnected", and a connect action', async () => {
      const card = await gbp(businessProfileData({ google: false, googleStatus: { connected: false, connectionStatus: 'revoked' } }))
      expect(card).toHaveAttribute('data-state', 'error')
      expect(card.className).toMatch(/red/)
      expect(within(card).getByTestId('gbp-connection-label')).toHaveTextContent('Disconnected')
      expect(within(card).getByText(/Google access was removed/)).toBeInTheDocument()
      expect(within(card).getByRole('link', { name: 'Connect Google Business Profile' })).toBeInTheDocument()
      expect(card.textContent).not.toMatch(/Up to date/)
    })

    it('CONNECTED BUT NEEDS A SYNC (stale): amber, not the healthy green, with the sync action', async () => {
      const stale = await gbp(businessProfileData({ google: true, meta: { freshness: { status: 'stale', staleAfterDays: 7 } } }))
      expect(stale).toHaveAttribute('data-state', 'attention')
      expect(stale.className).not.toMatch(/emerald/)
      expect(within(stale).getByTestId('gbp-sync')).toHaveTextContent('Needs a sync')
      expect(within(stale).getByRole('link', { name: 'Open Google Business Profile to sync' })).toBeInTheDocument()
    })

    it('CONNECTED BUT NO LOCATION CHOSEN: amber with the choose-a-location action', async () => {
      const card = await gbp(businessProfileData({ google: false, googleStatus: { connected: true, connectionStatus: 'active', serviceEnabled: true, locationSelected: false, hasSyncedData: false, dataMatchesSelectedLocation: null } }))
      expect(card).toHaveAttribute('data-state', 'attention')
      expect(within(card).getByTestId('gbp-connection-label')).toHaveTextContent('Connected — no location selected')
      expect(within(card).getByRole('link', { name: 'Choose a business location' })).toBeInTheDocument()
    })

    it('the three visual concepts stay separate: no violet / blue / indigo in the card tint, pill or icon tile (violet is only the call-to-action button)', async () => {
      for (const data of [businessProfileData({ google: true }), businessProfileData({ google: false }), businessProfileData({ google: true, googleStatus: { connected: false, connectionStatus: 'expired' } })]) {
        const view = (setStatus(NOT_CONNECTED_FB, NOT_CONNECTED_IG), api.getSocialBusinessProfile.mockResolvedValue(data), renderPage())
        const card = await screen.findByTestId('gbp-status')
        const parts = [card.className, within(card).getByTestId('gbp-connection-label').className, card.querySelector('h3').previousSibling.className]
        for (const cls of parts) expect(cls).not.toMatch(/violet|purple|indigo|blue/)
        view.unmount()
      }
    })

    it('Facebook and Instagram keep their own platform styling while GBP is shown', async () => {
      setStatus(ACTIVE_FACEBOOK, ACTIVE_INSTAGRAM)
      api.getSocialBusinessProfile.mockResolvedValue(businessProfileData({ google: true }))
      renderPage()
      await screen.findByTestId('gbp-status')
      await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'connected'))
      expect(fbCard().className).toMatch(/border-blue-100 bg-blue-50\/50/)
      expect(within(fbCard()).getByTestId('facebook-status-badge')).toHaveTextContent('Connected')
      expect(igCard()).toHaveAttribute('data-state', 'connected')
      expect(screen.getByTestId('gbp-status').className).not.toMatch(/blue/)
    })

    it('GBP is a data source, not a publishing account: it sits in its own "Business data source" section after the social accounts, with no publishing controls', async () => {
      const card = await gbp(businessProfileData({ google: true }))
      const section = screen.getByTestId('gbp-section')
      expect(within(section).getByRole('heading', { name: 'Business data source' })).toBeInTheDocument()
      expect(section.contains(card)).toBe(true)
      expect(section.contains(fbCard())).toBe(false)
      expect(fbCard().compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(within(card).queryByText(/permission|publish|Verify|Disconnect|Switch Page/i)).not.toBeInTheDocument()
    })
  })

  it('without Google: says not connected, offers the existing connect flow, and still shows no business details', async () => {
    setStatus(ACTIVE_FACEBOOK, NOT_CONNECTED_IG)
    renderPage()
    const label = await screen.findByTestId('gbp-connection-label')
    expect(label).toHaveTextContent('Not connected')
    expect(screen.getByRole('link', { name: 'Connect Google Business Profile' })).toHaveAttribute('href', '/app/google-visibility/business-profile')
    expect(screen.queryByTestId('fact-name-value')).not.toBeInTheDocument()
  })

  it('a failed Google status request is isolated to that section: retry works and the account cards are unaffected', async () => {
    setStatus(ACTIVE_FACEBOOK, NOT_CONNECTED_IG)
    api.getSocialBusinessProfile.mockRejectedValueOnce(apiError('Failed to load the business profile', { status: 500 }))
    renderPage()
    expect(await screen.findByTestId('profile-error')).toBeInTheDocument()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'connected'))
    api.getSocialBusinessProfile.mockResolvedValue(businessProfileData({ google: true }))
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByTestId('gbp-connection-label')).toHaveTextContent('Connected')
  })

  it('with no project selected nothing is requested and an empty state is shown', async () => {
    project = null
    renderPage()
    expect(screen.getByTestId('no-project')).toBeInTheDocument()
    expect(api.getSocialAccountsStatus).not.toHaveBeenCalled()
  })

  it('every request carries the authenticated user\'s active project id (never a value typed by the client)', async () => {
    setStatus(ACTIVE_FACEBOOK, NOT_CONNECTED_IG)
    api.verifySocialAccounts.mockResolvedValue({ success: true, data: { accounts: [] } })
    renderPage()
    await waitFor(() => expect(fbCard()).toHaveAttribute('data-state', 'connected'))
    fireEvent.click(within(fbCard()).getByRole('button', { name: 'Verify connection' }))
    await waitFor(() => expect(api.verifySocialAccounts).toHaveBeenCalled())
    for (const fn of [api.getSocialAccountsStatus, api.verifySocialAccounts]) {
      for (const call of fn.mock.calls) expect(call[0]).toBe('proj-1')
    }
  })
})
