"use client"

import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Search, AlertCircle, CheckCircle2 } from 'lucide-react'

const STATUS_VARIANT = {
  ENABLED: 'success',
  SUSPENDED: 'warning',
  CANCELED: 'critical',
  CLOSED: 'critical',
}

function StatusBadge({ status }) {
  if (!status) return <Badge variant="outline">Unknown</Badge>
  return (
    <Badge variant={STATUS_VARIANT[status] || 'outline'} className="text-[10px] uppercase tracking-wide">
      {status.replace(/_/g, ' ').toLowerCase()}
    </Badge>
  )
}

/**
 * State 3 of the Google Ads connect flow: account selection. Purely
 * presentational - all data-fetching/mutation orchestration lives in
 * page.jsx. Adapted from SearchConsoleSetupPanel.jsx's flat-list shape, but
 * with a genuine search + select + confirm flow (rather than one-click
 * select-and-go) since GET /google-ads/accounts returns richer fields
 * (name, customerId, manager, currency, timezone, status) worth showing in
 * a table, and Google Ads accounts more frequently number more than one
 * (MCC-expanded lists) than Search Console's typically-single site.
 */
export default function GoogleAdsSetupPanel({
  loading,
  error,
  onRetry,
  accounts,
  onConfirm,
  confirming,
}) {
  const [search, setSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return accounts || []
    return (accounts || []).filter((acct) =>
      (acct.name || '').toLowerCase().includes(q) || acct.customerId.includes(q)
    )
  }, [accounts, search])

  const selectedAccount = (accounts || []).find((acct) => acct.customerId === selectedCustomerId)

  if (loading) {
    return (
      <Card className="p-10 flex flex-col items-center text-center gap-3 min-w-0">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading your Google Ads accounts…</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-10 flex flex-col items-center text-center gap-3 min-w-0">
        <AlertCircle className="h-6 w-6 text-red-500" />
        <p className="text-sm text-muted-foreground">Couldn't load your Google Ads accounts.</p>
        <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>
      </Card>
    )
  }

  if (!accounts?.length) {
    return (
      <Card className="p-10 flex flex-col items-center text-center gap-3 min-w-0">
        <Search className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium">No Google Ads accounts found</p>
        <p className="text-xs text-muted-foreground max-w-sm">
          The connected Google account has no accessible Google Ads accounts. Make sure you approved access to the
          right account during the connection step.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6 min-w-0">
      <h3 className="text-sm font-semibold">Select a Google Ads account</h3>
      <p className="text-xs text-muted-foreground mt-0.5">Choose which account to sync and show on this page.</p>

      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or customer ID…"
          className="pl-9"
        />
      </div>

      <div className="mt-4 border rounded-lg overflow-hidden min-w-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-xs text-muted-foreground uppercase tracking-wide">
                <th className="text-left font-medium px-4 py-2.5">Account</th>
                <th className="text-left font-medium px-4 py-2.5">Customer ID</th>
                <th className="text-left font-medium px-4 py-2.5">Manager</th>
                <th className="text-left font-medium px-4 py-2.5">Currency</th>
                <th className="text-left font-medium px-4 py-2.5">Timezone</th>
                <th className="text-left font-medium px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((acct) => {
                const isSelected = acct.customerId === selectedCustomerId
                return (
                  <tr
                    key={acct.customerId}
                    onClick={() => setSelectedCustomerId(acct.customerId)}
                    className={`border-b last:border-0 cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/5' : 'hover:bg-muted/40'
                    }`}
                  >
                    <td className="px-4 py-2.5 font-medium truncate max-w-[220px]">
                      <div className="flex items-center gap-2">
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                        <span className="truncate">{acct.name || 'Unnamed account'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{acct.customerId}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{acct.loginCustomerId || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{acct.currencyCode || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{acct.timeZone || '—'}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={acct.status} /></td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No accounts match "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-4">
        {selectedAccount && (
          <p className="text-xs text-muted-foreground mr-auto">
            Selected: <span className="font-medium text-foreground">{selectedAccount.name || selectedAccount.customerId}</span>
          </p>
        )}
        <Button
          disabled={!selectedCustomerId || confirming}
          onClick={() => onConfirm(selectedCustomerId, selectedAccount?.loginCustomerId || null)}
          className="gap-2"
        >
          {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {confirming ? 'Connecting…' : 'Confirm & Connect'}
        </Button>
      </div>
    </Card>
  )
}
