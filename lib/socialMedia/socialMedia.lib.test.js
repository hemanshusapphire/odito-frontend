import { describe, it, expect } from 'vitest'
import { toAccountViewModel, toAccountViewModels, accountsNeedingAttention, accountStatusLabel, ACCOUNT_STATE } from './accountViewModel'
import {
  mapPublicationToPost, mapPublicationToCalendarPost, mapPublicationToApprovalPost, mapApproval, calendarStatusFor, splitContent, tabForStatus, dayKey, timeLabel,
  toScheduleFormValues, scheduleFormToUtcIso, sortByScheduledAsc,
} from './postMapper'
import { describeFailure, describeApiError, headlineForFailure } from './failureMessages'
import { statusView, changeLabel, gapLabel, sortedMix, MIX_LABELS } from './aiStrategy'

// Backend-shaped fixture (odito_backend socialPublishingService.toApiPublication).
const pub = (o = {}) => ({
  id: 'p1', socialAccountId: 'a1', platform: 'facebook', externalPostId: null, content: 'Hello world', media: [], status: 'scheduled',
  scheduledAt: '2026-10-10T04:30:00.000Z', timezone: 'Asia/Kolkata', publishedAt: null, failedAt: null, failureReason: null, failureCode: null,
  attempts: 0, nextRetryAt: null, outcomeUnknown: false, lastError: null, lastErrorCode: null, requiresReconnect: false, canRetry: false,
  createdAt: '2026-10-01T00:00:00.000Z', ...o,
})

describe('toAccountViewModel — real backend status -> UI state', () => {
  it('loading before any data, error only when there is no cached data', () => {
    expect(toAccountViewModel('facebook', undefined, { isLoading: true }).state).toBe(ACCOUNT_STATE.LOADING)
    expect(toAccountViewModel('facebook', undefined, { isError: true }).state).toBe(ACCOUNT_STATE.ERROR)
    expect(toAccountViewModel('facebook', { connected: true, status: 'active', publishingReady: true }, { isError: true }).state).toBe(ACCOUNT_STATE.CONNECTED)
  })

  it('{connected:false} is "not connected" with nothing invented', () => {
    const vm = toAccountViewModel('instagram', { connected: false, reason: 'NOT_CONNECTED' })
    expect(vm.state).toBe(ACCOUNT_STATE.NOT_CONNECTED)
    expect(vm.connected).toBe(false)
    expect(vm.name).toBeNull()
    expect(vm.picture).toBeNull()
  })

  it('connected + publishingReady is healthy and carries the real profile fields', () => {
    const vm = toAccountViewModel('facebook', { connected: true, status: 'active', requiresReconnect: false, accountName: 'Acme', accountId: 'pg_1', picture: 'https://x/y.jpg', category: 'Agency', lastVerifiedAt: '2026-10-01T00:00:00Z', publishingReady: true, socialAccountId: 's1' })
    expect(vm.state).toBe(ACCOUNT_STATE.CONNECTED)
    expect(vm.needsPermission).toBe(false)
    expect(vm.name).toBe('Acme')
    expect(vm.picture).toBe('https://x/y.jpg')
    expect(vm.lastVerifiedAt).toBe('2026-10-01T00:00:00Z')
  })

  it('connected === true is NOT assumed healthy: a missing publish permission is surfaced', () => {
    const vm = toAccountViewModel('facebook', { connected: true, status: 'active', publishingReady: false })
    expect(vm.state).toBe(ACCOUNT_STATE.CONNECTED)
    expect(vm.needsPermission).toBe(true)
    expect(accountStatusLabel(vm)).toBe('Permission needed')
  })

  it('{connected:false,status:"expired",requiresReconnect:true} is the expired / reconnect state', () => {
    const vm = toAccountViewModel('facebook', { connected: false, status: 'expired', requiresReconnect: true, accountName: 'Acme' })
    expect(vm.state).toBe(ACCOUNT_STATE.EXPIRED)
    expect(vm.requiresReconnect).toBe(true)
    expect(vm.connected).toBe(false)
    expect(vm.name).toBe('Acme')
    expect(accountStatusLabel(vm)).toBe('Reconnect required')
  })

  it('accountsNeedingAttention lists expired and permission-less accounts only', () => {
    const models = toAccountViewModels({
      facebook: { connected: true, status: 'active', publishingReady: true },
      instagram: { connected: false, status: 'expired', requiresReconnect: true },
    })
    expect(accountsNeedingAttention(models)).toEqual([{ platform: 'instagram', reason: 'expired', name: null }])
    const perm = toAccountViewModels({ facebook: { connected: true, status: 'active', publishingReady: false }, instagram: { connected: false } })
    expect(accountsNeedingAttention(perm)).toEqual([{ platform: 'facebook', reason: 'permission', name: null }])
  })
})

