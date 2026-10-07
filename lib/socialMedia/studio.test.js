import { describe, it, expect } from 'vitest'
import {
  STUDIO_STATES, deriveStudioState, creativeLabel, readyCandidates, needsReplaceConfirmation, cleanInstruction, instructionProblem,
  chosenProductPhotos, studioErrorMessage, MAX_INSTRUCTION_LENGTH, MAX_PRODUCT_PHOTOS,
} from './studio'
import {
  studioState, studioGeneration, generatingGeneration, studioCandidate, withSelectedDesign, gatedState,
} from '@/test-utils/socialStudio'

describe('deriveStudioState - the nine states, decided only from the server data', () => {
  it('no studio data = No Content', () => expect(deriveStudioState(null)).toBe(STUDIO_STATES.NO_CONTENT))
  it('content not approved = Content Pending Approval (even when a generation exists)', () => {
    expect(deriveStudioState(gatedState())).toBe(STUDIO_STATES.CONTENT_PENDING)
    expect(deriveStudioState({ ...gatedState(), generation: studioGeneration() })).toBe(STUDIO_STATES.CONTENT_PENDING)
  })
  it('approved content and nothing generated = Ready to Generate', () => expect(deriveStudioState(studioState())).toBe(STUDIO_STATES.READY))
  it('a generation in flight = Generating', () => expect(deriveStudioState(studioState({ generation: generatingGeneration() }))).toBe(STUDIO_STATES.GENERATING))
  it('three finished designs and none on the post = Designs Ready', () => expect(deriveStudioState(studioState({ generation: studioGeneration() }))).toBe(STUDIO_STATES.DESIGNS_READY))
  it('a design on the post: in review = Design Review, approved = Design Approved', () => {
    expect(deriveStudioState(withSelectedDesign(1))).toBe(STUDIO_STATES.DESIGN_REVIEW)
    expect(deriveStudioState(withSelectedDesign(1, { approvalState: 'design_approved' }))).toBe(STUDIO_STATES.DESIGN_APPROVED)
  })
  it('a design on the post that was never submitted = Design Selected', () => {
    const s = withSelectedDesign(0, { approvalState: 'content_approved' })
    expect(deriveStudioState(s)).toBe(STUDIO_STATES.DESIGN_SELECTED)
  })
  it('a failed generation with nothing usable = Generation Failed; a failed REGENERATION keeps the earlier designs usable', () => {
    const none = studioCandidate(0, { status: 'failed', imageUrl: null, failure: { code: 'X', message: 'no' } })
    expect(deriveStudioState(studioState({ generation: studioGeneration({ status: 'failed', candidates: [none] }) }))).toBe(STUDIO_STATES.FAILED)
    expect(deriveStudioState(studioState({ generation: studioGeneration({ status: 'failed' }) }))).toBe(STUDIO_STATES.DESIGNS_READY)
  })
})

describe('studio helpers', () => {
  it('creativeLabel uses the server label, then a known direction name, then a neutral word - never a made-up style', () => {
    expect(creativeLabel({ label: 'Premium editorial', creativeType: 'x' })).toBe('Premium editorial')
    expect(creativeLabel({ creativeType: 'data_insight' })).toBe('Data / insight')
    expect(creativeLabel({})).toBe('Design')
  })

  it('readyCandidates only returns finished images', () => {
    const g = studioGeneration({ candidates: [studioCandidate(0), studioCandidate(1, { status: 'pending', imageUrl: null }), studioCandidate(2, { status: 'failed', imageUrl: null })] })
    expect(readyCandidates(g).map((c) => c.id)).toEqual(['cand-0'])
    expect(readyCandidates(null)).toEqual([])
  })

  it('replacing an approved design needs a confirmation; anything else does not', () => {
    const approved = withSelectedDesign(1, { approvalState: 'design_approved' })
    expect(needsReplaceConfirmation(approved, approved.generation.candidates[0])).toBe(true)
    expect(needsReplaceConfirmation(approved, approved.generation.candidates[1])).toBe(false)
    expect(needsReplaceConfirmation(withSelectedDesign(1), studioCandidate(0))).toBe(false)
    expect(needsReplaceConfirmation(studioState(), studioCandidate(0))).toBe(false)
  })

  it('cleanInstruction trims and collapses whitespace; empty is null', () => {
    expect(cleanInstruction('  make   it\n darker ')).toBe('make it darker')
    expect(cleanInstruction('   ')).toBeNull()
    expect(cleanInstruction(undefined)).toBeNull()
  })

  it('instructionProblem flags only an over-long instruction', () => {
    expect(instructionProblem('ok')).toBeNull()
    expect(instructionProblem('x'.repeat(MAX_INSTRUCTION_LENGTH + 1))).toMatch(/under 400/)
  })

  it('chosenProductPhotos: nothing without a product; the server default; the user override; capped', () => {
    expect(chosenProductPhotos(studioState(), null)).toBeUndefined()
    const product = { id: 'p', name: 'Kit', images: [{ mediaId: 'a', selected: true }, { mediaId: 'b', selected: false }] }
    expect(chosenProductPhotos(studioState({ product }), null)).toEqual(['a'])
    expect(chosenProductPhotos(studioState({ product }), ['b'])).toEqual(['b'])
    expect(chosenProductPhotos(studioState({ product }), [])).toBeUndefined()
    expect(chosenProductPhotos(studioState({ product }), ['a', 'b', 'c', 'd', 'e', 'f']).length).toBe(MAX_PRODUCT_PHOTOS)
  })

  it('studioErrorMessage keeps the server message and marks out-of-date refusals', () => {
    expect(studioErrorMessage({ message: 'Nope', details: { code: 'DESIGN_VERSION_MISMATCH' } })).toEqual({ code: 'DESIGN_VERSION_MISMATCH', message: 'Nope', stale: true })
    expect(studioErrorMessage({ message: 'Bad', details: { code: 'INVALID_INSTRUCTION' } }).stale).toBe(false)
    expect(studioErrorMessage(null).message).toMatch(/Nothing was changed/)
  })
})

describe('design notes', () => {
  it('every note the server can send about a design has plain wording; unknown codes are never shown', async () => {
    const { DESIGN_NOTE_TEXT } = await import('./studio')
    for (const code of ['product_photo_missing', 'logo_not_applied', 'no_supplied_figures', 'points_unavailable', 'visual_missing', 'brand_font_unavailable', 'brand_colors_missing', 'contact_unavailable', 'headline_scale_limited']) {
      expect(typeof DESIGN_NOTE_TEXT[code], code).toBe('string')
      expect(DESIGN_NOTE_TEXT[code].length).toBeGreaterThan(20)
    }
    expect(DESIGN_NOTE_TEXT.made_up_code).toBeUndefined()
    expect(Object.isFrozen(DESIGN_NOTE_TEXT)).toBe(true)
  })
})
