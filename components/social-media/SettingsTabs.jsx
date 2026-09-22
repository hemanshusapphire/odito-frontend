/** Underline tab strip for the Settings page (no counts, unlike ApprovalTabs). */
export function SettingsTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex items-center gap-6 overflow-x-auto border-b border-slate-200">
      {tabs.map((tab) => {
        const active = tab.id === activeTab
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-pressed={active}
            className={`-mb-px shrink-0 border-b-2 pb-3 text-sm font-semibold transition-colors ${
              active ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export default SettingsTabs
