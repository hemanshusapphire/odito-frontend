"use client"

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

/**
 * Reads the redirect-back query params the backend Meta OAuth callback
 * attaches (?meta_connected=1 or ?meta_error=<code>) — same pattern
 * google-visibility/page.jsx and ConnectedAccountsCard.jsx already use for
 * their own OAuth callbacks. Extracted here (originally lived only in
 * app/app/social/page.jsx) because Settings -> Profile is now a SECOND
 * real entry point into the exact same Meta OAuth flow (via
 * metaOAuthController.js's RETURN_TARGETS 'profile' target) — this logic
 * must not be duplicated a second time, it must be shared.
 *
 * Surfaces the outcome once via the given callbacks, then strips the
 * params from the URL so a refresh doesn't re-fire them.
 */
export function useMetaOAuthRedirect({ onConnected, onError }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return
    const connected = searchParams.get('meta_connected')
    const error = searchParams.get('meta_error')

    if (connected) {
      handledRef.current = true
      onConnected?.()
    } else if (error) {
      handledRef.current = true
      onError?.(error)
    }

    if (connected || error) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('meta_connected')
      params.delete('meta_error')
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export default useMetaOAuthRedirect