describe('mapPublicationToPost — the one backend -> UI mapping', () => {
  it('maps tabs from the backend\'s real states (publishing belongs to Scheduled; drafts/cancelled have no tab)', () => {
    expect(tabForStatus('scheduled')).toBe('scheduled')
    expect(tabForStatus('publishing')).toBe('scheduled')
    expect(tabForStatus('published')).toBe('published')
    expect(tabForStatus('failed')).toBe('failed')
    expect(tabForStatus('draft')).toBeNull()
    expect(tabForStatus('cancelled')).toBeNull()
  })

  it('shows date/time in the post\'s OWN timezone (04:30Z is 10:00 AM in Kolkata) and keeps the real status', () => {
    const post = mapPublicationToPost(pub())
    expect(post.date).toBe('2026-10-10')
    expect(post.time).toBe('10:00 AM')
    expect(post.timezone).toBe('Asia/Kolkata')
    expect(post.status).toBe('scheduled')
    expect(post.canEditSchedule).toBe(true)
  })

  it('a post scheduled just after midnight in its zone stays on THAT day for any viewer', () => {
    // 2026-10-09T19:00Z is 2026-10-10 00:30 in Kolkata
    expect(dayKey('2026-10-09T19:00:00.000Z', 'Asia/Kolkata')).toBe('2026-10-10')
    expect(dayKey('2026-10-09T19:00:00.000Z', 'America/New_York')).toBe('2026-10-09')
    expect(timeLabel('2026-10-09T19:00:00.000Z', 'Asia/Kolkata')).toBe('12:30 AM')
  })

  it('published posts are placed by publishedAt; failed ones by their scheduled time', () => {
    const published = mapPublicationToPost(pub({ status: 'published', publishedAt: '2026-10-10T04:31:00.000Z', externalPostId: 'x' }))
    expect(published.time).toBe('10:01 AM')
    expect(published.tab).toBe('published')
    expect(published.canEditSchedule).toBe(false)
    const failed = mapPublicationToPost(pub({ status: 'failed', failedAt: '2026-10-10T05:00:00.000Z' }))
    expect(failed.time).toBe('10:00 AM')
  })

  it('first line is the title, the rest the description; a long first line is cut at a word and continues in the description', () => {
    expect(splitContent('Big news\nWe are launching')).toEqual({ title: 'Big news', description: 'We are launching' })
    const long = `${'word '.repeat(40).trim()}`
    const { title, description } = splitContent(long)
    expect(title.endsWith('…')).toBe(true)
    expect(title.length).toBeLessThanOrEqual(91)
    expect((title.slice(0, -1) + description).replace(/\s+/g, ' ').replace(/\s/g, '')).toBe(long.replace(/\s/g, ''))
    expect(splitContent('')).toEqual({ title: '', description: '' })
  })

  it('uses a real image URL for the preview and a text/video fallback otherwise', () => {
    expect(mapPublicationToPost(pub({ media: [{ url: 'https://cdn/x.jpg', type: 'image' }] })).imageSrc).toBe('https://cdn/x.jpg')
    const video = mapPublicationToPost(pub({ media: [{ url: 'https://cdn/x.mp4', type: 'video' }] }))
    expect(video.imageSrc).toBeNull()
    expect(video.format).toBe('Video')
    expect(mapPublicationToPost(pub()).format).toBe('Text')
  })

  it('a retry-pending scheduled post exposes the backend\'s retry state', () => {
    const post = mapPublicationToPost(pub({ attempts: 2, nextRetryAt: '2026-10-10T04:35:00.000Z', lastError: 'Meta is rate-limiting', lastErrorCode: 'FACEBOOK_RATE_LIMITED' }))
    expect(post.status).toBe('scheduled')
    expect(post.retry.attempts).toBe(2)
    expect(post.retry.nextRetryLabel).toContain('10:05 AM')
    expect(post.retry.lastError).toBe('Meta is rate-limiting')
    expect(mapPublicationToPost(pub()).retry).toBeNull()
  })

  it('canRetry comes ONLY from the backend flag (never inferred by the UI)', () => {
    expect(mapPublicationToPost(pub({ status: 'failed', failureCode: 'FACEBOOK_RATE_LIMITED', canRetry: true })).canRetry).toBe(true)
    expect(mapPublicationToPost(pub({ status: 'failed', failureCode: 'FACEBOOK_RATE_LIMITED', canRetry: false })).canRetry).toBe(false)
    expect(mapPublicationToPost(pub({ status: 'failed', failureCode: 'FACEBOOK_RATE_LIMITED' })).canRetry).toBe(false)
  })

  it('calendar mapping: placed by scheduled instant; drafts, cancelled and undated posts are excluded', () => {
    expect(mapPublicationToCalendarPost(pub({ status: 'draft', scheduledAt: null }))).toBeNull()
    expect(mapPublicationToCalendarPost(pub({ status: 'cancelled' }))).toBeNull()
    const c = mapPublicationToCalendarPost(pub({ status: 'published', publishedAt: '2026-10-11T00:00:00Z', media: [{ url: 'u', type: 'image' }] }))
    expect(c.date).toBe('2026-10-10')
    expect(c.status).toBe('published')
    expect(c.contentFormat).toBe('Photo')
  })

  it('sorts scheduled posts soonest first', () => {
    const a = mapPublicationToPost(pub({ id: 'a', scheduledAt: '2026-10-12T00:00:00Z' }))
    const b = mapPublicationToPost(pub({ id: 'b', scheduledAt: '2026-10-11T00:00:00Z' }))
    expect(sortByScheduledAsc([a, b]).map((p) => p.id)).toEqual(['b', 'a'])
  })
})

