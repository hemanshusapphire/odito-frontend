// Homepage Audit PDF — score presentation helper (Page 1 only).
//
// UI-only: turns a numeric score into a tier label + description sentence
// for display. Deliberately NOT part of homepageAuditPdfMapper.js — the
// mapper only ever returns numbers (scores.computed.overallScore/
// overallGrade), never presentation copy. This file is the "presentation
// helper inside the print app" called for instead.
//
// Tier BOUNDARIES mirror the canonical scoreBands (A>=85, B>=70, C>=50,
// else F) already established in:
//   - frontend/lib/homepageAudit/constants.js
//   - video/shared/homepageAuditConstants.js
//   - odito_backend/src/modules/homepageAuditPdf/constants/homepageAuditConstants.js
// This is a 4th, MINIMAL, local copy of just the boundary check — not the
// full shared module — because frontend/pdf/ is a separate CRA app whose
// module-scope restrictions prevent importing across frontend/lib/ without
// reconfiguring the build. If this print app grows beyond Page 1, promote
// this to a full mirrored copy like the other three rather than letting
// more logic accumulate here ad hoc.
//
// The LABEL TEXT below is new — it does not exist in any of the three
// canonical files, by design (presentation only). Tier wording/copy is
// inferred from the one confirmed data point in the approved Page 1 design
// (score 65 -> "Average" / "Good performance with room for improvement")
// and extrapolated for the other three tiers — flagged for design review.

function getScoreTier(score) {
  const s = typeof score === 'number' && !Number.isNaN(score) ? score : 0;
  if (s >= 85) return 'excellent';
  if (s >= 70) return 'good';
  if (s >= 50) return 'needs-improvement';
  return 'poor';
}

const TIER_PRESENTATION = {
  excellent: {
    label: 'Excellent',
    description: 'Outstanding performance across all key audit areas.',
  },
  good: {
    label: 'Good',
    description: 'Strong performance with a few targeted opportunities.',
  },
  'needs-improvement': {
    label: 'Average',
    description: 'Good performance with room for improvement.',
  },
  poor: {
    label: 'Needs Work',
    description: 'Significant improvements required across key audit areas.',
  },
};

/**
 * @param {number} score - pdfData.scores.computed.overallScore
 * @returns {{ label: string, description: string }}
 */
export function getScorePresentation(score) {
  const tier = getScoreTier(score);
  return TIER_PRESENTATION[tier];
}
