/**
 * Pure task-category routing helpers for the Optimization Center.
 *
 * Extracted out of page.jsx (not just for testability, but because Next.js's
 * App Router build fails if a page.jsx file exports anything besides the
 * handful of names it recognizes — default, generateStaticParams, etc. An
 * extra named export like these two trips a real "Type ... is not
 * assignable to type 'never'" build error, caught via `next build`).
 */

function buildTaskRoute(task, mode) {
  const cat = (task.issueCategory || '').toLowerCase()
  const qs = new URLSearchParams()
  if (task.pageUrl) qs.set('url', task.pageUrl)
  if (mode) qs.set('mode', mode)

  if (cat.includes('accessibility')) {
    return `/app/accessibility?issue=${encodeURIComponent(task.issueKey)}&${qs}`
  }
  if (cat.includes('ai') || cat.includes('visibility') || cat.includes('search audit')) {
    return `/ai-search-audit/issues/${encodeURIComponent(task.issueKey)}?${qs}`
  }
  return `/app/onpage?issue=${encodeURIComponent(task.issueKey)}&${qs}`
}

export function getCheckDIYRoute(task) {
  return buildTaskRoute(task, 'diy')
}

// Verified Fixed rows offer an optional "View Details" action — same
// destination as Check DIY, minus mode=diy (that mode flag opens the DIY
// remediation guide, which makes no sense for an issue already resolved).
export function getIssueDetailsRoute(task) {
  return buildTaskRoute(task, null)
}

// Bulk URL Verification (Phase 1) is scoped to Content/on-page issues only —
// the only category with a verified, authoritative "all affected URLs"
// source (getIssueUrls, reads seo_page_issues). Accessibility and AI-
// visibility categories keep the existing "Check DIY" action for now; see
// the architectural inspection for why. Mirrors getCheckDIYRoute's own
// category branching so both stay in sync with each other.
export function isOnPageCategory(task) {
  const cat = (task.issueCategory || '').toLowerCase()
  return !cat.includes('accessibility') && !cat.includes('ai') && !cat.includes('visibility') && !cat.includes('search audit')
}
