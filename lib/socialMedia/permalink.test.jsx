import React from 'react'
import { describe, it, expect } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { publication } from '@/test-utils/socialMediaAI'
import { safePermalink, mapPublicationToPost, mapPublicationToCalendarPost } from './postMapper'
import { PostViewDialog } from '@/components/social-media/PostViewDialog'
import { PostDetailPanel } from '@/components/social-media/PostDetailPanel'

const URL_OK = 'https://www.facebook.com/122139385155179997/posts/122145283227179997'
const published = (over = {}) => publication({ id: 'p1', status: 'published', platform: 'facebook', publishedAt: '2026-10-03T05:25:03.766Z', scheduledAt: '2026-10-03T05:25:00.000Z', timezone: 'Asia/Calcutta', externalPostId: '865439123326519_122145283227179997', ...over })

describe('safePermalink - only a plain https facebook.com URL can ever become a link', () => {
  it('accepts the platform permalink as stored by the backend', () => {
    expect(safePermalink(URL_OK)).toBe(URL_OK)
    expect(safePermalink('https://facebook.com/page/posts/1')).toBe('https://facebook.com/page/posts/1')
  })

  it('drops everything else: missing, non-strings, other hosts, look-alikes, http, javascript:, credentials, tokens, absurd length', () => {
    for (const bad of [null, undefined, '', 5, {}, [URL_OK], 'not a url', 'http://www.facebook.com/x', 'https://evil.example/x', 'https://facebook.com.evil.example/x', 'https://www.facebook.com@evil.example/x',
      'javascript:alert(1)', 'data:text/html,hi', 'https://user:pw@www.facebook.com/x', 'https://www.facebook.com/x?access_token=abc', `https://www.facebook.com/${'a'.repeat(600)}`]) {
      expect(safePermalink(bad), String(bad).slice(0, 50)).toBeNull()
    }
  })
})

describe('the mapper exposes the permalink safely and never invents one', () => {
  it('a published post carries the stored permalink; the externalPostId is kept alongside it', () => {
    const post = mapPublicationToPost(published({ permalink: URL_OK }))
    expect(post.permalink).toBe(URL_OK)
    expect(post.externalPostId).toBe('865439123326519_122145283227179997')
  })

  it('NO permalink -> null, and no URL is built from the post id (the real permalink\'s number is not the Page id in the post id)', () => {
    for (const permalink of [undefined, null, '']) {
      const post = mapPublicationToPost(published({ permalink }))
      expect(post.permalink).toBeNull()
      expect(JSON.stringify(post)).not.toMatch(/facebook\.com/)
    }
  })

  it('an unsafe stored value is dropped, and a permalink on a post that is not published is never exposed', () => {
    expect(mapPublicationToPost(published({ permalink: 'https://evil.example/phish' })).permalink).toBeNull()
    expect(mapPublicationToPost(published({ permalink: 'javascript:alert(1)' })).permalink).toBeNull()
    for (const status of ['scheduled', 'failed', 'draft', 'publishing']) expect(mapPublicationToPost(publication({ status, permalink: URL_OK })).permalink, status).toBeNull()
  })

  it('the calendar mapper carries it for published posts only', () => {
    expect(mapPublicationToCalendarPost(published({ permalink: URL_OK })).permalink).toBe(URL_OK)
    expect(mapPublicationToCalendarPost(published()).permalink).toBeNull()
  })
})

describe('"View on Facebook"', () => {
  const dialog = (pub) => render(<PostViewDialog post={mapPublicationToPost(pub)} open onOpenChange={() => {}} />)

  it('post details: a published post with a permalink gets a link that opens the canonical URL safely in a new tab', () => {
    dialog(published({ permalink: URL_OK }))
    const link = screen.getByTestId('view-on-facebook')
    expect(link).toHaveTextContent('View on Facebook')
    expect(link).toHaveAttribute('href', URL_OK)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
    expect(link.getAttribute('rel')).toContain('noreferrer')
  })

  it('post details: no permalink -> no link, no disabled placeholder, no fallback URL', () => {
    dialog(published({ permalink: null }))
    expect(screen.queryByTestId('view-on-facebook')).not.toBeInTheDocument()
    expect(document.body.innerHTML).not.toMatch(/facebook\.com/)
  })

  it('post details: scheduled / failed posts never show it, even if a stored value existed', () => {
    for (const status of ['scheduled', 'failed']) {
      const { unmount } = dialog(publication({ status, permalink: URL_OK }))
      expect(screen.queryByTestId('view-on-facebook'), status).not.toBeInTheDocument()
      unmount()
    }
  })

  it('post details: an unsafe stored value is not rendered as a link', () => {
    dialog(published({ permalink: 'javascript:alert(1)' }))
    expect(screen.queryByTestId('view-on-facebook')).not.toBeInTheDocument()
    expect(document.body.innerHTML).not.toMatch(/javascript:/)
  })

  it('calendar detail panel: shows it for a published post with a permalink, hides it otherwise', () => {
    const { unmount } = render(<PostDetailPanel post={mapPublicationToCalendarPost(published({ permalink: URL_OK }))} onClose={() => {}} />)
    expect(screen.getByTestId('view-on-facebook')).toHaveAttribute('href', URL_OK)
    unmount()
    render(<PostDetailPanel post={mapPublicationToCalendarPost(published())} onClose={() => {}} />)
    expect(screen.queryByTestId('view-on-facebook')).not.toBeInTheDocument()
  })
})