describe('schedule form <-> UTC instant', () => {
  it('prefills the editor in the post\'s own timezone', () => {
    expect(toScheduleFormValues(mapPublicationToPost(pub()))).toEqual({ timezone: 'Asia/Kolkata', date: '2026-10-10', time: '10:00' })
  })

  it('converts wall-clock time + zone to an explicit-offset UTC ISO the API accepts', () => {
    expect(scheduleFormToUtcIso({ date: '2026-10-10', time: '10:00', timezone: 'Asia/Kolkata' })).toBe('2026-10-10T04:30:00.000Z')
    expect(scheduleFormToUtcIso({ date: '2026-12-01', time: '09:00', timezone: 'America/New_York' })).toBe('2026-12-01T14:00:00.000Z')
  })

  it('returns null for anything that is not a real instant (the backend never receives a naive/garbage value)', () => {
    expect(scheduleFormToUtcIso({ date: '2026-02-30', time: '10:00', timezone: 'UTC' })).toBeNull()
    expect(scheduleFormToUtcIso({ date: '', time: '10:00', timezone: 'UTC' })).toBeNull()
    expect(scheduleFormToUtcIso({ date: '2026-10-10', time: '10:00', timezone: 'Mars/Olympus' })).toBeNull()
  })
})

describe('describeFailure — what the failure UI shows', () => {
  it('returns null for a post that did not fail', () => {
    expect(describeFailure(pub())).toBeNull()
  })

  it('expired authentication => reconnect; never retryable even if a flag said so', () => {
    const f = describeFailure(pub({ status: 'failed', failureCode: 'FACEBOOK_TOKEN_INVALID', requiresReconnect: true, canRetry: true, failureReason: 'Meta denied this request' }))
    expect(f.kind).toBe('reconnect')
    expect(f.canRetry).toBe(false)
    expect(f.requiresReconnect).toBe(true)
    expect(f.headline).toMatch(/reconnected/i)
    expect(f.detail).toBe('Meta denied this request')
  })

  it('missing permission => reconnect', () => {
    expect(describeFailure(pub({ status: 'failed', failureCode: 'INSTAGRAM_PERMISSION_MISSING', requiresReconnect: true })).kind).toBe('reconnect')
  })

  it('an UNKNOWN outcome is never retryable and says to check the page', () => {
    for (const code of ['PUBLISH_OUTCOME_UNKNOWN', 'OUTCOME_UNKNOWN', 'RECONCILIATION_PENDING']) {
      const f = describeFailure(pub({ status: 'failed', failureCode: code, canRetry: true }))
      expect(f.kind, code).toBe('unknown')
      expect(f.canRetry, code).toBe(false)
    }
    const flagged = describeFailure(pub({ status: 'failed', failureCode: 'FACEBOOK_PUBLISH_FAILED', outcomeUnknown: true, canRetry: true }))
    expect(flagged.kind).toBe('unknown')
    expect(flagged.canRetry).toBe(false)
    expect(headlineForFailure('PUBLISH_OUTCOME_UNKNOWN', 'facebook')).toMatch(/Check your page/)
  })

  it('a retry is offered only when the backend says canRetry', () => {
    expect(describeFailure(pub({ status: 'failed', failureCode: 'FACEBOOK_RATE_LIMITED', canRetry: true })).canRetry).toBe(true)
    expect(describeFailure(pub({ status: 'failed', failureCode: 'FACEBOOK_PUBLISH_FAILED', canRetry: false })).canRetry).toBe(false)
    expect(describeFailure(pub({ status: 'failed', failureCode: 'FACEBOOK_MEDIA_INVALID', canRetry: false })).kind).toBe('blocked')
  })

  it('missed schedule and retries-exhausted have specific, actionable headlines', () => {
    expect(describeFailure(pub({ status: 'failed', failureCode: 'SCHEDULE_MISSED', canRetry: true })).kind).toBe('missed')
    expect(headlineForFailure('MAX_RETRIES_EXCEEDED')).toMatch(/several times/)
  })

  it('generic Meta failures are named by platform, not "something went wrong"', () => {
    expect(headlineForFailure('FACEBOOK_PUBLISH_FAILED', 'facebook')).toBe('Facebook could not publish this post.')
    expect(headlineForFailure('INSTAGRAM_PUBLISH_FAILED', 'instagram')).toBe('Instagram could not publish this post.')
    expect(headlineForFailure(null, 'instagram')).toBe('Instagram rejected this post.')
  })
})

