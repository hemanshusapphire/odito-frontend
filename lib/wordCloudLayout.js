/**
 * Deterministic word-cloud layout (no randomness, no dependency).
 *
 * Words are placed largest-first on an expanding spiral around the centre; a word
 * is accepted at the first spiral step where its bounding box is inside the
 * canvas and clear of every word already placed. A word that never fits is
 * dropped (the ranked chips beside the cloud still list it). Every ~6th word is
 * set vertically, as in the reference. Text width is estimated from the
 * character count, so the layout is identical on every machine and in tests.
 *
 * @param {{ term:string, weight:number }[]} items  sorted by weight desc
 * @returns {{ term:string, weight:number, x:number, y:number, fontSize:number, vertical:boolean, index:number }[]}
 */
export function layoutWordCloud(items, { width = 800, height = 360, minFont = 9, maxFont = 76, padding = 2, verticalEvery = 6 } = {}) {
  if (!items.length) return []
  const maxWeight = Math.max(...items.map((i) => i.weight)) || 1
  const placed = []
  const cx = width / 2
  const cy = height / 2

  const overlaps = (a, b) => Math.abs(a.x - b.x) * 2 < a.w + b.w + padding * 2 && Math.abs(a.y - b.y) * 2 < a.h + b.h + padding * 2

  items.forEach((item, index) => {
    // power curve: the most-mentioned words dominate and a long tail of small words fills the gaps (as in the reference)
    const fontSize = Math.round(minFont + (maxFont - minFont) * Math.pow(Math.max(item.weight, 0) / maxWeight, 1.8))
    const textWidth = item.term.length * fontSize * 0.6 + 4 // semibold DM Sans averages ~0.58em per character
    const vertical = index > 0 && index % verticalEvery === 3 && fontSize < 40
    const w = vertical ? fontSize * 1.05 : textWidth
    const h = vertical ? textWidth : fontSize * 1.05

    for (let step = 0; step < 3200; step++) {
      const angle = step * 0.31
      const radius = step * 0.55
      const x = cx + Math.cos(angle) * radius * 1.9 // stretch the spiral to the canvas' wide aspect
      const y = cy + Math.sin(angle) * radius
      if (x - w / 2 < 0 || x + w / 2 > width || y - h / 2 < 0 || y + h / 2 > height) continue
      const box = { x, y, w, h }
      if (placed.some((p) => overlaps(box, p))) continue
      placed.push({ ...box, term: item.term, weight: item.weight, fontSize, vertical, index })
      return
    }
  })

  return placed.map(({ term, weight, x, y, fontSize, vertical, index }) => ({
    term, weight, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, fontSize, vertical, index,
  }))
}
