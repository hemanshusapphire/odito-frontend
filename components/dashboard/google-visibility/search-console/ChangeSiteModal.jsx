"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import SearchConsoleSetupPanel from './SearchConsoleSetupPanel'

/**
 * Modal shell for changing the connected Search Console property from an
 * already-connected dashboard. Owns no picker logic itself -
 * SearchConsoleSetupPanel is the single property-picker implementation,
 * reused verbatim for both first-time onboarding and this flow. Mirrors
 * business-profile/ChangeLocationModal.jsx.
 */
export default function ChangeSiteModal({
  open,
  onOpenChange,
  loading,
  error,
  onRetry,
  sites,
  onSelectSite,
  selecting,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Change Search Console Property</DialogTitle>
          <DialogDescription>
            Choose a different Google Search Console property for this project. Your Google connection stays as-is.
          </DialogDescription>
        </DialogHeader>

        <SearchConsoleSetupPanel
          loading={loading}
          error={error}
          onRetry={onRetry}
          sites={sites}
          onSelectSite={onSelectSite}
          selecting={selecting}
        />
      </DialogContent>
    </Dialog>
  )
}