describe('describeApiError — mutation errors', () => {
  it('keeps the backend\'s safe, specific message and reads the code from details.code', () => {
    const e = Object.assign(new Error('scheduledAt must be in the future. Pick a later time, or use Publish Now to post immediately.'), { status: 400, details: { code: 'SCHEDULE_IN_PAST' } })
    const d = describeApiError(e)
    expect(d.code).toBe('SCHEDULE_IN_PAST')
    expect(d.message).toMatch(/must be in the future/)
  })

  it('flags reconnect, unknown outcome and stale-state errors', () => {
    expect(describeApiError(Object.assign(new Error('x'), { status: 409, details: { code: 'ACCOUNT_RECONNECT_REQUIRED' } })).requiresReconnect).toBe(true)
    expect(describeApiError(Object.assign(new Error('x'), { status: 409, details: { code: 'OUTCOME_UNKNOWN' } })).outcomeUnknown).toBe(true)
    expect(describeApiError(Object.assign(new Error('x'), { status: 409, details: { code: 'RECONCILIATION_PENDING' } })).outcomeUnknown).toBe(true)
    expect(describeApiError(Object.assign(new Error('x'), { status: 409 })).isStale).toBe(true)
    expect(describeApiError(Object.assign(new Error('x'), { status: 404 })).isStale).toBe(true)
  })

  it('a request that never reached the server reads as a connectivity problem, not a generic failure', () => {
    expect(describeApiError(new TypeError('Failed to fetch')).message).toMatch(/Could not reach Odito/)
  })

  it('falls back to a generic message only when the backend gave nothing', () => {
    expect(describeApiError(undefined).message).toBe('Something went wrong. Please try again.')
  })
})

