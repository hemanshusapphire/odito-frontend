"use client"

import { Building2, ChevronRight } from 'lucide-react'

/** "Business snapshot" card shown beside the recommended strategy card. */
export function BusinessSnapshot({ items, onSelectItem }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Building2 className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-bold text-slate-900">Business snapshot</h3>
          <p className="mt-0.5 text-sm text-slate-500">Here&apos;s what we know about your business</p>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem?.(item)}
              className="group flex items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-slate-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-800">{item.label}</span>
                <span className="block truncate text-sm text-slate-500">{item.value}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-500" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BusinessSnapshot
