import Link from 'next/link'
import { AlertTriangle, CircleCheck, CircleX, MapPin } from 'lucide-react'
import { googleConnectionLabel, formatDateTime, FRESHNESS_LABELS } from '@/lib/socialMedia/businessProfile'

const GBP_PAGE = '/app/google-visibility/business-profile'

/**
 * Three separate visual concepts, never mixed:
 *   sidebar active item  -> violet (not used for state here)
 *   platform identity    -> neutral map-pin tile for Google Business Profile (Facebook blue / Instagram gradient live on their own cards)
 *   connection state     -> green healthy / amber needs attention / red disconnected / grey not connected
 * So the whole card carries the state: a healthy connection is tinted green with a prominent status pill; a
 * connection that needs attention is amber, a disconnected one red, and one that was never made stays neutral.
 */
const STATES = {
  healthy: {
    card: 'border-emerald-200 bg-emerald-50/50', pill: 'border-emerald-300 bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500 ring-4 ring-emerald-200/70',
    panel: 'border-emerald-100 bg-white', tile: 'border-emerald-200 bg-white text-slate-600', Icon: CircleCheck,
  },
  attention: {
    card: 'border-amber-200 bg-amber-50/50', pill: 'border-amber-300 bg-amber-100 text-amber-800', dot: 'bg-amber-500 ring-4 ring-amber-200/70',
    panel: 'border-amber-100 bg-white', tile: 'border-amber-200 bg-white text-slate-600', Icon: AlertTriangle,
  },
  error: {
    card: 'border-red-200 bg-red-50/50', pill: 'border-red-300 bg-red-100 text-red-800', dot: 'bg-red-500 ring-4 ring-red-200/70',
    panel: 'border-red-100 bg-white', tile: 'border-red-200 bg-white text-slate-600', Icon: CircleX,
  },
  neutral: {
    card: 'border-slate-200 bg-white', pill: 'border-slate-200 bg-slate-50 text-slate-600', dot: 'bg-slate-300',
    panel: 'border-slate-200 bg-slate-50/60', tile: 'border-slate-200 bg-slate-100 text-slate-500', Icon: MapPin,
  },
}

/** healthy = connected, a location chosen, data synced for THAT location and not stale. Anything less is "needs attention". */
function stateFor({ status, usable, googleStatus, freshness }) {
  if (status === 'revoked') return 'error'
  if (status === 'expired') return 'attention'
  if (status === 'active') {
    const healthy = usable && googleStatus?.locationSelected && googleStatus?.hasSyncedData && googleStatus?.dataMatchesSelectedLocation !== false && freshness !== 'stale'
    return healthy ? 'healthy' : 'attention'
  }
  return 'neutral'
}

/**
 * Google Business Profile CONNECTION card — connection only: status, connected account, location, last sync and
 * health. It shows no business details (those live in Business Profile, with their source). Google Business Profile
 * is a business DATA SOURCE, not a publishing account, so it is deliberately not styled like the Facebook /
 * Instagram cards. Purely a view of the existing GBP integration: connecting, picking a location and syncing all
 * happen on the existing Google Business Profile page (no second OAuth flow here), and nothing on this card can
 * change Google. Every value comes from the real connection status; nothing is hardcoded.
 * `locationName` is the business name Google returned for the selected location, when there is one.
 */
export function GoogleBusinessStatus({ googleStatus, meta, locationName = null }) {
  const label = googleConnectionLabel(googleStatus)
  const status = googleStatus?.connectionStatus
  const usable = !!meta?.hasGoogleBusinessProfile
  const syncedAt = formatDateTime(meta?.lastGoogleSyncAt)
  const freshness = meta?.freshness?.status
  const state = stateFor({ status, usable, googleStatus, freshness })
  const tone = STATES[state]
  const StatusIcon = tone.Icon

  let cta = null
  if (status === 'expired') cta = 'Reconnect Google Business Profile'
  else if (!status || status === 'not_connected' || status === 'revoked') cta = 'Connect Google Business Profile'
  else if (!googleStatus.locationSelected) cta = 'Choose a business location'
  else if (googleStatus.dataMatchesSelectedLocation === false || freshness === 'stale' || !googleStatus.hasSyncedData) cta = 'Open Google Business Profile to sync'
  else cta = 'Manage Google Business Profile'
  const actionNeeded = state !== 'healthy' // anything but a healthy connection has a next step, so it gets the primary button

  const freshnessText = freshness && freshness !== 'unknown' ? FRESHNESS_LABELS[freshness] : null
  const showAccount = status === 'active' && googleStatus?.googleEmail
  const showPanel = usable || showAccount

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${tone.card}`} data-testid="gbp-status" data-state={state}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${tone.tile}`}><MapPin className="h-5 w-5" /></span>
          <h3 className="text-sm font-bold text-slate-900">Google Business Profile</h3>
        </div>
        <span data-testid="gbp-connection-label" className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${tone.pill}`}>
          <span aria-hidden className={`h-2 w-2 rounded-full ${tone.dot}`} />
          {label}
        </span>
      </div>

      {showPanel ? (
        <div className={`mt-4 rounded-xl border p-3.5 ${tone.panel}`} data-testid="gbp-details">
          {usable && locationName && (
            <p data-testid="gbp-location" className="text-sm text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Location</span>{' '}
              <span className="block text-base font-semibold text-slate-900">{locationName}</span>
            </p>
          )}
          {showAccount && <p className="mt-0.5 text-sm text-slate-500">Connected as {googleStatus.googleEmail}</p>}
          {usable && (
            <p data-testid="gbp-sync" className={`flex flex-wrap items-center gap-x-1.5 text-sm text-slate-500 ${locationName || showAccount ? 'mt-3' : ''}`}>
              <StatusIcon aria-hidden className={`h-4 w-4 shrink-0 ${state === 'healthy' ? 'text-emerald-600' : state === 'attention' ? 'text-amber-600' : 'text-red-600'}`} />
              <span>
                {syncedAt ? `Last synced ${syncedAt}` : 'Synced'}
                {freshnessText ? ' · ' : ''}
                {freshnessText && <span className={`font-semibold ${state === 'healthy' ? 'text-emerald-700' : 'text-amber-700'}`}>{freshnessText}</span>}
              </span>
            </p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          Connect Google Business Profile to give Odito your verified business details. Until then Odito uses what your project and website say.
        </p>
      )}

      <div className="mt-3 space-y-1 text-sm">
        {googleStatus?.dataMatchesSelectedLocation === false && (
          <p role="status" className="text-amber-700">The synced data belongs to a previously selected location, so it isn&apos;t used until you sync again.</p>
        )}
        {status === 'expired' && usable && <p className="text-amber-700">Showing the last synced data. Reconnect to refresh it.</p>}
        {status === 'expired' && !usable && <p className="text-amber-700">The Google connection expired. Reconnect to keep your business details up to date.</p>}
        {status === 'revoked' && <p className="text-red-700">Google access was removed. Connect again to use your Google business details.</p>}
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          href={GBP_PAGE}
          className={actionNeeded
            ? 'rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800'
            : 'rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50'}
        >
          {cta}
        </Link>
      </div>
    </div>
  )
}

export default GoogleBusinessStatus
