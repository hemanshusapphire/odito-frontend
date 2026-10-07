/**
 * TEST-ONLY fixtures shaped exactly like GET .../reviews/analytics. Not imported
 * by any component, so none of this can reach the product bundle.
 */

export const kw = (term, reviewCount, o = {}) => ({
  term, reviewCount, percentage: Math.round((reviewCount / 100) * 10000) / 100, mentions: reviewCount + 2,
  positive: reviewCount, neutral: 0, negative: 0, score: reviewCount * 1.2, ...o,
})

export const keywords = (over = {}) => ({
  status: 'ok',
  basis: { reviewsWithText: 100, minWordReviews: 2, languages: ['en'], excludedBrandTerms: ['krishna', 'eye'] },
  words: [kw('staff', 60), kw('doctor', 40), kw('surgery', 20), kw('waiting', 42, { positive: 4, neutral: 5, negative: 33, score: 30 })],
  phrases: [kw('cataract surgery', 30), kw('waiting time', 12, { positive: 1, neutral: 1, negative: 10 })],
  ...over,
})

export const theme = (id, name, reviewCount, positive, neutral, negative) => ({
  id, name, reviewCount, percentage: Math.round((reviewCount / 100) * 10000) / 100, positive, neutral, negative,
  positivePercent: Math.round((positive / reviewCount) * 10000) / 100,
  neutralPercent: Math.round((neutral / reviewCount) * 10000) / 100,
  negativePercent: Math.round((negative / reviewCount) * 10000) / 100,
})

export const themes = (over = {}) => ({
  status: 'ok', reviewsAnalysed: 100,
  baseline: { positive: 90, neutral: 3, negative: 7, positivePercent: 90, neutralPercent: 3, negativePercent: 7 },
  items: [theme('doctors', 'Doctors', 80, 78, 1, 1), theme('staff', 'Staff & Team', 60, 55, 3, 2), theme('waiting', 'Waiting & Appointments', 42, 4, 5, 33)],
  ...over,
})

// ── comparison ───────────────────────────────────────────────────────────────
const metric = (key, label, kind, current, previous, over = {}) => ({ key, label, kind, current, previous, status: 'ok', ...over })
export const countMetric = (key, label, current, previous, favorable) => {
  const abs = current - previous
  const pc = previous === 0 ? null : Math.round(((current - previous) / previous) * 10000) / 100
  return metric(key, label, 'count', current, previous, {
    absoluteChange: abs, percentageChange: pc,
    percentageChangeState: previous === 0 ? (current === 0 ? 'unchanged' : 'new') : abs === 0 ? 'unchanged' : 'changed',
    trend: abs > 0 ? 'up' : abs < 0 ? 'down' : 'flat',
    assessment: abs === 0 ? 'unchanged' : favorable === 'none' ? 'neutral' : (abs > 0) === (favorable === 'up') ? 'improved' : 'worsened',
  })
}
export const comparisonMetrics = (over = {}) => ({
  totalReviews: countMetric('totalReviews', 'Total Reviews', 1053, 1020, 'up'),
  oneStar: countMetric('oneStar', '1 star', 17, 18, 'down'),
  twoStar: countMetric('twoStar', '2 stars', 4, 4, 'down'),
  threeStar: countMetric('threeStar', '3 stars', 6, 6, 'none'),
  fourStar: countMetric('fourStar', '4 stars', 48, 48, 'up'),
  fiveStar: countMetric('fiveStar', '5 stars', 977, 940, 'up'),
  withText: countMetric('withText', 'With Text', 900, 870, 'up'),
  withoutText: countMetric('withoutText', 'Without Text', 153, 150, 'none'),
  responded: countMetric('responded', 'Responded', 1049, 1000, 'up'),
  notResponded: countMetric('notResponded', 'Not Responded', 4, 20, 'down'),
  averageRating: metric('averageRating', 'Average Rating', 'rating', 4.87, 4.82, { absoluteChange: 0.05, percentageChange: 1.04, percentageChangeState: 'changed', trend: 'up', assessment: 'improved' }),
  responseRate: metric('responseRate', 'Response Rate', 'rate', 99.62, 98.7, { percentagePointChange: 0.92, trend: 'up', assessment: 'improved' }),
  positive: countMetric('positive', 'Positive', 1026, 990, 'up'),
  neutral: countMetric('neutral', 'Neutral', 6, 6, 'none'),
  negative: countMetric('negative', 'Negative', 21, 24, 'down'),
  ...over,
})

export const period = (startDate, endDate, over = {}) => ({
  startDate, endDate, lengthDays: 7, kind: 'range', asOfDate: endDate, quality: 'full',
  coverage: { expectedDays: 7, snapshotDays: 7, percent: 100, firstSnapshotDate: startDate, lastSnapshotDate: endDate, missingDays: 0, hasStartSnapshot: true, hasEndSnapshot: true, endGapDays: 0, excludedOtherTimezone: 0 },
  ...over,
})

