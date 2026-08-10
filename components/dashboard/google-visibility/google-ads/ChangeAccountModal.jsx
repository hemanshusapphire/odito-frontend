"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import GoogleAdsSetupPanel from './GoogleAdsSetupPanel'

/**
 * Modal shell for switching to a different Google Ads account from an
 * already-connected dashboard - exact structural mirror of
 * analytics/ChangePropertyModal.jsx. Owns no picker logic itself:
 * GoogleAdsSetupPanel is the single account-picker implementation, reused
 * verbatim for both first-time onboarding (State 2/3 in page.jsx) and this
 * flow. All data-fetching/mutations live in the parent page.
 *
 * Does not disconnect or re-authenticate Google - it drives the same
 * useGoogleAdsAccounts/useSelectGoogleAdsAccount/useTriggerGoogleAdsSync
 * hooks the parent already uses for onboarding, against the same
 * still-active GoogleConnection. Switching accounts starts a brand new
 * sync for the newly-selected customerId; the dashboard keeps showing the
 * previous account's data until that sync completes (same "preserve
 * previous data during refresh" behavior as a normal Refresh Data run).
 */
export default function ChangeAccountModal({
  open,
  onOpenChange,
  loading,
  error,
  onRetry,
  accounts,
  onConfirm,
  confirming,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Change Google Ads Account</DialogTitle>
          <DialogDescription>
            Choose a different Google Ads account for this project. Your Google connection stays as-is.
          </DialogDescription>
        </DialogHeader>

        <GoogleAdsSetupPanel
          loading={loading}
          error={error}
          onRetry={onRetry}
          accounts={accounts}
          onConfirm={onConfirm}
          confirming={confirming}
        />
      </DialogContent>
    </Dialog>
  )
}
