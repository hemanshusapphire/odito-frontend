"use client"

import { useState } from 'react'
import { Building2 } from 'lucide-react'
import { BusinessProfileField } from './BusinessProfileField'
import { BusinessProfileForm } from './BusinessProfileForm'
import { BUSINESS_NAME_DEFAULT, BUSINESS_PROFILE_DEFAULTS } from '@/lib/socialMediaAIDummyData'

const FIELD_CLASS =
  'w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition-colors focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 hover:border-slate-300'

/** "Business profile" settings tab - reuses BusinessProfileField/Form from Connect Accounts. */
export function BusinessProfileSettings() {
  const [businessName, setBusinessName] = useState(BUSINESS_NAME_DEFAULT)
  const [profile, setProfile] = useState(BUSINESS_PROFILE_DEFAULTS)

  return (
    <BusinessProfileForm
      profile={profile}
      onFieldChange={(field, value) => setProfile((prev) => ({ ...prev, [field]: value }))}
      title="Business profile"
      subtitle="These details help AI generate on-brand, relevant content."
    >
      <BusinessProfileField label="Business name" icon={Building2}>
        <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={FIELD_CLASS} />
      </BusinessProfileField>
    </BusinessProfileForm>
  )
}

export default BusinessProfileSettings