describe('approval workflow mapping — the backend\'s verdict, never re-derived', () => {
  const block = (state, o = {}) => ({
    managed: true, state, stage: state, publishable: state === 'design_approved', needsChanges: false, contentVersion: 2, designVersion: 3,
    contentApprovedAt: null, contentApprovedBy: null, designApprovedAt: null, designApprovedBy: null, changesRequested: null, ...o,
  })

  it('a post outside the workflow is unmanaged, publishable, and has no label', () => {
    const a = mapPublicationToPost(pub()).approval
    expect(a).toMatchObject({ managed: false, publishable: true, needsChanges: false, label: null, state: null })
    expect(mapApproval({ ...pub(), approval: { managed: false, state: null } }).managed).toBe(false)
  })

  it('labels come from the backend state; needsChanges overrides the label; versions are carried through', () => {
    expect(mapApproval({ approval: block('content_review') }).label).toBe('Content in review')
    expect(mapApproval({ approval: block('content_approved') }).label).toBe('Content approved — design not submitted')
    expect(mapApproval({ approval: block('design_review') }).label).toBe('Design in review')
    expect(mapApproval({ approval: block('design_approved') }).label).toBe('Fully approved')
    expect(mapApproval({ approval: block('content_review', { needsChanges: true }) }).label).toBe('Content changes requested')
    expect(mapApproval({ approval: block('design_review', { needsChanges: true }) }).label).toBe('Design changes requested')
    const a = mapApproval({ approval: block('content_review') })
    expect([a.contentVersion, a.designVersion]).toEqual([2, 3])
  })

  it('an auto-approved stage (approvedAt without an approver) is flagged, so the UI never names a person who did not approve', () => {
    const a = mapApproval({ approval: block('design_approved', { contentApprovedAt: '2026-10-01T00:00:00Z', contentApprovedBy: null, designApprovedAt: '2026-10-01T00:00:00Z', designApprovedBy: 'u1', designApprovedByName: 'Sam' }) })
    expect(a.contentAutoApproved).toBe(true)
    expect(a.designAutoApproved).toBe(false)
  })

  it('calendar status: only a SCHEDULED, managed, not-publishable post shows its approval stage', () => {
    expect(calendarStatusFor('scheduled', mapApproval({ approval: block('content_review') }))).toBe('content-review')
    expect(calendarStatusFor('scheduled', mapApproval({ approval: block('content_approved') }))).toBe('design-pending')
    expect(calendarStatusFor('scheduled', mapApproval({ approval: block('design_review') }))).toBe('design-review')
    expect(calendarStatusFor('scheduled', mapApproval({ approval: block('design_approved') }))).toBe('scheduled')
    expect(calendarStatusFor('scheduled', mapApproval(pub()))).toBe('scheduled')
    expect(calendarStatusFor('published', mapApproval({ approval: block('design_approved') }))).toBe('published')
    expect(calendarStatusFor('draft', mapApproval({ approval: block('content_review') }))).toBe(null)
  })

  it('mapPublicationToCalendarPost uses the approval-aware status', () => {
    const post = mapPublicationToCalendarPost(pub({ approval: block('design_review') }))
    expect(post.status).toBe('design-review')
  })

  it('approval-page post: tabs and the actions it may offer follow the backend state', () => {
    const tabsOf = (o) => mapPublicationToApprovalPost(pub({ status: 'draft', scheduledAt: null, ...o })).approvalTabs
    expect(tabsOf({})).toEqual(['drafts'])
    expect(tabsOf({ approval: block('content_review') })).toEqual(['content-review'])
    expect(tabsOf({ approval: block('content_review', { needsChanges: true }) })).toEqual(['content-review', 'needs-changes'])
    expect(tabsOf({ approval: block('design_review') })).toEqual(['design-review'])
    expect(tabsOf({ approval: block('content_approved') })).toEqual(['approved'])
    expect(tabsOf({ approval: block('design_approved') })).toEqual(['approved'])
    // published / failed / cancelled posts are not reviewable
    expect(tabsOf({ status: 'published', approval: block('design_approved') })).toEqual([])
    expect(tabsOf({ status: 'cancelled' })).toEqual([])

    const can = (state, o = {}) => {
      const p = mapPublicationToApprovalPost(pub({ status: 'draft', scheduledAt: null, approval: block(state), ...o }))
      return { submitContent: p.canSubmitContent, approveContent: p.canApproveContent, submitDesign: p.canSubmitDesign, approveDesign: p.canApproveDesign, schedule: p.canSchedule }
    }
    expect(can('content_review')).toEqual({ submitContent: false, approveContent: true, submitDesign: false, approveDesign: false, schedule: false })
    expect(can('content_approved')).toEqual({ submitContent: false, approveContent: false, submitDesign: true, approveDesign: false, schedule: false })
    expect(can('design_review')).toEqual({ submitContent: false, approveContent: false, submitDesign: false, approveDesign: true, schedule: false })
    expect(can('design_approved')).toEqual({ submitContent: false, approveContent: false, submitDesign: false, approveDesign: false, schedule: true })
    expect(can('design_approved', { status: 'scheduled', scheduledAt: '2099-01-01T00:00:00Z' }).schedule).toBe(false)
    const draft = mapPublicationToApprovalPost(pub({ status: 'draft', scheduledAt: null }))
    expect(draft.canSubmitContent).toBe(true)
  })

  it('APPROVAL_REQUIRED is its own failure kind; retry stays exactly what the backend says', () => {
    const f = describeFailure(pub({ status: 'failed', failureCode: 'APPROVAL_REQUIRED', failureReason: 'not approved', canRetry: false }))
    expect(f.kind).toBe('approval')
    expect(f.canRetry).toBe(false)
    expect(f.headline).toMatch(/not fully approved/)
    expect(describeFailure(pub({ status: 'failed', failureCode: 'APPROVAL_REQUIRED', canRetry: true })).canRetry).toBe(true)
  })
})

