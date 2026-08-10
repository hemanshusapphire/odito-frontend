// Homepage Audit PDF — social profile presentation helper (Page 6 only).
//
// UI-only: display names + recommendation-banner text. Not part of
// homepageAuditPdfMapper.js. The mapper's _buildSocialSection() returns
// { platforms: [{platform, connected}], connectedCount, missingCount } —
// no per-item `status`/`url` strings and no `recommendation` field, so both
// are derived here from the boolean `connected` flags already provided,
// rather than reading fields that don't exist on the contract.

export const PLATFORM_DISPLAY_NAME = {
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  twitter: 'X (Twitter)',
  youtube: 'YouTube',
  instagram: 'Instagram',
};

// Fixed display order to match the approved design (Facebook, LinkedIn,
// X/Twitter, YouTube, Instagram) — the mapper's own array order
// (facebook, twitter, instagram, linkedin, youtube) is a data-collection
// order, not a presentation order.
export const PLATFORM_DISPLAY_ORDER = ['facebook', 'linkedin', 'twitter', 'youtube', 'instagram'];

/**
 * @param {Array<{platform: string, connected: boolean}>} platforms
 * @returns {string|null} Banner message, or null if nothing is missing.
 */
export function buildSocialRecommendationMessage(platforms) {
  const missingNames = (platforms || [])
    .filter((p) => !p.connected)
    .map((p) => PLATFORM_DISPLAY_NAME[p.platform] || p.platform);

  if (missingNames.length === 0) return null;

  return `Add missing social media links (${missingNames.join(', ')}) to improve social presence and SEO ranking.`;
}
