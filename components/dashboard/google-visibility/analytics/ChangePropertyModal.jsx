"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import AnalyticsSetupPanel from './AnalyticsSetupPanel'

/**
 * Modal shell for changing the connected Analytics property from an
 * already-connected dashboard - exact structural mirror of
 * business-profile/ChangeLocationModal.jsx. Owns no picker logic itself:
 * AnalyticsSetupPanel is the single property-picker implementation, reused
 * verbatim for both first-time onboarding and this flow. All data-fetching/
 * mutations live in the parent page, exactly as they do for onboarding.
 *
 * Does not disconnect or re-authenticate Google - it drives the same
 * useAnalyticsProperties/useSelectAnalyticsProperty/useSyncAnalytics hooks
 * the parent already uses for onboarding, against the same still-active
 * GoogleConnection.
 */
export default function ChangePropertyModal({
  open,
  onOpenChange,
  loading,
  error,
  onRetry,
  properties,
  onSelectProperty,
  selecting,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Change Analytics Property</DialogTitle>
          <DialogDescription>
            Choose a different Google Analytics property for this project. Your Google connection stays as-is.
          </DialogDescription>
        </DialogHeader>

        <AnalyticsSetupPanel
          loading={loading}
          error={error}
          onRetry={onRetry}
          properties={properties}
          onSelectProperty={onSelectProperty}
          selecting={selecting}
        />
      </DialogContent>
    </Dialog>
  )
}
