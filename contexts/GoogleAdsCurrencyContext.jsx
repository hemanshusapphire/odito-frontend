"use client"

import { createContext, useContext, useMemo } from 'react'
import { formatGoogleAdsCurrency, formatGoogleAdsCurrencyPrecise } from '@/lib/googleAdsFormat'

/**
 * Single source of truth for the connected Google Ads account's currency,
 * shared by every widget on the Google Ads dashboard.
 *
 * Mounted once in app/app/google-visibility/google-ads/page.jsx, wrapping
 * the entire dashboard body, fed from GET /sync-status's `currencyCode`
 * field (odito_backend GoogleConnection.google_ads_currency_code -
 * persisted at /select and refreshed at every /validate + this endpoint's
 * own read, never re-fetched from Google per-request). Any component
 * rendered inside that tree - present or future - gets the correct
 * currency automatically via useGoogleAdsCurrencyFormatter() below, with no
 * prop drilling and no per-component fallback logic to remember.
 *
 * Fallback chain (never inferred from browser locale):
 *   1. currencyCode passed to the Provider (the live/persisted account
 *      currency from GET /sync-status - see doc comment above; this IS the
 *      "account currency stored in Mongo" value, refreshed on every
 *      selection/validation, so there is no separate "live" tier beyond it
 *      in this architecture)
 *   2. 'USD', only if neither exists yet (e.g. mid-onboarding, before any
 *      account has ever been selected) - handled inside
 *      formatGoogleAdsCurrency itself, not duplicated here.
 */
const GoogleAdsCurrencyContext = createContext(null)

export function GoogleAdsCurrencyProvider({ currencyCode, children }) {
  return (
    <GoogleAdsCurrencyContext.Provider value={currencyCode || null}>
      {children}
    </GoogleAdsCurrencyContext.Provider>
  )
}

/** The resolved ISO 4217 currency code (e.g. 'INR'), or null if genuinely unavailable - components needing the raw code (rare; most should use useGoogleAdsCurrencyFormatter instead). */
export function useGoogleAdsCurrencyCode() {
  return useContext(GoogleAdsCurrencyContext)
}

/**
 * The one way Google Ads components should format money. Returns stable
 * `format`/`formatPrecise` functions already bound to the account's real
 * currency - call sites never touch a currency code or a '$' literal
 * themselves.
 *
 * const { format } = useGoogleAdsCurrencyFormatter()
 * format(85049.46)  ->  '₹85,049.46' | '$85,049.46' | '€85,049.46' ...
 */
export function useGoogleAdsCurrencyFormatter() {
  const currencyCode = useGoogleAdsCurrencyCode()
  return useMemo(() => ({
    currencyCode,
    format: (amount, opts) => formatGoogleAdsCurrency(amount, currencyCode, opts),
    formatPrecise: (amount) => formatGoogleAdsCurrencyPrecise(amount, currencyCode),
  }), [currencyCode])
}
