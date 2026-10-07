import { describe, it, expect } from 'vitest'
import { layoutWordCloud } from './wordCloudLayout'

const weights = [47, 45, 32, 32, 29, 28, 28, 26, 22, 22, 21, 20, 18, 18, 18, 16, 15, 14, 14, 13, 13, 13, 12, 12, 12, 12, 11, 11, 11, 10, 10, 10, 9, 9, 9, 9, 8, 8, 8, 8, 8, 7, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5]
const items = weights.map((w, i) => ({ term: `${['staff', 'cataract surgery', 'recommend', 'experience', 'gul'][i % 5]}${i}`, weight: w }))
const box = (w, canvas) => {
  const width = w.vertical ? w.fontSize * 1.05 : w.term.length * w.fontSize * 0.6 + 4
  const height = w.vertical ? w.term.length * w.fontSize * 0.6 + 4 : w.fontSize * 1.05
  return { left: w.x - width / 2, right: w.x + width / 2, top: w.y - height / 2, bottom: w.y + height / 2 }
}

describe('layoutWordCloud', () => {
  it('returns nothing for no input', () => {
    expect(layoutWordCloud([])).toEqual([])
  })

  it('is deterministic - same input, same layout, every time', () => {
    expect(layoutWordCloud(items)).toEqual(layoutWordCloud(items.map((i) => ({ ...i }))))
  })

  it('every placed word is inside the canvas', () => {
    const W = 800, H = 360
    for (const w of layoutWordCloud(items, { width: W, height: H })) {
      const b = box(w)
      expect(b.left).toBeGreaterThanOrEqual(-0.01)
      expect(b.top).toBeGreaterThanOrEqual(-0.01)
      expect(b.right).toBeLessThanOrEqual(W + 0.01)
      expect(b.bottom).toBeLessThanOrEqual(H + 0.01)
    }
  })

  it('no two words overlap', () => {
    const placed = layoutWordCloud(items)
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = box(placed[i]); const b = box(placed[j])
        const separated = a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top
        expect(separated, `${placed[i].term} / ${placed[j].term}`).toBe(true)
      }
    }
  })

  it('heavier words are set larger, and the heaviest is the biggest', () => {
    const placed = layoutWordCloud(items)
    expect(placed[0].fontSize).toBe(Math.max(...placed.map((w) => w.fontSize)))
    for (let i = 1; i < placed.length; i++) expect(placed[i].fontSize).toBeLessThanOrEqual(placed[i - 1].fontSize)
  })

  it('a realistic vocabulary fills the canvas densely (dozens of words) with some vertical words, like the reference', () => {
    const placed = layoutWordCloud(items)
    expect(placed.length).toBeGreaterThanOrEqual(35)
    expect(placed.filter((w) => w.vertical).length).toBeGreaterThanOrEqual(3)
    expect(placed[0].vertical).toBe(false) // the biggest word is never rotated
  })

  it('a word that cannot fit is dropped, not clipped', () => {
    const placed = layoutWordCloud([{ term: 'x'.repeat(200), weight: 10 }], { width: 100, height: 50 })
    expect(placed).toEqual([])
  })

  it('a single word is centred', () => {
    const [w] = layoutWordCloud([{ term: 'staff', weight: 5 }], { width: 800, height: 360 })
    expect(w.x).toBe(400)
    expect(w.y).toBe(180)
  })
})
