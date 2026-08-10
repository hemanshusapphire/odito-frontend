import { describe, it, expect } from 'vitest'
import { getCheckDIYRoute, getIssueDetailsRoute, isOnPageCategory } from './taskRouting'

function makeTask(overrides = {}) {
  return {
    issueKey: 'H1_MISSING',
    issueCategory: 'Content',
    pageUrl: 'https://example.com/a',
    ...overrides,
  }
}

describe('getCheckDIYRoute', () => {
  it('routes on-page issues to /app/onpage with mode=diy', () => {
    const route = getCheckDIYRoute(makeTask())
    expect(route).toContain('/app/onpage?issue=H1_MISSING')
    expect(route).toContain('mode=diy')
  })

  it('routes Accessibility issues to /app/accessibility', () => {
    const route = getCheckDIYRoute(makeTask({ issueCategory: 'Accessibility' }))
    expect(route).toContain('/app/accessibility?issue=H1_MISSING')
    expect(route).toContain('mode=diy')
  })
})

describe('getIssueDetailsRoute', () => {
  it('routes to the same destination as getCheckDIYRoute but without mode=diy', () => {
    const task = makeTask()
    const route = getIssueDetailsRoute(task)
    expect(route).toContain('/app/onpage?issue=H1_MISSING')
    expect(route).not.toContain('mode=diy')
  })

  it('still carries the pageUrl query param', () => {
    const route = getIssueDetailsRoute(makeTask())
    expect(route).toContain(`url=${encodeURIComponent('https://example.com/a')}`)
  })
})

describe('isOnPageCategory', () => {
  it('is true for Content issues and false for Accessibility/AI-visibility', () => {
    expect(isOnPageCategory(makeTask({ issueCategory: 'Content' }))).toBe(true)
    expect(isOnPageCategory(makeTask({ issueCategory: 'Accessibility' }))).toBe(false)
    expect(isOnPageCategory(makeTask({ issueCategory: 'AI Visibility' }))).toBe(false)
  })
})
