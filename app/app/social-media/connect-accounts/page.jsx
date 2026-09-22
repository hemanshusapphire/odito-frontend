"use client"

import { useState } from 'react'
import { ArrowRight, Loader2, Check } from 'lucide-react'
import { SetupStepper } from '@/components/social-media/SetupStepper'
import { FacebookAccountCard } from '@/components/social-media/FacebookAccountCard'
import { InstagramAccountCard } from '@/components/social-media/InstagramAccountCard'
import { BusinessProfileForm } from '@/components/social-media/BusinessProfileForm'
import { AIAnalysisCard } from '@/components/social-media/AIAnalysisCard'
import SocialMediaToastStack from '@/components/social-media/SocialMediaToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'
import {
  SETUP_STEPS,
  SOCIAL_ACCOUNTS,
  BUSINESS_PROFILE_DEFAULTS,
  AI_ANALYSIS_ITEMS,
} from '@/lib/socialMediaAIDummyData'

/**
 * Social Media AI - Connect Accounts. Entirely frontend-only, same as the
 * Overview page: every figure comes from lib/socialMediaAIDummyData.js, no
 * API calls, no OAuth, no backend. "Connect Instagram" and "Save & analyze
 * business" only ever update local component state and show a toast - see
 * their handlers below for exactly what they do (and don't do).
 */
export default function ConnectAccountsPage() {
  const [accounts, setAccounts] = useState(SOCIAL_ACCOUNTS)
  const [instagramConnecting, setInstagramConnecting] = useState(false)
  const [profile, setProfile] = useState(BUSINESS_PROFILE_DEFAULTS)
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved
  const { toasts, notify, dismiss } = useToastQueue()

  function handleFieldChange(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  function handleDisconnectFacebook() {
    setAccounts((prev) => ({ ...prev, facebook: { connected: false } }))
    notify('Facebook Page disconnected.', 'default')
  }

  function handleSwitchFacebookPage() {
    notify('Page switching is a preview in this demo workspace.', 'default')
  }

  function handleConnectInstagram() {
    if (instagramConnecting || accounts.instagram.connected) return
    setInstagramConnecting(true)
    // Frontend-only preview: no real Meta OAuth round-trip happens here.
    setTimeout(() => {
      setAccounts((prev) => ({
        ...prev,
        instagram: {
          connected: true,
          name: 'Sapphire Digital Agency',
          handle: '@sapphiredigitalagency',
          followers: '1.8K followers',
        },
      }))
      setInstagramConnecting(false)
      notify('Instagram connected (preview only).', 'success')
    }, 1100)
  }

  function handleSaveAndAnalyze() {
    if (saveState === 'saving') return
    setSaveState('saving')
    setTimeout(() => {
      setSaveState('saved')
      notify('Business profile saved. AI recommendations are being prepared.', 'success')
      setTimeout(() => setSaveState('idle'), 2200)
    }, 900)
  }

  return (
    <div className="flex-1 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Connect your accounts</h1>
        <p className="mt-1 text-sm text-slate-500">Bring your Facebook and Instagram together.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="mx-auto max-w-xl">
          <SetupStepper steps={SETUP_STEPS} currentStepId="connect-accounts" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <FacebookAccountCard
          account={accounts.facebook}
          onDisconnect={handleDisconnectFacebook}
          onSwitchPage={handleSwitchFacebookPage}
        />
        <InstagramAccountCard
          account={accounts.instagram}
          onConnect={handleConnectInstagram}
          connecting={instagramConnecting}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BusinessProfileForm profile={profile} onFieldChange={handleFieldChange} />
        </div>
        <AIAnalysisCard items={AI_ANALYSIS_ITEMS} />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSaveAndAnalyze}
          disabled={saveState === 'saving'}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700 active:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-80"
        >
          {saveState === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
          {saveState === 'saved' && <Check className="h-4 w-4" />}
          {saveState === 'saving' ? 'Analyzing business…' : saveState === 'saved' ? 'Saved' : 'Save & analyze business'}
          {saveState === 'idle' && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>

      <SocialMediaToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
