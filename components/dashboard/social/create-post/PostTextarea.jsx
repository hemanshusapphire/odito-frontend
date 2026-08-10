"use client"

import { useEffect, useRef } from 'react'
import CharacterCounter from './CharacterCounter'

export const MAX_POST_CHARS = 6000

/** Auto-resizing post composer textarea with a bottom-right character counter. */
export default function PostTextarea({ value, onChange }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <div className="flex flex-col gap-1.5">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What do you want to share with your audience?"
        rows={4}
        className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
        style={{ maxHeight: 280, overflowY: value.length > 800 ? 'auto' : 'hidden' }}
        autoFocus
      />
      <div className="flex justify-end">
        <CharacterCounter remaining={MAX_POST_CHARS - value.length} max={MAX_POST_CHARS} />
      </div>
    </div>
  )
}
