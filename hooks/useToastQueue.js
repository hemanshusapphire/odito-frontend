"use client"

import { useCallback, useState } from 'react'

let nextId = 1

/**
 * Minimal local toast queue for pages with no backend to confirm actions
 * against. No toast library exists anywhere in this app - kept as a small
 * shared hook (rather than one copy per module) so future frontend-only
 * pages can reuse it instead of re-implementing the same 15 lines.
 */
export function useToastQueue() {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback((message, tone = 'default') => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, tone }])
    setTimeout(() => dismiss(id), 2800)
  }, [dismiss])

  return { toasts, notify, dismiss }
}
