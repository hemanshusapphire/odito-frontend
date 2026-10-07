import { Info } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { TimezoneSelector } from './TimezoneSelector'
import { SETTINGS_TIMEZONE_OPTIONS } from '@/lib/socialMediaAIDummyData'

const RULES = [
  { key: 'contentApprovalRequired', label: 'Content approval required', description: 'All generated content must be approved before scheduling.' },
  { key: 'designApprovalRequired', label: 'Design approval required', description: 'Visual assets must be approved before publishing.' },
  { key: 'autoPublishApproved', label: 'Auto-publish approved scheduled posts', description: 'Automatically publish posts at their scheduled time once approved.' },
]

/** "Approval & publishing rules" card - toggles + timezone, used by the Publishing tab. */
/**
 * `persistedKeys` (optional): the rule keys that are saved by the backend. When given, any other rule is
 * labelled as not saved yet, so a switch that does nothing server-side never looks like a real setting.
 * `disabledKeys`: rules that cannot be toggled right now (still loading / being saved).
 */
export function PublishingRules({ rules, onToggle, onTimezoneChange, persistedKeys = null, disabledKeys = [], title = 'Approval & publishing rules', subtitle = 'Control how content moves from creation to publishing.' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex flex-col gap-4">
          {RULES.map((rule) => (
            <div key={rule.key} className="flex items-start gap-3">
              <Switch
                checked={rules[rule.key]}
                onCheckedChange={() => onToggle(rule.key)}
                disabled={disabledKeys.includes(rule.key)}
                aria-label={rule.label}
                className="mt-0.5 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-200 [&>span]:bg-white"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">{rule.label}</p>
                <p className="text-sm text-slate-500">{rule.description}</p>
                {persistedKeys && !persistedKeys.includes(rule.key) && (
                  <p className="mt-0.5 text-xs text-slate-400" data-testid={`rule-unsaved-${rule.key}`}>Preview only — this setting isn&apos;t saved yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <TimezoneSelector options={SETTINGS_TIMEZONE_OPTIONS} value={rules.timezone} onChange={onTimezoneChange} />
          <p className="-mt-2 text-xs text-slate-400">All scheduled times will use this timezone.</p>

          <div className="flex items-start gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
            <p className="text-sm text-slate-700">Changes to approved content require reapproval before publishing.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublishingRules
