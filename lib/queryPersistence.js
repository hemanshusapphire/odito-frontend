/**
 * Social data that must NEVER come back from the persisted (localStorage) cache after a reload: it changes on the server
 * without anyone on the page (the scheduler publishes, a generation finishes) and an edit made on another screen only marks
 * these lists invalid in memory - the persisted copy would look fresh for the whole staleTime and show, for example, a post as
 * scheduled minutes after its schedule was removed. They are cheap to refetch.
 */
const VOLATILE_SOCIAL_KEYS = new Set(['publishing', 'ai-content', 'ai-design', 'studio'])

/** What may be written to the persisted cache. */
export function shouldPersistQuery(query) {
  const key = query.queryKey
  if (Array.isArray(key) && key[0] === 'social' && VOLATILE_SOCIAL_KEYS.has(key[1])) return false
  return query.state.status === 'success' && !!query.state.data
}
