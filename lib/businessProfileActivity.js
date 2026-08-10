import { formatRelativeTime } from './formatRelativeTime'

/**
 * Recent Activity, built entirely from real Odito sync timestamps - Google
 * exposes no general activity/audit-log API for Business Profile (see the
 * forensic research report). Never fabricated: an event only appears here if
 * its underlying timestamp is present.
 */
export function buildRecentActivityFromSyncTimestamps(details, connectionLastSyncAt) {
  const events = []

  if (connectionLastSyncAt) {
    events.push({
      id: 'sync',
      text: 'Business profile synced with Google',
      time: connectionLastSyncAt,
      color: '#3b82f6',
    })
  }
  if (details?.syncTimestamps?.details) {
    events.push({
      id: 'details',
      text: 'Profile details (hours, address, categories) updated',
      time: details.syncTimestamps.details,
      color: '#14b8a6',
    })
  }
  if (details?.syncTimestamps?.reviews) {
    events.push({
      id: 'reviews',
      text: 'Reviews synced from Google',
      time: details.syncTimestamps.reviews,
      color: '#8b5cf6',
    })
  }

  return events
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .map((e) => ({ id: e.id, text: e.text, timestamp: formatRelativeTime(e.time), color: e.color }))
}
