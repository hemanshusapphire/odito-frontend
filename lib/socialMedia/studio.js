/**
 * Creative Studio view logic. Pure functions over the server's studio state (GET /social/ai-design/studio): nothing here is data about a
 * post, a brand or a design - it only decides which of the studio's states the SERVER's data is in, and the words for it.
 */

export const STUDIO_STATES = Object.freeze({
  NO_CONTENT: 'no_content',
  CONTENT_PENDING: 'content_pending',
  READY: 'ready',
  GENERATING: 'generating',
  DESIGNS_READY: 'designs_ready',
  DESIGN_SELECTED: 'design_selected',
  DESIGN_REVIEW: 'design_review',
  DESIGN_APPROVED: 'design_approved',
  FAILED: 'failed',
})

export const STUDIO_STATE_LABEL = Object.freeze({
  no_content: 'No content',
  content_pending: 'Content pending approval',
  ready: 'Ready to generate',
  generating: 'Generating designs',
  designs_ready: 'Designs ready',
  design_selected: 'Design selected',
  design_review: 'Design review',
  design_approved: 'Design approved',
  failed: 'Generation failed',
})

export const APPROVAL_STATE_LABEL = Object.freeze({
  content_review: 'Content in review',
  content_approved: 'Content approved',
  design_review: 'Design in review',
  design_approved: 'Design approved',
})

/**
 * What a design's notes mean, in plain words. The notes are codes from the server (what the design could and could not use); these
 * sentences never include any text of the post, and each one is a fact about THIS design, not a promise.
 */
export const DESIGN_NOTE_TEXT = Object.freeze({
  product_photo_missing: 'No photo of the product was available, so this design does not show the product.',
  logo_not_applied: 'Your logo could not be placed on this design.',
  no_supplied_figures: 'No figures were supplied for this post, so no data is shown.',
  points_unavailable: 'The post has no clear list of points, so this is a photography design.',
  visual_missing: 'The photograph could not be added, so brand shapes are shown in its place.',
  brand_font_unavailable: 'Your brand font is not available for designs yet, so Poppins was used.',
  brand_colors_missing: 'No brand colours are configured, so a neutral palette was used. Set them in Business Profile.',
  contact_unavailable: 'No phone number or website is on file for this business, so none is shown.',
  headline_scale_limited: 'The headline already fills its space in this layout, so its size could not be changed.',
})

export const MAX_INSTRUCTION_LENGTH = 400
export const MAX_PRODUCT_PHOTOS = 4

/** The direction names the server uses, for a candidate that arrives without a label. */
const CREATIVE_FALLBACK_LABEL = {
  educational_list: 'Educational list',
  process_checklist: 'Process / checklist',
  premium_editorial: 'Premium editorial',
  modern_saas: 'Modern SaaS / technology',
  service_expertise: 'Service / expertise',
  announcement: 'Announcement',
  data_insight: 'Data / insight',
  product_showcase: 'Product showcase',
  quote: 'Quote',
  case_study: 'Case study',
}

export const creativeLabel = (candidate) => candidate?.label || CREATIVE_FALLBACK_LABEL[candidate?.creativeType] || 'Design'

export const readyCandidates = (generation) => (generation?.candidates || []).filter((c) => c.status === 'ready' && c.imageUrl)

/**
 * Which state the studio is in, decided only from the server's data:
 * the gate (content approved?), the generation in flight / last result, and the post's real design + approval state.
 */
export function deriveStudioState(studio) {
  if (!studio) return STUDIO_STATES.NO_CONTENT
  if (!studio.gate?.allowed) return STUDIO_STATES.CONTENT_PENDING
  const generation = studio.generation
  if (generation?.active) return STUDIO_STATES.GENERATING
  const approval = studio.content?.approvalState
  if (studio.currentDesign) {
    if (approval === 'design_approved') return STUDIO_STATES.DESIGN_APPROVED
    if (approval === 'design_review') return STUDIO_STATES.DESIGN_REVIEW
    return STUDIO_STATES.DESIGN_SELECTED
  }
  if (generation?.status === 'failed' && readyCandidates(generation).length === 0) return STUDIO_STATES.FAILED
  if (readyCandidates(generation).length > 0) return STUDIO_STATES.DESIGNS_READY
  return STUDIO_STATES.READY
}

/** Replacing the design of a post whose design is already approved must be an explicit, confirmed choice. */
export const needsReplaceConfirmation = (studio, candidate) =>
  studio?.content?.approvalState === 'design_approved' && !!studio?.currentDesign && (!candidate || !candidate.current)

/** True when this regenerate would change the design the post carries right now (the candidate is the current design). */
export const targetsCurrentDesign = (candidate) => !!candidate?.current

/** A cleaned instruction, or null when it is empty. The server validates again; this only keeps an empty box from being a "change". */
export function cleanInstruction(text) {
  const value = String(text ?? '').replace(/\s+/g, ' ').trim()
  return value ? value : null
}

export function instructionProblem(text) {
  const value = String(text ?? '')
  if (value.length > MAX_INSTRUCTION_LENGTH) return `Keep it under ${MAX_INSTRUCTION_LENGTH} characters.`
  return null
}

/** The ids of the product photos currently chosen, for the request (null when the product has none or none changed from the server's default). */
export function chosenProductPhotos(studio, overrideIds) {
  const images = studio?.product?.images || []
  if (!images.length) return undefined
  const ids = overrideIds ?? images.filter((i) => i.selected).map((i) => i.mediaId)
  return ids.length ? ids.slice(0, MAX_PRODUCT_PHOTOS) : undefined
}

/** A short, human reading of an API refusal: the server's own message plus what to do when the screen is out of date. */
export function studioErrorMessage(error, fallback = 'Something went wrong. Nothing was changed.') {
  const code = error?.details?.code || error?.code || null
  const message = error?.message || fallback
  const stale = ['VERSION_MISMATCH', 'DESIGN_VERSION_MISMATCH', 'CANDIDATE_STALE', 'GENERATION_SUPERSEDED', 'DESIGN_FILE_MISSING'].includes(code)
  return { code, message, stale }
}