export const availablePart = (cur, prev, over = {}) => ({
  status: 'available', currentPeriod: cur, previousPeriod: prev, equalLength: cur.lengthDays === prev.lengthDays,
  coverage: { current: 100, previous: 100 },
  rules: { currentVersion: 1, previousVersion: 1, compatible: true, affectedMetrics: [] },
  metrics: comparisonMetrics(), ...over,
})

export const insufficientPart = (kind, cur, prev, blockers) => ({
  status: 'insufficient_history', currentPeriod: cur, previousPeriod: prev, equalLength: true, reason: blockers[0].code, blockers,
  message: kind === 'mom'
    ? 'MoM comparison will be available once both the current and previous comparison periods have snapshot coverage.'
    : 'YoY comparison requires historical snapshots from the comparison period.',
})

export const comparison = (over = {}) => ({
  status: 'available', rangeKey: '7d', timezone: 'UTC', historyStartsOn: '2025-01-01',
  rules: { minCoveragePercent: 50, endToleranceDays: 3, ruleVersion: 1 },
  mom: availablePart(period('2026-10-01', '2026-10-07'), period('2026-09-01', '2026-09-07')),
  yoy: availablePart(period('2026-10-01', '2026-10-07'), period('2025-10-01', '2025-10-07'), { metrics: comparisonMetrics({ totalReviews: countMetric('totalReviews', 'Total Reviews', 1053, 700, 'up') }) }),
  ...over,
})

/** The real situation today: one snapshot exists, so neither comparison has history. */
export const insufficientComparison = () => {
  const cur = period('2026-10-01', '2026-10-07', { quality: 'insufficient', coverage: { ...period('a', 'b').coverage, snapshotDays: 1, percent: 14.29, missingDays: 6 } })
  const none = (a, b) => period(a, b, { quality: 'none', asOfDate: null, coverage: { ...period('a', 'b').coverage, snapshotDays: 0, percent: 0, firstSnapshotDate: null, lastSnapshotDate: null, missingDays: 7 } })
  const blockers = [{ period: 'current', code: 'low_coverage' }, { period: 'previous', code: 'no_snapshots' }]
  return comparison({
    status: 'insufficient_history', historyStartsOn: '2026-10-07',
    mom: insufficientPart('mom', cur, none('2026-09-01', '2026-09-07'), blockers),
    yoy: insufficientPart('yoy', cur, none('2025-10-01', '2025-10-07'), blockers),
  })
}

// ── whole payload ────────────────────────────────────────────────────────────
export const payload = (over = {}) => ({
  available: true,
  range: { key: '90d', start: '2026-07-10T00:00:00.000Z', end: '2026-10-07T00:00:00.000Z', startDate: '2026-07-10', endDate: '2026-10-07', timezone: 'Asia/Kolkata', bucket: 'week' },
  overview: {
    lifetime: { totalReviews: 1052, averageRating: 4.87, withText: 900, withoutText: 152 },
    period: { totalReviews: 101, averageRating: 4.81, withText: 87, withoutText: 14 },
    google: { totalReviewCount: 1053, averageRating: 4.9, lastSyncedAt: '2026-10-06T10:26:45Z' },
  },
  ratings: {
    period: [
      { stars: 5, count: 90, percent: 89.11 }, { stars: 4, count: 8, percent: 7.92 },
      { stars: 3, count: 1, percent: 0.99 }, { stars: 2, count: 1, percent: 0.99 }, { stars: 1, count: 1, percent: 0.99 },
    ],
    lifetime: [],
    series: [
      { bucket: '2026-09-28', one: 0, two: 0, three: 0, four: 0, five: 0 },
      { bucket: '2026-10-05', one: 1, two: 1, three: 1, four: 8, five: 90 },
    ],
  },
  trends: [{ bucket: '2026-09-28', reviewCount: 0, averageRating: null }, { bucket: '2026-10-05', reviewCount: 101, averageRating: 4.81 }],
  glance: {
    periodReviews: 101, lifetimeReviews: 1052,
    treatment: { respondedPercent: 100, notRespondedPercent: 0 },
    last7Days: { positive: 8, neutral: 0, negative: 1, total: 9 },
    last30Days: { positive: 17, neutral: 0, negative: 2, total: 19 },
  },
  response: {
    period: { total: 101, responded: 99, notResponded: 2, responseRate: 98.02 },
    lifetime: { total: 1052, responded: 1048, notResponded: 4, responseRate: 99.62 },
  },
  distribution: { totals: { withText: 87, withoutText: 14 }, series: [{ bucket: '2026-10-05', withText: 5, withoutText: 1 }] },
  sentiment: {
    period: { positive: 98, neutral: 1, negative: 2, total: 101, positivePercent: 97.03, neutralPercent: 0.99, negativePercent: 1.98 },
    lifetime: {},
    basis: { storedLabels: 0, derivedFromRating: 1052 },
    timeline: [{ bucket: '2026-10-05', positive: 5, neutral: 0, negative: 1, total: 6 }],
  },
  keywords: keywords(),
  themes: themes(),
  comparison: insufficientComparison(),
  ...over,
})
