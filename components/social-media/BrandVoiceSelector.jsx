"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

/** "Brand voice" dropdown in the Brand kit card. */
export function BrandVoiceSelector({ options, value, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">Brand voice</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-auto w-full justify-between rounded-lg border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm hover:border-slate-300">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-slate-200 bg-white text-slate-700 shadow-lg">
          {options.map((voice) => (
            <SelectItem key={voice} value={voice} className="text-sm focus:bg-violet-50 focus:text-violet-700">
              {voice}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default BrandVoiceSelector
