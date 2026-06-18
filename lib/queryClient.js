"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { useState } from 'react'

// Create persister lazily (only in browser)
const persister =
  typeof window !== 'undefined'
    ? createSyncStoragePersister({
        storage: window.localStorage,
        key: 'odito-query-cache',
        // Throttle writes to prevent performance issues
        throttleTime: 1000,
      })
    : undefined

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data remains fresh for 5 minutes (default tier)
        staleTime: 5 * 60 * 1000,
        // Cache persists for 15 minutes
        gcTime: 15 * 60 * 1000,
        // Don't refetch when window regains focus
        refetchOnWindowFocus: false,
        // Retry failed requests 2 times
        retry: 2,
        // Exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000),
        throwOnError: false,
      },
    },
  })
}

/**
 * Module-level singleton QueryClient.
 * 
 * This is intentionally a singleton for client-side use.
 * It is safe because:
 * 1. "use client" ensures this only runs in the browser
 * 2. There is only one browser tab = one user = one client
 * 3. Contexts (AuthContext, ProjectContext) need direct access
 *    for cache operations (clear, invalidate) outside React render
 * 
 * Note: For SSR (server components), this is never accessed.
 */
let browserQueryClient = undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new client
    return makeQueryClient()
  }
  // Browser: reuse the same client
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

// Re-export for backwards compatibility with contexts
export const queryClient = typeof window !== 'undefined' ? getQueryClient() : undefined

/**
 * QueryProvider — wraps app with QueryClient + optional persistence.
 */
export function QueryProvider({ children }) {
  const [client] = useState(getQueryClient)

  if (persister) {
    return (
      <PersistQueryClientProvider
        client={client}
        persistOptions={{
          persister,
          dehydrateOptions: {
            shouldDehydrateQuery: (query) => {
              return query.state.status === 'success' && !!query.state.data
            },
          },
          maxAge: 24 * 60 * 60 * 1000,
        }}
      >
        {children}
      </PersistQueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  )
}
