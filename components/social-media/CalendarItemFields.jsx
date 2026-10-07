"use client"

import { useId, useState } from 'react'
import { X } from 'lucide-react'
import { normalizeTag } from '@/lib/socialMedia/calendarItemForm'

/** Small form primitives for the calendar item editor: one look, real labels, errors tied to their field (aria-describedby / aria-invalid). */

export const INPUT = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500'
const INVALID = 'border-red-300 focus:border-red-400 focus:ring-red-100'

/** label + control + hint + error. `children` receives the props the control must spread (id, aria-*). */
export function Field({ label, hint, error, children, className = '', testId, optional = false }) {
  const id = useId()
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined
  return (
    <div className={className} data-testid={testId}>
      <label htmlFor={id} className="mb-1 flex items-baseline gap-1.5 text-xs font-semibold text-slate-600">
        {label}{optional && <span className="font-normal text-slate-400">optional</span>}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

export const TextInput = ({ error, className = '', ...props }) => <input type="text" {...props} className={`${INPUT} ${error ? INVALID : ''} ${className}`} />
export const TextArea = ({ error, rows = 3, className = '', ...props }) => <textarea rows={rows} {...props} className={`${INPUT} resize-y leading-relaxed ${error ? INVALID : ''} ${className}`} />
export const SelectInput = ({ error, className = '', children, ...props }) => <select {...props} className={`${INPUT} ${error ? INVALID : ''} ${className}`}>{children}</select>

export function Section({ id, title, description, children }) {
  return (
    <section aria-labelledby={`${id}-title`} data-testid={`section-${id}`} className="border-t border-slate-100 px-5 py-5 first:border-0 sm:px-6">
      <h3 id={`${id}-title`} className="text-sm font-bold text-slate-900">{title}</h3>
      {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** Hashtags as removable chips. Enter / comma / space adds one; only letters, numbers and underscores are accepted (as on the server). */
export function HashtagInput({ value, onChange, disabled = false, max = null, placeholder = 'Add a hashtag', label = 'Hashtags', testId, error = null }) {
  const id = useId()
  const [draft, setDraft] = useState('')
  const [problem, setProblem] = useState(null)

  const add = (raw) => {
    const parts = String(raw).split(/[\s,]+/).filter(Boolean)
    if (!parts.length) return
    // all or nothing: if any part is not a hashtag, nothing is added and the text stays so the user can fix it
    const bad = parts.find((part) => !normalizeTag(part))
    if (bad) { setProblem(`"${bad}" is not a valid hashtag: use letters, numbers and underscores only.`); return }
    const next = [...value]
    for (const part of parts) {
      const tag = normalizeTag(part)
      if (!next.some((t) => t.toLowerCase() === tag.toLowerCase())) next.push(tag)
    }
    setProblem(null)
    setDraft('')
    if (next.length !== value.length) onChange(next)
  }

  const message = problem || error
  return (
    <div data-testid={testId}>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      <div className={`flex flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-violet-100 ${message ? 'border-red-300' : 'border-slate-200 focus-within:border-violet-400'} ${disabled ? 'bg-slate-50' : ''}`}>
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 py-0.5 pl-2.5 pr-1 text-xs font-medium text-violet-700">
            {tag}
            {!disabled && (
              <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Remove ${tag}`} className="rounded-full p-0.5 text-violet-500 hover:bg-violet-100 hover:text-violet-700">
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={draft}
          disabled={disabled}
          placeholder={value.length ? '' : placeholder}
          aria-invalid={message ? true : undefined}
          onChange={(e) => { setDraft(e.target.value); if (problem) setProblem(null) }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',' || e.key === ' ') { e.preventDefault(); add(draft) }
            else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1))
          }}
          onBlur={() => add(draft)}
          className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed"
        />
      </div>
      <p className="mt-1 flex justify-between text-xs text-slate-400"><span>Press Enter to add a hashtag.</span>{max ? <span>{value.length}/{max}</span> : null}</p>
      {message && <p role="alert" className="mt-0.5 text-xs font-medium text-red-600">{message}</p>}
    </div>
  )
}
