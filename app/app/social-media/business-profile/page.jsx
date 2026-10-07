"use client"

import { BusinessProfileScreen } from '@/components/social-media/BusinessProfileScreen'

/**
 * Social Media AI - Business Profile: the single place to tell Odito about the business and brand (business type,
 * business information, Brand Kit, services or products). Connections live in Connect Accounts, application
 * configuration in Settings; nothing here is duplicated there.
 */
export default function BusinessProfilePage() {
  return (
    <div className="flex-1 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Business Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Tell Odito about your business and brand. Social AI builds your strategy and content from this.</p>
      </div>
      <BusinessProfileScreen />
    </div>
  )
}
