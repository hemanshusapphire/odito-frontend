"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import BusinessProfileSetupPanel from './BusinessProfileSetupPanel'

/**
 * Modal shell for changing the connected Business Profile location from an
 * already-connected dashboard. Intentionally owns NO picker logic itself -
 * BusinessProfileSetupPanel is the single location-picker implementation
 * (reused verbatim for both first-time onboarding and this flow), and all
 * data-fetching/mutations live in the parent page (business-profile/page.jsx),
 * exactly as they already do for onboarding. This component only owns
 * open/close.
 *
 * Does not disconnect or re-authenticate Google - it drives the same
 * useBusinessProfileAccounts/Locations/useSelectBusinessProfile/
 * useSyncBusinessProfile hooks the parent already uses for onboarding,
 * against the same still-active GoogleConnection.
 */
export default function ChangeLocationModal({
  open,
  onOpenChange,
  loading,
  error,
  onRetry,
  accounts,
  selectedAccountId,
  onSelectAccount,
  locations,
  onSelectLocation,
  selecting,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Change Business Profile Location</DialogTitle>
          <DialogDescription>
            Choose a different Google Business Profile location for this project. Your Google connection stays as-is.
          </DialogDescription>
        </DialogHeader>

        <BusinessProfileSetupPanel
          loading={loading}
          error={error}
          onRetry={onRetry}
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onSelectAccount={onSelectAccount}
          locations={locations}
          onSelectLocation={onSelectLocation}
          selecting={selecting}
        />
      </DialogContent>
    </Dialog>
  )
}
