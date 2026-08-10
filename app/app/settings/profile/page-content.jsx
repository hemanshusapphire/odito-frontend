"use client"

import SettingsTabs from "@/components/settings/SettingsTabs"
import PersonalInformationCard from "@/components/settings/profile/PersonalInformationCard"
import SecurityCard from "@/components/settings/profile/SecurityCard"
import AccountInformationCard from "@/components/settings/profile/AccountInformationCard"
import SubscriptionSummaryCard from "@/components/settings/profile/SubscriptionSummaryCard"
import ConnectedAccountsCard from "@/components/settings/profile/ConnectedAccountsCard"
import DangerZoneCard from "@/components/settings/profile/DangerZoneCard"

/**
 * Profile page. Reads the authenticated user directly from AuthContext (via
 * the section components themselves); no page-level fetch, no useProfile()
 * hook, no second source of truth.
 *
 * All six sections are now present — Personal Information, Security,
 * Account Information, Subscription Summary, Connected Accounts, and
 * Danger Zone (Phase 5, this page's final section).
 */
export default function ProfilePageContent() {
  return (
    <div className="space-y-6">
      <SettingsTabs />

      <div className="border-b pb-4">
        <h1 className="text-foreground text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and account details.</p>
      </div>

      <div className="max-w-4xl space-y-6">
        <PersonalInformationCard />
        <SecurityCard />
        <AccountInformationCard />
        <SubscriptionSummaryCard />
        <ConnectedAccountsCard />
        <DangerZoneCard />
      </div>
    </div>
  )
}
