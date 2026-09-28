"use client"

import { useEffect } from "react"
import { createPortal } from "react-dom"

/**
 * Transient feedback toast for issue/task actions — same look and 3.5s
 * lifetime as the local Toast in IssueDetailView / TechCheckDetailView, for the
 * screens that had none (FixPanel overlays, domain-level issue view).
 * Renders nothing when there is no message.
 *
 *   const [toast, setToast] = useState(null)
 *   <TaskToast toast={toast} onClose={() => setToast(null)} />
 */
export default function TaskToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined
    const id = setTimeout(onClose, 3500)
    return () => clearTimeout(id)
  }, [toast, onClose])

  if (!toast || typeof document === "undefined") return null

  const ok = toast.type !== "error"
  return createPortal(
    <div
      role={ok ? "status" : "alert"}
      style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 10000,
        background: ok ? "rgba(0,245,160,0.12)" : "rgba(255,56,96,0.12)",
        border: `1px solid ${ok ? "rgba(0,245,160,0.28)" : "rgba(255,56,96,0.28)"}`,
        color: ok ? "#00f5a0" : "#ff3860",
        borderRadius: 10, padding: "11px 18px", fontSize: 13, fontWeight: 600,
        display: "flex", alignItems: "center", gap: 8,
        backdropFilter: "blur(8px)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      <span>{ok ? "✓" : "✕"}</span>
      {toast.message}
    </div>,
    document.body
  )
}
