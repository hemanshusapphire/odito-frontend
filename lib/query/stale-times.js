/* ═══════════════════════════════════════════════════════════════
   Stale Time Tiers
   
   Different data has different freshness requirements.
   Using one staleTime for everything (5 min) is wrong.
   
   TIERS:
   - STATIC:   Data that rarely changes (project settings, user profile)
   - STANDARD: Audit results that change on re-crawl
   - DYNAMIC:  Frequently updated data (keywords, active crawls)
   - REALTIME: Data that needs near-instant updates (processing status)
   ═══════════════════════════════════════════════════════════════ */

export const staleTimes = {
  /** 30 minutes — project metadata, user settings, pricing plans */
  STATIC: 30 * 60 * 1000,

  /** 5 minutes — general cached data */
  STANDARD: 5 * 60 * 1000,

  /** 30 seconds — audit results: scores, issues, overview, counts.
   *  Must be short so recrawl data is fetched fresh on next page load
   *  rather than being served from the persisted localStorage cache. */
  AUDIT_RESULT: 30 * 1000,

  /** 1 minute — keyword tracking, active crawl data */
  DYNAMIC: 1 * 60 * 1000,

  /** 10 seconds — processing status, WebSocket-synced data */
  REALTIME: 10 * 1000,
}

export const gcTimes = {
  /** 1 hour — keep static data in cache long */
  STATIC: 60 * 60 * 1000,

  /** 15 minutes — standard cache retention */
  STANDARD: 15 * 60 * 1000,

  /** 5 minutes — short-lived cache */
  DYNAMIC: 5 * 60 * 1000,

  /** 30 seconds — ephemeral */
  REALTIME: 30 * 1000,
}
