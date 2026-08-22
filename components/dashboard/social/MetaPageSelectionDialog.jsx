"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Loader2, AlertCircle, Inbox, CheckCircle2, Instagram } from 'lucide-react'
import { useMetaPages, useSelectMetaPage, useRetryMetaInstagramDiscovery } from '@/hooks/useDashboardQueries'

// Instagram discovery failure reasons that mean "something went wrong, try
// again" — NOT_CONNECTED is deliberately excluded: a Page genuinely having
// no linked Instagram account is a normal outcome, not a retryable error.
const RETRYABLE_INSTAGRAM_REASONS = new Set(['ACCESS_DENIED', 'DISCOVERY_FAILED', 'PROFILE_FETCH_FAILED', 'INVALID_PAGE_CONNECTION'])

/**
 * Shown right after the Meta OAuth redirect returns with ?meta_connected=1.
 * Step 1: lists the real Facebook Pages available to whatever Meta account
 * just completed consent and lets the user pick exactly one. Step 2: once
 * selected, shows the real connection result for BOTH Facebook (always
 * connected at this point) and Instagram (connected / not linked / needs
 * retry) — Phase 3 runs Instagram discovery automatically right after the
 * Facebook connection succeeds. Only ever displays safe fields
 * (name/username/category/picture) — the backend never returns a token.
 */
export default function MetaPageSelectionDialog({ open, onOpenChange, projectId, onConnected }) {
  const [selectedPage, setSelectedPage] = useState(null) // { id, name } once chosen
  const [connectionResult, setConnectionResult] = useState(null) // { facebook, instagram } once selectMetaPage resolves
  const pagesQuery = useMetaPages(projectId, { enabled: open && !connectionResult })
  const selectMutation = useSelectMetaPage(projectId)
  const retryInstagramMutation = useRetryMetaInstagramDiscovery(projectId)

  const pages = pagesQuery.data?.data?.pages || []
  const isLoading = pagesQuery.isLoading
  const isError = pagesQuery.isError
  const isSaving = selectMutation.isPending

  function handleSelect(page) {
    setSelectedPage(page)
    selectMutation.mutate(page.id, {
      onSuccess: (res) => {
        setConnectionResult(res?.data || null)
        onConnected?.(page.id)
      },
      onError: () => setSelectedPage(null),
    })
  }

  function handleRetryInstagram() {
    if (!selectedPage) return
    retryInstagramMutation.mutate(selectedPage.id, {
      onSuccess: (res) => {
        setConnectionResult((prev) => ({ ...prev, instagram: res?.data?.instagram || prev?.instagram }))
      },
    })
  }

  function reset() {
    selectMutation.reset()
    retryInstagramMutation.reset()
    setSelectedPage(null)
    setConnectionResult(null)
  }

  function handleOpenChange(next) {
    if (isSaving) return // don't let the dialog close mid-save
    if (!next) reset()
    onOpenChange(next)
  }

  function handleDone() {
    reset()
    onOpenChange(false)
  }

  const instagram = connectionResult?.instagram
  const instagramFailed = instagram && !instagram.connected && instagram.reason && RETRYABLE_INSTAGRAM_REASONS.has(instagram.reason)
  const isRetryingInstagram = retryInstagramMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{connectionResult ? 'Connection result' : 'Choose a Facebook Page'}</DialogTitle>
          <DialogDescription>
            {connectionResult
              ? `Here's what got connected for ${selectedPage?.name || 'that Page'}.`
              : "Select the Page you'd like to connect to this project."}
          </DialogDescription>
        </DialogHeader>

        {connectionResult ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#1877F2]/10 text-[#1877F2]">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{connectionResult.facebook?.accountName || selectedPage?.name}</p>
                  <p className="text-xs text-muted-foreground">Facebook Page</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" /> Connected
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#E4405F]/10 text-[#E4405F]">
                  <Instagram className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {instagram?.connected ? `@${instagram.username || 'instagram'}` : 'Instagram'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {instagram?.connected
                      ? 'Linked via this Page'
                      : instagram?.reason === 'NOT_CONNECTED'
                        ? 'No Instagram account linked to this Page'
                        : isRetryingInstagram
                          ? 'Checking again…'
                          : 'Could not check for a linked Instagram account'}
                  </p>
                </div>
              </div>

              {instagram?.connected ? (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                </span>
              ) : instagramFailed ? (
                <Button size="sm" variant="outline" disabled={isRetryingInstagram} onClick={handleRetryInstagram} className="shrink-0">
                  {isRetryingInstagram ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Retry'}
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground shrink-0">Not connected</span>
              )}
            </div>

            <Button size="sm" className="mt-2" onClick={handleDone}>Done</Button>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading your Facebook Pages…</span>
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <p className="text-sm text-muted-foreground">
                  {pagesQuery.error?.message || 'Could not load your Facebook Pages. The connection may have expired.'}
                </p>
                <Button size="sm" variant="outline" onClick={() => pagesQuery.refetch()}>
                  Try again
                </Button>
              </div>
            )}

            {!isLoading && !isError && pages.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                <Inbox className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No Facebook Pages were found for that account. You need to manage at least one Page to connect it here.
                </p>
              </div>
            )}

            {!isLoading && !isError && pages.length > 0 && (
              <div className="flex flex-col gap-2">
                {pages.map((page) => {
                  const isThisSaving = selectedPage?.id === page.id && isSaving
                  return (
                    <div key={page.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar size="sm">
                          <AvatarImage src={page.picture || undefined} alt={page.name || 'Page'} />
                          <AvatarFallback>{(page.name || '?').charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{page.name || 'Untitled Page'}</p>
                          {page.category && <p className="text-xs text-muted-foreground truncate">{page.category}</p>}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isSaving}
                        onClick={() => handleSelect(page)}
                        className="shrink-0"
                      >
                        {isThisSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Connect'}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}

            {selectMutation.isError && (
              <p className="text-xs text-destructive text-center">
                {selectMutation.error?.message || `Failed to connect ${selectedPage?.name || 'that Page'}. Please try again.`}
              </p>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
