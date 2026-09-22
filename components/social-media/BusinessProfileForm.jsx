"use client"

import { Globe, Building2, MapPin, FileText } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BusinessProfileField } from './BusinessProfileField'
import { INDUSTRY_OPTIONS, BUSINESS_DESCRIPTION_MAX_LENGTH } from '@/lib/socialMediaAIDummyData'

const FIELD_CLASS =
  'w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition-colors focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 hover:border-slate-300'

/**
 * Controlled business-profile form - state lives in the parent page. Reused
 * as-is by both Connect Accounts (default title/subtitle) and the Settings
 * "Business profile" tab (its own title/subtitle + a Business name field
 * passed via `children`, rendered above the Website/Industry grid).
 */
export function BusinessProfileForm({
  profile,
  onFieldChange,
  title = 'Your business profile',
  subtitle = 'Help us understand your business so we can create better content recommendations.',
  children,
}) {
  const descriptionLength = profile.description.length

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

      {children && <div className="mt-5">{children}</div>}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BusinessProfileField label="Website" icon={Globe}>
          <input
            type="text"
            value={profile.website}
            onChange={(e) => onFieldChange('website', e.target.value)}
            placeholder="yourbusiness.com"
            className={FIELD_CLASS}
          />
        </BusinessProfileField>

        <BusinessProfileField label="Industry" icon={Building2}>
          <Select value={profile.industry} onValueChange={(value) => onFieldChange('industry', value)}>
            <SelectTrigger className={`${FIELD_CLASS} h-auto justify-between`}>
              <SelectValue placeholder="Select an industry" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 bg-white text-slate-700 shadow-lg">
              {INDUSTRY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-sm focus:bg-violet-50 focus:text-violet-700">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </BusinessProfileField>
      </div>

      <div className="mt-4">
        <BusinessProfileField label="Location" icon={MapPin}>
          <input
            type="text"
            value={profile.location}
            onChange={(e) => onFieldChange('location', e.target.value)}
            placeholder="City, Country"
            className={FIELD_CLASS}
          />
        </BusinessProfileField>
      </div>

      <div className="mt-4">
        <BusinessProfileField label="Business description" icon={FileText} align="top">
          <textarea
            value={profile.description}
            onChange={(e) => {
              if (e.target.value.length <= BUSINESS_DESCRIPTION_MAX_LENGTH) onFieldChange('description', e.target.value)
            }}
            rows={4}
            placeholder="Tell us what your business does..."
            className={`${FIELD_CLASS} resize-none pb-6`}
          />
          <span className="pointer-events-none absolute bottom-2.5 right-3 text-xs text-slate-400">
            {descriptionLength}/{BUSINESS_DESCRIPTION_MAX_LENGTH}
          </span>
        </BusinessProfileField>
      </div>
    </div>
  )
}

export default BusinessProfileForm
