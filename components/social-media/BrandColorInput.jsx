"use client"

/** One brand color control: native color picker swatch + editable hex input. */
export function BrandColorInput({ label, value, onChange }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <label className="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 shadow-sm" style={{ background: value }}>
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#ffffff'}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={`${label} color picker`}
          />
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 shadow-sm transition-colors focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 hover:border-slate-300"
        />
      </div>
      <p className="mt-1.5 text-xs text-slate-500">{label}</p>
    </div>
  )
}

export default BrandColorInput
