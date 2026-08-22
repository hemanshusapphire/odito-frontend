"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Loader2, AlertCircle, CheckCircle2, Facebook } from 'lucide-react'
import { useFacebookAccounts, useSwitchFacebookAccount } from '@/hooks/useDashboardQueries'

/**
 * Lets the user pick which already-connected Facebook Page is active,
 * WITHOUT re-triggering OAuth — this only calls POST /social/facebook/
 * switch, a pure DB operation on Pages already persisted from a prior
 * Connect. Presentation only below (a responsive card grid instead of a
 * long vertical list, for accounts where the connected Business Portfolio
 * has many Pages) — the underlying selection/switch logic is unchanged
 * from the original list version. Reuses the same "platform icon badge
 * on the avatar's corner" pattern already established in FeedCard.jsx/
 * MetaPageSelectionDialog.jsx rather than inventing a new visual language.
 */
export default function SwitchAccountDialog({ open, onOpenChange, projectId, onSwitched, onConnectAnother }) {
  const [selectedId, setSelectedId] = useState(null)
  const accountsQuery = useFacebookAccounts(projectId, { enabled: open })
  const switchMutation = useSwitchFacebookAccount(projectId)

  const accounts = accountsQuery.data?.data?.accounts || []
  const activeAccount = accounts.find((a) => a.isActive) || null
  const isLoading = accountsQuery.isLoading
  const isError = accountsQuery.isError
  const isSwitching = switchMutation.isPending

  // Default the selection to whatever is currently active every time the
  // dialog opens (or the accounts list first loads) — never leave it on a
  // stale selection from a previous open.
  useEffect(() => {
    if (open && accounts.length > 0 && selectedId === null) {
      setSelectedId(activeAccount?.id || accounts[0].id)
    }
  }, [open, accounts, activeAccount, selectedId])

  function handleOpenChange(next) {
    if (isSwitching) return // don't let the dialog close mid-switch
    if (!next) {
      switchMutation.reset()
      setSelectedId(null)
    }
    onOpenChange(next)
  }

  function handleSwitch() {
    if (!selectedId || selectedId === activeAccount?.id) return
    switchMutation.mutate(selectedId, {
      onSuccess: (res) => {
        onSwitched?.(res?.data?.account)
        onOpenChange(false)
        switchMutation.reset()
        setSelectedId(null)
      },
    })
  }

  const canSwitch = !!selectedId && selectedId !== activeAccount?.id && !isSwitching

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Wide enough for 3 cards + gaps + padding; header/footer stay
          outside the scrollable grid below so they never move. */}
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Switch Facebook Account</DialogTitle>
          {/* Modal-level indicator of the CURRENTLY ACTIVE account — derived
              from the same accountsQuery.isActive the card grid's own badge
              and the parent dashboard both read, never a separate/hardcoded
              value. This is the primary "which account is active right
              now" signal; the in-card badge below is secondary. */}
          {!isLoading && activeAccount && (
            <p className="text-sm text-muted-foreground">
              Currently connected: <span className="font-semibold text-foreground">{activeAccount.name || 'Untitled Page'}</span>
            </p>
          )}
          <DialogDescription>Select the Facebook Page you want to manage.</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading your connected Pages…</span>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {accountsQuery.error?.message || 'Could not load your connected Facebook Pages.'}
            </p>
            <Button size="sm" variant="outline" onClick={() => accountsQuery.refetch()}>
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !isError && accounts.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <Facebook className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No Facebook Pages are connected yet.</p>
          </div>
        )}

        {!isLoading && !isError && accounts.length > 0 && (
          <div className="max-h-[420px] overflow-y-auto overflow-x-hidden -mx-1 px-1 py-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {accounts.map((account) => {
                const isSelected = selectedId === account.id
                const isActive = account.isActive
                return (
                  <button
                    key={account.id}
                    type="button"
                    disabled={isSwitching}
                    onClick={() => setSelectedId(account.id)}
                    aria-pressed={isSelected}
                    className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                      isSelected
                        ? 'border-[#1877F2] bg-[#1877F2]/5'
                        : 'border-border hover:border-muted-foreground/30 hover:bg-muted/40'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium px-1.5 py-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    )}

                    <div className="relative mt-1">
                      <Avatar size="lg" className="h-14 w-14">
                        <AvatarImage src={account.picture || undefined} alt={account.name || 'Page'} />
                        <AvatarFallback className="text-base">{(account.name || '?').charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-card bg-[#1877F2]">
                        <Facebook className="h-2.5 w-2.5 text-white" />
                      </span>
                    </div>

                    <p className="text-sm font-medium truncate w-full">{account.name || 'Untitled Page'}</p>

                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${account.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                      {account.status === 'active' ? 'Connected' : 'Disconnected'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {!isLoading && !isError && accounts.length === 1 && (
          <div className="flex flex-col items-center gap-2 pt-1 text-center">
            <p className="text-xs text-muted-foreground">Only one Facebook Page is connected.</p>
            {onConnectAnother && (
              <Button size="sm" variant="ghost" onClick={() => { onOpenChange(false); onConnectAnother() }}>
                + Connect another Facebook Page
              </Button>
            )}
          </div>
        )}

        {switchMutation.isError && (
          <p className="text-xs text-destructive text-center">
            {switchMutation.error?.message || 'Failed to switch Facebook Page. Please try again.'}
          </p>
        )}

        {!isLoading && !isError && accounts.length > 0 && (
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" size="sm" disabled={isSwitching} onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" aria-label="Switch Account" disabled={!canSwitch} onClick={handleSwitch}>
              {isSwitching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Switch Account'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
