import { LogoUploader } from './LogoUploader'
import { BrandColorInput } from './BrandColorInput'
import { FontSelector } from './FontSelector'
import { BrandVoiceSelector } from './BrandVoiceSelector'
import { LanguageSelector } from './LanguageSelector'
import { SETTINGS_FONT_OPTIONS, SETTINGS_VOICE_OPTIONS, SETTINGS_LANGUAGE_OPTIONS } from '@/lib/socialMediaAIDummyData'

const FIELD_CLASS =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition-colors focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 hover:border-slate-300'

/** Left "Brand kit" card - logo, colors, font, voice, language, prohibited phrases. */
export function BrandKitPanel({ brandKit, onChange, onLogoChange }) {
  function handleColorChange(key, value) {
    onChange('colors', { ...brandKit.colors, [key]: value })
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">Brand kit</h2>
      <p className="mt-1 text-sm text-slate-500">Define your brand identity so AI can create on-brand content.</p>

      <div className="mt-5 flex flex-col gap-5">
        <LogoUploader
          logoLabel={brandKit.logoLabel}
          previewUrl={brandKit.logoPreviewUrl}
          colors={brandKit.colors}
          onReplace={onLogoChange}
        />

        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Brand colours</p>
          <div className="flex flex-wrap gap-5">
            <BrandColorInput label="Primary" value={brandKit.colors.primary} onChange={(v) => handleColorChange('primary', v)} />
            <BrandColorInput label="Accent" value={brandKit.colors.accent} onChange={(v) => handleColorChange('accent', v)} />
            <BrandColorInput label="Background" value={brandKit.colors.background} onChange={(v) => handleColorChange('background', v)} />
          </div>
        </div>

        <FontSelector options={SETTINGS_FONT_OPTIONS} value={brandKit.font} onChange={(v) => onChange('font', v)} />
        <BrandVoiceSelector options={SETTINGS_VOICE_OPTIONS} value={brandKit.voice} onChange={(v) => onChange('voice', v)} />
        <LanguageSelector options={SETTINGS_LANGUAGE_OPTIONS} value={brandKit.language} onChange={(v) => onChange('language', v)} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Prohibited phrases</label>
          <input
            type="text"
            value={brandKit.prohibitedPhrases}
            onChange={(e) => onChange('prohibitedPhrases', e.target.value)}
            placeholder="e.g. cheapest, guaranteed, 100%"
            className={FIELD_CLASS}
          />
        </div>
      </div>
    </div>
  )
}

export default BrandKitPanel
