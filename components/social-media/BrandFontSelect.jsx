"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/** "Font" dropdown in Brand settings. */
export function BrandFontSelect({ options, value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-auto w-full justify-between rounded-lg border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm hover:border-slate-300">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-slate-200 bg-white text-slate-700 shadow-lg">
        {options.map((font) => (
          <SelectItem key={font} value={font} className="text-sm focus:bg-violet-50 focus:text-violet-700">
            {font}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default BrandFontSelect
