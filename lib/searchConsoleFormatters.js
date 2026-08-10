/**
 * Human-readable labels for the raw dimension values Google's Search
 * Analytics API returns for the country/device/searchAppearance
 * dimensions. Falls back to a generic transform (never blocks on an
 * unmapped value) rather than needing an exhaustive/maintained list.
 */

// Common ISO 3166-1 alpha-3 codes (lowercase, as GSC returns them) - not
// exhaustive, just the countries that account for the vast majority of
// traffic on typical sites. Unmapped codes fall back to their uppercased
// code, which is still meaningful (e.g. "ZWE") rather than blank.
const COUNTRY_NAMES = {
  usa: 'United States', gbr: 'United Kingdom', can: 'Canada', aus: 'Australia',
  ind: 'India', deu: 'Germany', fra: 'France', esp: 'Spain', ita: 'Italy',
  nld: 'Netherlands', bra: 'Brazil', mex: 'Mexico', jpn: 'Japan', chn: 'China',
  kor: 'South Korea', rus: 'Russia', zaf: 'South Africa', nga: 'Nigeria',
  phl: 'Philippines', idn: 'Indonesia', pak: 'Pakistan', bgd: 'Bangladesh',
  vnm: 'Vietnam', tha: 'Thailand', mys: 'Malaysia', sgp: 'Singapore',
  are: 'United Arab Emirates', sau: 'Saudi Arabia', egy: 'Egypt', tur: 'Turkey',
  pol: 'Poland', ukr: 'Ukraine', swe: 'Sweden', nor: 'Norway', dnk: 'Denmark',
  fin: 'Finland', che: 'Switzerland', aut: 'Austria', bel: 'Belgium',
  irl: 'Ireland', prt: 'Portugal', grc: 'Greece', nzl: 'New Zealand',
  arg: 'Argentina', chl: 'Chile', col: 'Colombia', per: 'Peru', isr: 'Israel',
};

export function formatCountryLabel(code) {
  if (!code) return 'Unknown'
  const key = code.toLowerCase()
  return COUNTRY_NAMES[key] || code.toUpperCase()
}

const DEVICE_LABELS = {
  DESKTOP: 'Desktop',
  MOBILE: 'Mobile',
  TABLET: 'Tablet',
}

export function formatDeviceLabel(code) {
  if (!code) return 'Unknown'
  return DEVICE_LABELS[code.toUpperCase()] || code
}

const SEARCH_APPEARANCE_LABELS = {
  AMP_BLUE_LINK: 'AMP',
  AMP_TOP_STORIES: 'Top Stories (AMP)',
  RICHCARD: 'Rich Result',
  VIDEO: 'Video',
  WEB_LITE: 'Web (Lite)',
  PRODUCT_SNIPPETS: 'Product Snippet',
  SUBSCRIBED_CONTENT: 'Subscribed Content',
  ORGANIC_SHOPPING: 'Shopping',
  REVIEW_SNIPPET: 'Review Snippet',
  MERCHANT_LISTING: 'Merchant Listing',
  EDUCATION_Q_AND_A: 'Q&A',
  PRACTICE_PROBLEMS: 'Practice Problems',
}

export function formatSearchAppearanceLabel(code) {
  if (!code) return 'Web Results'
  return SEARCH_APPEARANCE_LABELS[code.toUpperCase()]
    || code.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}
