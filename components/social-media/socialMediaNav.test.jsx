import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, within } from '@testing-library/react'

let pathname = '/app/social-media/business-profile'
vi.mock('next/navigation', () => ({ usePathname: () => pathname }))
vi.mock('next/link', async () => (await import('@/test-utils/socialMediaAI')).nextLinkMock())
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { firstName: 'Hemanshu', lastName: 'Badoge', email: 'h@example.com' } }) }))
vi.mock('./WorkspaceSelector', () => ({ WorkspaceSelector: () => null }))

import SocialMediaSidebar from './SocialMediaSidebar'
import { SOCIAL_MEDIA_NAV_ITEMS } from './socialMediaNav'

const links = () => within(screen.getAllByRole('navigation')[0]).getAllByRole('link')

describe('Social Media AI navigation', () => {
  it('lists the sections in the agreed order, Business Profile right after Connect Accounts', () => {
    expect(SOCIAL_MEDIA_NAV_ITEMS.map((i) => i.label)).toEqual([
      'Overview', 'Connect Accounts', 'Business Profile', 'AI Strategy', 'Content Calendar', 'Content Approvals', 'Creative Studio', 'Scheduled Posts', 'Analytics', 'Settings',
    ])
    expect(SOCIAL_MEDIA_NAV_ITEMS.find((i) => i.label === 'Business Profile').href).toBe('/app/social-media/business-profile')
    expect(new Set(SOCIAL_MEDIA_NAV_ITEMS.map((i) => i.href)).size).toBe(SOCIAL_MEDIA_NAV_ITEMS.length)
  })

  it('the sidebar renders them in that order with the right routes', () => {
    pathname = '/app/social-media'
    render(<SocialMediaSidebar />)
    expect(links().map((a) => a.textContent)).toEqual(SOCIAL_MEDIA_NAV_ITEMS.map((i) => i.label))
    expect(links().map((a) => a.getAttribute('href'))).toEqual(SOCIAL_MEDIA_NAV_ITEMS.map((i) => i.href))
  })

  it('exactly ONE item is active — the current page — and it uses the navigation (violet) style', () => {
    for (const item of SOCIAL_MEDIA_NAV_ITEMS) {
      pathname = item.href
      const { unmount } = render(<SocialMediaSidebar />)
      const active = links().filter((a) => /bg-violet-50/.test(a.className))
      expect(active.map((a) => a.textContent), item.label).toEqual([item.label])
      unmount()
    }
  })

  it('Business Profile is active on its own page and Connect Accounts / Settings are not (no shared active state)', () => {
    pathname = '/app/social-media/business-profile'
    render(<SocialMediaSidebar />)
    const byName = (name) => links().find((a) => a.textContent === name)
    expect(byName('Business Profile').className).toMatch(/bg-violet-50/)
    expect(byName('Connect Accounts').className).not.toMatch(/violet/)
    expect(byName('Settings').className).not.toMatch(/violet/)
  })

  it('the navigation carries no connection status colours (green / amber / red are reserved for connection state)', () => {
    pathname = '/app/social-media/connect-accounts'
    render(<SocialMediaSidebar />)
    for (const a of links()) expect(a.className).not.toMatch(/emerald|green|amber|red-/)
  })
})