describe('AI strategy display helpers - derived only from the server state', () => {
  const doc = { version: 3, generatedAt: '2026-10-09T10:00:00.000Z' }
  it('statusView follows the server status: none / generating / failed / ready / ready-but-outdated', () => {
    expect(statusView(null).title).toBe('AI strategy')
    expect(statusView({ status: 'none', profile: { canGenerate: true } })).toMatchObject({ tone: 'neutral', title: 'No strategy yet' })
    expect(statusView({ status: 'none', profile: { canGenerate: false } }).subtitle).toMatch(/Complete your business profile/)
    expect(statusView({ status: 'generating', generation: { startedAt: '2026-10-09T10:00:00Z' } })).toMatchObject({ tone: 'working', title: 'Generating your strategy' })
    expect(statusView({ status: 'failed', strategy: null })).toMatchObject({ tone: 'error', subtitle: 'Nothing was saved' })
    expect(statusView({ status: 'failed', strategy: doc }).subtitle).toBe('Showing version 3')
    expect(statusView({ status: 'ready', strategy: doc, profile: { changed: false } })).toMatchObject({ tone: 'success', title: 'Strategy v3 ready' })
    expect(statusView({ status: 'ready', strategy: doc, profile: { changed: true } })).toMatchObject({ tone: 'warning', title: 'Strategy v3 may be out of date' })
  })

  it('labels fall back to the raw code rather than inventing a name', () => {
    expect(changeLabel('goals')).toBe('Goals')
    expect(changeLabel('business.location')).toBe('Location')
    expect(changeLabel('something.new')).toBe('something.new')
    expect(gapLabel('audience')).toBe('Audience')
    expect(gapLabel('nope')).toBe('nope')
    expect(MIX_LABELS.behind_the_scenes).toBe('Behind the scenes')
  })

  it('sortedMix orders largest first without mutating the stored order', () => {
    const mix = [{ type: 'a', percentage: 20 }, { type: 'b', percentage: 50 }, { type: 'c', percentage: 30 }]
    expect(sortedMix(mix).map((m) => m.type)).toEqual(['b', 'c', 'a'])
    expect(mix.map((m) => m.type)).toEqual(['a', 'b', 'c'])
    expect(sortedMix(undefined)).toEqual([])
  })
})
