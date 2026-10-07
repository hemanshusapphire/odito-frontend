"use client"

import { useState } from 'react'
import Link from 'next/link'
import { SettingsTabs } from '@/components/social-media/SettingsTabs'
import { PublishingSettings } from '@/components/social-media/PublishingSettings'
import { TeamApprovalSettings } from '@/components/social-media/TeamApprovalSettings'
import { NotificationSettings } from '@/components/social-media/NotificationSettings'
import SocialMediaToastStack from '@/components/social-media/SocialMediaToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'
import { useProject } from '@/contexts/ProjectContext'
import { useApprovalSettings, useUpdateApprovalSettings } from '@/hooks/useSocialMediaAI'
import { describeApiError } from '@/lib/socialMedia/failureMessages'
import { SETTINGS_TABS, PUBLISHING_RULES_DEFAULTS } from '@/lib/socialMediaAIDummyData'

const APPROVAL_RULE_KEYS = ['contentApprovalRequired', 'designApprovalRequired']
const PERSISTED_RULE_KEYS = APPROVAL_RULE_KEYS

/**
 * Social Media AI - Settings: application configuration ONLY. The business, brand, services and products are
 * managed in one place, Business Profile (a link below says so). What is real here:
 *  - the two approval switches (Content / Design approval required), saved per project by the backend
 *    approval workflow and deciding how a submitted post is routed.
 * Still local previews (no backend yet): auto-publish, timezone, default platforms, team and notification
 * settings — the rules card labels them "Preview only".
 */
export default function SocialMediaSettingsPage() {
  const [activeTab, setActiveTab] = useState('publishing')
  const [publishingRules, setPublishingRules] = useState(PUBLISHING_RULES_DEFAULTS)
  const { toasts, notify, dismiss } = useToastQueue()
  const { activeProjectId } = useProject()
  const approvalSettings = useApprovalSettings(activeProjectId)
  const updateApprovalSettings = useUpdateApprovalSettings(activeProjectId)

  // The two approval switches show (and change) the BACKEND's values; everything
  // else in `publishingRules` stays a local preview.
  const settingsReady = !!approvalSettings.data
  const effectiveRules = settingsReady
    ? { ...publishingRules, contentApprovalRequired: approvalSettings.data.contentApprovalRequired, designApprovalRequired: approvalSettings.data.designApprovalRequired }
    : publishingRules
  const approvalDisabledKeys = settingsReady && !updateApprovalSettings.isPending ? [] : APPROVAL_RULE_KEYS

  function toggleRule(key) {
    if (APPROVAL_RULE_KEYS.includes(key)) {
      if (!settingsReady) return
      updateApprovalSettings.mutate({ [key]: !approvalSettings.data[key] }, {
        onSuccess: () => notify('Approval setting saved.', 'success'),
        onError: (error) => notify(describeApiError(error, 'Could not save that setting.').message, 'danger'),
      })
      return
    }
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
        <p className="mt-1 text-sm text-slate-500">Configure how Odito publishes, who approves, and what you get notified about.</p>
        <p className="mt-1 text-sm text-slate-400" data-testid="settings-profile-hint">
          Looking for your business details, brand or products? They are in{' '}
          <Link href="/app/social-media/business-profile" className="font-medium text-violet-600 hover:text-violet-700">Business Profile</Link>.
        </p>
      </div>

      <SettingsTabs tabs={SETTINGS_TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'publishing' && (
        <PublishingSettings rules={effectiveRules} onToggleRule={toggleRule} onTimezoneChange={handleTimezoneChange} persistedKeys={PERSISTED_RULE_KEYS} disabledKeys={approvalDisabledKeys} />
      )}

      {activeTab === 'team-approvals' && <TeamApprovalSettings onInvite={handleInvite} />}

      {activeTab === 'notifications' && <NotificationSettings />}

      <SocialMediaToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
