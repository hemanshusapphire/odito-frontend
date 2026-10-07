// Fixtures shaped exactly like GET /social/ai-design/studio (socialDesignStudioService.getStudioState) and the studio POST answers.
// Test data only: the studio itself has no fixtures.

const TYPES = [
  ['educational_list', 'Educational list'],
  ['premium_editorial', 'Premium editorial'],
  ['modern_saas', 'Modern SaaS / technology'],
]

export const studioCandidate = (slot, over = {}) => ({
  id: `cand-${slot}`,
  slot,
  creativeType: TYPES[slot][0],
  label: TYPES[slot][1],
  status: 'ready',
  revision: 1,
  imageUrl: `http://localhost:5000/storage/social_media/proj-1/design-${slot}.jpg`,
  width: 1536,
  height: 1024,
  logoApplied: false,
  referencePhotos: 0,
  notes: [],
  instruction: null,
  failure: null,
  attached: false,
  current: false,
  attachedDesignVersion: null,
  generatedAt: '2026-10-09T10:01:00.000Z',
  ...over,
})

export const studioGeneration = (over = {}) => ({
  id: 'gen-1',
  mode: 'studio',
  publicationId: 'pub-1',
  status: 'ready',
  active: false,
  action: 'generate_all',
  activeCandidateId: null,
  productMediaIds: [],
  candidates: [0, 1, 2].map((slot) => studioCandidate(slot)),
  failure: null,
  startedAt: '2026-10-09T10:00:00.000Z',
  finishedAt: '2026-10-09T10:01:00.000Z',
  ...over,
})

/** A generation that is still running: every candidate is pending. */
export const generatingGeneration = (over = {}) => studioGeneration({
  status: 'generating', active: true, finishedAt: null,
  candidates: [0, 1, 2].map((slot) => studioCandidate(slot, { status: 'pending', imageUrl: null, width: null, height: null })),
  ...over,
})

export const BRAND = {
  businessName: 'Acme Dental',
  logo: { available: true, url: 'http://localhost:5000/storage/social_media/proj-1/logo.png' },
  colors: { primary: '#1d4ed8', secondary: '#f59e0b', accent: null, configured: true },
  fonts: { heading: 'Poppins', body: 'Inter', isDefault: false },
  voice: null,
  tone: 'Warm',
  visualGuidelines: ['Bright, clean photography'],
}

export const EMPTY_BRAND = {
  businessName: null,
  logo: { available: false, url: null },
  colors: { primary: null, secondary: null, accent: null, configured: false },
  fonts: { heading: null, body: null, isDefault: true },
  voice: null,
  tone: null,
  visualGuidelines: [],
}

export const studioState = (over = {}) => ({
  publication: { id: 'pub-1' },
  content: {
    caption: 'Brushing for two minutes protects your smile. Book a check-up',
    hashtags: ['#DentalCare', '#HealthySmile'],
    platform: 'facebook',
    contentVersion: 1,
    designVersion: 1,
    approvalState: 'content_approved',
    status: 'draft',
  },
  gate: { allowed: true, code: null, message: null },
  plan: null,
  product: null,
  service: null,
  brand: BRAND,
  format: { platform: 'facebook', size: '1536x1024', aspectRatio: '3:2', mediaType: 'image', label: 'Facebook feed image (3:2)', plannedFormat: null, note: null },
  currentDesign: null,
  generation: null,
  ...over,
})

/** The post carries candidate `slot` as its design (after a select): design v2, in review (or approved). */
export function withSelectedDesign(slot = 1, { approvalState = 'design_review', designVersion = 2 } = {}) {
  const generation = studioGeneration({ candidates: [0, 1, 2].map((s) => (s === slot ? studioCandidate(s, { attached: true, current: true, attachedDesignVersion: designVersion }) : studioCandidate(s))) })
  return studioState({
    content: { ...studioState().content, approvalState, designVersion },
    currentDesign: { url: generation.candidates[slot].imageUrl, designVersion, approvalState, source: 'ai' },
    generation,
  })
}

export const gatedState = () => studioState({
  content: { ...studioState().content, approvalState: 'content_review' },
  gate: { allowed: false, code: 'CONTENT_NOT_APPROVED', message: 'Content approval required before creating the design.' },
})

export const startedResponse = (generation = generatingGeneration(), alreadyRunning = false) => ({ success: true, data: { status: 'generating', generationId: generation.id, alreadyRunning, generation } })
export const okResponse = (data) => ({ success: true, data })
