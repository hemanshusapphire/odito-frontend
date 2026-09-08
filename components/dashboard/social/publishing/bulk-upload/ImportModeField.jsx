"use client"

import { IMPORT_MODES } from './bulkUploadConstants'

/**
 * Import-mode chooser. Native radios inside a fieldset/legend so it is
 * fully keyboard-accessible and testable without Radix's pointer-event
 * plumbing (which jsdom doesn't implement). The two values are the exact
 * strings the backend expects: "valid-only" | "all-as-draft".
 */
export default function ImportModeField({ value, onChange, disabled }) {
  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="text-sm font-semibold mb-2">Import mode</legend>
      <div className="grid gap-2">
        {IMPORT_MODES.map((mode) => {
          const selected = value === mode.value
          return (
            <label
              key={mode.value}
              className={`flex gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                selected ? 'border-primary bg-primary/5' : 'border-border/60 hover:bg-muted/30'
              } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <input
                type="radio"
                name="bulk-import-mode"
                value={mode.value}
                checked={selected}
                onChange={() => onChange(mode.value)}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{mode.label}</span>
                <span className="block text-xs text-muted-foreground leading-snug">{mode.description}</span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
