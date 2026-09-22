/** Bottom "Strategy settings" summary bar - renders its action buttons via `children`. */
export function StrategySettings({ items, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div>
        <h3 className="text-base font-bold text-slate-900">Strategy settings</h3>
        <p className="mt-0.5 text-sm text-slate-500">Confirm the details below to activate your strategy.</p>
      </div>

      <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col divide-y divide-slate-100 sm:flex-row sm:flex-wrap sm:divide-x sm:divide-y-0">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 sm:px-5 sm:py-0 sm:first:pl-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                  <p className="text-xs text-slate-400">{item.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row">{children}</div>
      </div>
    </div>
  )
}

export default StrategySettings
