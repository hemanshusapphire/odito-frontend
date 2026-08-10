"use client"

import { useCallback, useState } from 'react'

let nextId = 1

/**
 * Minimal local toast queue, scoped to the Leads page only - no toast
 * library exists anywhere in this app (checked), and this module doesn't
 * need one globally, so this stays a page-local hook rather than new
 * app-wide infrastructure.
 */
export function useLeadsToasts() {
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
