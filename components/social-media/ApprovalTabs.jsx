"use client"

/** Underline tab strip (Pending review / Approved / Needs changes) with live counts. */
export function ApprovalTabs({ tabs, posts, activeTab, onChange }) {
  return (
    <div className="flex items-center gap-6 border-b border-slate-200">
      {tabs.map((tab) => {
        const count = posts.filter((p) => p.status === tab.status).length
        const active = tab.id === activeTab
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-pressed={active}
            className={`-mb-px border-b-2 pb-3 text-sm font-semibold transition-colors ${
              active ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label} ({count})
          </button>
        )
      })}
    </div>
  )
}

export default ApprovalTabs
