"use client"

const TONE_DOT = { default: 'bg-primary', success: 'bg-emerald-500', danger: 'bg-destructive' }

export default function LeadsToaster({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className="flex items-center gap-2 min-w-[220px] rounded-xl border bg-popover/95 backdrop-blur px-4 py-3 shadow-lg text-sm text-foreground cursor-pointer animate-in fade-in slide-in-from-bottom-2"
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${TONE_DOT[t.tone] || TONE_DOT.default}`} />
          {t.message}
        </div>
      ))}
    </div>
  )
}
