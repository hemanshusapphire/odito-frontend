"use client"

/**
 * Underline tab strip with live counts. `counts` (optional, id -> number)
 * overrides the count derived from `posts` — used by lists whose real total
 * comes from the server rather than the rows currently loaded.
 */
export function ApprovalTabs({ tabs, posts = [], activeTab, onChange, counts }) {
  return (
    <div className="flex items-center gap-6 overflow-x-auto border-b border-slate-200">
      {tabs.map((tab) => {
        const count = counts && counts[tab.id] !== undefined && counts[tab.id] !== null
          ? counts[tab.id]
          : counts ? '–' : posts.filter((p) => p.status === tab.status).length
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
            {tab.label} ({count})
          </button>
        )
      })}
    </div>
  )
}

export default ApprovalTabs
