"use client"

import { useState } from 'react'
import { SettingsTabs } from '@/components/social-media/SettingsTabs'
import { BrandKitPanel } from '@/components/social-media/BrandKitPanel'
import { BrandPreview } from '@/components/social-media/BrandPreview'
import { PublishingRules } from '@/components/social-media/PublishingRules'
import { SettingsActionBar } from '@/components/social-media/SettingsActionBar'
import { BusinessProfileSettings } from '@/components/social-media/BusinessProfileSettings'
import { PublishingSettings } from '@/components/social-media/PublishingSettings'
import { TeamApprovalSettings } from '@/components/social-media/TeamApprovalSettings'
import { NotificationSettings } from '@/components/social-media/NotificationSettings'
import SocialMediaToastStack from '@/components/social-media/SocialMediaToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'
import {
  SETTINGS_TABS,
  BRAND_KIT_DEFAULTS,
  BRAND_PREVIEW_CONTENT,
  PUBLISHING_RULES_DEFAULTS,
} from '@/lib/socialMediaAIDummyData'

const INITIAL_BRAND_KIT = { ...BRAND_KIT_DEFAULTS, logoPreviewUrl: null }

/**
 * Social Media AI - Settings. Entirely frontend-only, same as the rest of
 * the module: every default comes from lib/socialMediaAIDummyData.js, no
 * API calls, no real persistence. Only the Brand kit tab's identity fields
 * (colors/font/voice/language/phrases/logo) go through an explicit
 * Cancel/Save cycle, matching the reference's bottom action bar; the
 * Approval & publishing rules toggles apply immediately, same as every
 * other switch across this module.
 */
export default function SocialMediaSettingsPage() {
  const [activeTab, setActiveTab] = useState('brand-kit')
  const [savedBrandKit, setSavedBrandKit] = useState(INITIAL_BRAND_KIT)
  const [brandKit, setBrandKit] = useState(INITIAL_BRAND_KIT)
  const [publishingRules, setPublishingRules] = useState(PUBLISHING_RULES_DEFAULTS)
  const { toasts, notify, dismiss } = useToastQueue()

  function handleBrandKitChange(field, value) {
    setBrandKit((prev) => ({ ...prev, [field]: value }))
  }

  function handleLogoChange(url) {
    setBrandKit((prev) => ({ ...prev, logoPreviewUrl: url }))
  }

  function handleCancel() {
    setBrandKit(savedBrandKit)
    notify('Changes discarded.', 'default')
  }

  function handleSave() {
    setSavedBrandKit(brandKit)
    notify('Settings saved successfully', 'success')
  }

  function toggleRule(key) {
    setPublishingRules((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleTimezoneChange(value) {
    setPublishingRules((prev) => ({ ...prev, timezone: value }))
  }

  function handleInvite() {
    notify('Team invitations are on the roadmap.', 'default')
  }

  return (
    <div className="flex-1 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Set the rules for your brand and publishing</p>
      </div>

      <SettingsTabs tabs={SETTINGS_TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'business-profile' && <BusinessProfileSettings />}

      {activeTab === 'brand-kit' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <BrandKitPanel brandKit={brandKit} onChange={handleBrandKitChange} onLogoChange={handleLogoChange} />
            <BrandPreview brandKit={brandKit} content={BRAND_PREVIEW_CONTENT} />
          </div>

          <PublishingRules rules={publishingRules} onToggle={toggleRule} onTimezoneChange={handleTimezoneChange} />

          <SettingsActionBar onCancel={handleCancel} onSave={handleSave} />
        </div>
      )}

      {activeTab === 'publishing' && (
        <PublishingSettings rules={publishingRules} onToggleRule={toggleRule} onTimezoneChange={handleTimezoneChange} />
      )}

      {activeTab === 'team-approvals' && <TeamApprovalSettings onInvite={handleInvite} />}

      {activeTab === 'notifications' && <NotificationSettings />}

      <SocialMediaToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
