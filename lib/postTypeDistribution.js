/**
 * Pure rebalancing helpers for the AI Strategy "Post type distribution"
 * sliders (components/social-media/PostTypeDistribution.jsx). Kept
 * separate from the page/components so the "always sums to exactly 100,
 * never negative" invariant is easy to reason about on its own.
 */

function roundToInt(n) {
  return Math.max(0, Math.round(n))
}

/** Nudges the largest entry among `adjustableIds` so the distribution sums to exactly 100. */
function fixDrift(distribution, ids, adjustableIds) {
  const total = ids.reduce((sum, id) => sum + (distribution[id] || 0), 0)
  const diff = 100 - total
  if (diff === 0 || adjustableIds.length === 0) return distribution
  const targetId = adjustableIds.reduce(
    (largest, id) => ((distribution[id] || 0) > (distribution[largest] || 0) ? id : largest),
    adjustableIds[0]
  )
  return { ...distribution, [targetId]: Math.max(0, (distribution[targetId] || 0) + diff) }
}

/** Selecting a new post type: gives it an even share, shrinks the rest proportionally to make room. */
export function addPostType(distribution, selectedIds, newId) {
  const seed = Math.round(100 / (selectedIds.length + 1))
  const remainingShare = 100 - seed
  const oldTotal = selectedIds.reduce((sum, id) => sum + (distribution[id] || 0), 0) || 1

  const next = { [newId]: seed }
  selectedIds.forEach((id) => {
    next[id] = roundToInt(((distribution[id] || 0) * remainingShare) / oldTotal)
  })
  return fixDrift(next, [...selectedIds, newId], selectedIds)
}

/** Deselecting a post type: its percentage is redistributed proportionally among what's left. */
export function removePostType(distribution, selectedIds, removedId) {
  const remaining = selectedIds.filter((id) => id !== removedId)
  if (remaining.length === 0) return {}
  if (remaining.length === 1) return { [remaining[0]]: 100 }

  const oldRemainingTotal = remaining.reduce((sum, id) => sum + (distribution[id] || 0), 0) || 1
  const next = {}
  remaining.forEach((id) => {
    next[id] = roundToInt(((distribution[id] || 0) * 100) / oldRemainingTotal)
  })
  return fixDrift(next, remaining, remaining)
}

/** Dragging one slider: the changed value is kept exact, the rest scale proportionally to absorb the difference. */
export function changeDistribution(distribution, selectedIds, changedId, rawValue) {
  const newValue = Math.min(100, Math.max(0, Math.round(rawValue)))
  const others = selectedIds.filter((id) => id !== changedId)
  if (others.length === 0) return { [changedId]: 100 }

  const remainingBudget = 100 - newValue
  const oldOthersTotal = others.reduce((sum, id) => sum + (distribution[id] || 0), 0)

  const next = { [changedId]: newValue }
  if (oldOthersTotal === 0) {
    const share = Math.floor(remainingBudget / others.length)
    others.forEach((id) => {
      next[id] = share
    })
  } else {
    others.forEach((id) => {
      next[id] = roundToInt(((distribution[id] || 0) * remainingBudget) / oldOthersTotal)
    })
  }
  return fixDrift(next, selectedIds, others)
}
