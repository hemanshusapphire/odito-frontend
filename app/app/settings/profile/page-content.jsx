"use client"

import SettingsTabs from "@/components/settings/SettingsTabs"
import PersonalInformationCard from "@/components/settings/profile/PersonalInformationCard"
import SecurityCard from "@/components/settings/profile/SecurityCard"
import AccountInformationCard from "@/components/settings/profile/AccountInformationCard"
import SubscriptionSummaryCard from "@/components/settings/profile/SubscriptionSummaryCard"
import ConnectedAccountsCard from "@/components/settings/profile/ConnectedAccountsCard"
import SocialMediaAccountsCard from "@/components/settings/profile/SocialMediaAccountsCard"
import DangerZoneCard from "@/components/settings/profile/DangerZoneCard"

/**
 * Profile page. Reads the authenticated user directly from AuthContext (via
 * the section components themselves); no page-level fetch, no useProfile()
 * hook, no second source of truth.
 *
 * Seven sections: Personal Information, Security, Account Information,
 * Subscription Summary, Connected Accounts, Social Media Accounts (a
 * second entry point into the same Meta OAuth flow /app/social uses — see
 * SocialMediaAccountsCard's own header comment), and Danger Zone.
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
        <SocialMediaAccountsCard />
        <DangerZoneCard />
      </div>
    </div>
  )
}
