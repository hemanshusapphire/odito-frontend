/** Labeled, icon-prefixed field shell shared by every Business Profile input. */
export function BusinessProfileField({ label, icon: Icon, align = 'center', children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <Icon
          className={`pointer-events-none absolute left-3 h-4 w-4 text-slate-400 ${
            align === 'top' ? 'top-3' : 'top-1/2 -translate-y-1/2'
          }`}
        />
        {children}
      </div>
    </div>
  )
}

export default BusinessProfileField
