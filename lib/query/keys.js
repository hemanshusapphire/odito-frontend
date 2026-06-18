/* ═══════════════════════════════════════════════════════════════
   Query Key Factory
   
   Centralized, type-safe query key generation.
   Every TanStack Query hook MUST use these factories.
   
   RULES:
   - Keys are arrays, ordered from general → specific
   - Adding a projectId scopes the query to that project
   - queryClient.invalidateQueries(['projects']) invalidates ALL project queries
   - queryClient.invalidateQueries(['issues', projectId]) invalidates all issues for one project
   ═══════════════════════════════════════════════════════════════ */

export const queryKeys = {
  // ── Projects ────────────────────────────────────────────────
  projects: {
    all: () => ['projects'],
    list: (params) => ['projects', 'list', params],
    detail: (id) => ['projects', id],
    overview: (id) => ['projects', id, 'overview'],
  },

  // ── Issues ──────────────────────────────────────────────────
  issues: {
    counts: (projectId) => ['issues', projectId, 'counts'],
    onpage: (projectId) => ['issues', projectId, 'onpage'],
    accessibility: (projectId) => ['issues', projectId, 'accessibility'],
    page: (projectId, url) => ['issues', projectId, 'page', url],
  },

  // ── Technical Checks ────────────────────────────────────────
  technical: {
    all: (projectId) => ['technical', projectId],
    detail: (projectId, checkId) => ['technical', projectId, checkId],
  },

  // ── PageSpeed ───────────────────────────────────────────────
  pagespeed: {
    data: (projectId) => ['pagespeed', projectId],
  },

  // ── Keywords ────────────────────────────────────────────────
  keywords: {
    list: (projectId, opts) => ['keywords', projectId, 'list', opts],
    intelligence: (projectId) => ['keywords', projectId, 'intelligence'],
  },

  // ── AI Search Audit ─────────────────────────────────────────
  aiAudit: {
    project: (projectId) => ['ai-audit', projectId, 'project'],
    summary: (projectId) => ['ai-audit', projectId],
    issues: (projectId) => ['ai-audit', projectId, 'issues'],
    issue: (projectId, issueId) => ['ai-audit', projectId, 'issues', issueId],
    issuePages: (projectId, issueId, opts) => ['ai-audit', projectId, 'issues', issueId, 'pages', opts],
    accessibility: (projectId) => ['ai-audit', projectId, 'accessibility'],
  },

  // ── AEO Hub ─────────────────────────────────────────────────
  aeoHub: {
    data: (projectId) => ['aeo-hub', projectId],
  },

  // ── Pre Audit ───────────────────────────────────────────────
  preAudit: {
    detail: (projectId) => ['pre-audit', projectId],
  },

  // ── AI Video / Visibility ───────────────────────────────────
  aiVideo: {
    pages: (projectId, params) => ['ai-video', projectId, 'pages', params],
    page: (projectId, url) => ['ai-video', projectId, 'page', url],
    worst: (projectId, limit) => ['ai-video', projectId, 'worst', limit],
    graph: (projectId) => ['ai-video', projectId, 'graph'],
  },

  // ── Raw HTML ────────────────────────────────────────────────
  rawHtml: {
    detail: (projectId, url) => ['raw-html', projectId, url],
  },

  // ── Fix Logs (deprecated — use tasks instead) ──────────────────────
  fixLogs: {
    // Base key — used for broad invalidations (invalidates all pages/filters)
    all:       (projectId)             => ['fix-logs', projectId],
    // Paginated + filtered list — separate cache entry per filter combo
    list:      (params)                => ['fix-logs', params?.projectId, 'list', params],
    fixedUrls: (projectId, issueKey)   => ['fix-logs', projectId, 'fixed-urls', issueKey],
  },

  // ── Tasks (new lifecycle system) ──────────────────────────────────
  tasks: {
    all:        (projectId)             => ['tasks', projectId],
    list:       (params)                => ['tasks', params?.projectId, 'list', params],
    detail:     (taskId)                => ['tasks', 'detail', taskId],
    summary:    (projectId)             => ['tasks', projectId, 'summary'],
    activeUrls: (projectId, issueKey)   => ['tasks', projectId, 'active-urls', issueKey],
  },

  // ── Audit History ────────────────────────────────────────────────
  auditHistory: {
    comparison:      (projectId)           => ['audit-history', projectId, 'comparison'],
    auditComparison: (projectId, from, to) => ['audit-history', projectId, 'comparison', from, to],
    history:         (projectId, page)     => ['audit-history', projectId, 'history', page],
    historyAll:      (projectId)           => ['audit-history', projectId, 'history-all'],
    trends:          (projectId)           => ['audit-history', projectId, 'trends'],
    aiImpact:        (projectId)           => ['audit-history', projectId, 'ai-impact'],
  },
}

/* ── Invalidation Helpers ──────────────────────────────────────── */

/**
 * Invalidate all queries for a specific project.
 * Use when switching projects or after recrawl completes.
 */
export function invalidateProject(queryClient, projectId) {
  // Project data — overview + the projects list (used by ProjectContext/sidebar)
  queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
  queryClient.invalidateQueries({ queryKey: ['projects', 'list'] })
  // Audit results
  queryClient.invalidateQueries({ queryKey: ['issues', projectId] })
  queryClient.invalidateQueries({ queryKey: ['technical', projectId] })
  queryClient.invalidateQueries({ queryKey: ['pagespeed', projectId] })
  queryClient.invalidateQueries({ queryKey: ['keywords', projectId] })
  queryClient.invalidateQueries({ queryKey: ['ai-audit', projectId] })
  queryClient.invalidateQueries({ queryKey: ['ai-video', projectId] })
  queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
  queryClient.invalidateQueries({ queryKey: ['audit-history', projectId] })
}

/**
 * Force-refetch all audit result queries for a project immediately.
 * Call after recrawl completion to push fresh data to all panels
 * without waiting for user interaction.
 */
export function refetchProject(queryClient, projectId) {
  queryClient.refetchQueries({ queryKey: ['projects', projectId] })
  queryClient.refetchQueries({ queryKey: ['projects', 'list'] })
  queryClient.refetchQueries({ queryKey: ['issues', projectId] })
  queryClient.refetchQueries({ queryKey: ['technical', projectId] })
  queryClient.refetchQueries({ queryKey: ['pagespeed', projectId] })
  queryClient.refetchQueries({ queryKey: ['ai-video', projectId] })
  queryClient.refetchQueries({ queryKey: ['tasks', projectId] })
  queryClient.refetchQueries({ queryKey: ['audit-history', projectId] })
}

/**
 * Invalidate all project data globally.
 * Use on logout.
 */
export function invalidateAll(queryClient) {
  queryClient.clear()
}
