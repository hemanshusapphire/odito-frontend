/** Shared "2 min ago" / "3h ago" / date formatter, used anywhere a sync or event timestamp is displayed. */
export function formatRelativeTime(isoString) {
  if (!isoString) return null
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffMin = Math.round(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDays = Math.round(diffHr / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(isoString).toLocaleDateString(undefined, { dateStyle: 'medium' })
}
