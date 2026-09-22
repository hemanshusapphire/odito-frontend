/** Read-only brand color swatches shown in Brand settings. */
export function BrandColorPicker({ colors }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {colors.map((color) => (
        <div key={color.id} className="flex flex-col items-center gap-1.5">
          <div
            className="h-10 w-full rounded-lg border border-slate-200 shadow-sm"
            style={{ background: color.hex }}
          />
          <span className="text-xs font-medium text-slate-600">{color.label}</span>
          <span className="text-[11px] text-slate-400">{color.hex}</span>
        </div>
      ))}
    </div>
  )
}

export default BrandColorPicker
