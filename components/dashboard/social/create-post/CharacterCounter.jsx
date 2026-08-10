"use client"

/** "X characters remaining" - turns amber/red as the limit approaches/exceeds. */
export default function CharacterCounter({ remaining, max }) {
  const isLow = remaining <= max * 0.1
  const isOver = remaining < 0

  return (
    <span className={`text-xs font-medium tabular-nums ${isOver ? 'text-destructive' : isLow ? 'text-amber-500' : 'text-muted-foreground'}`}>
      {remaining.toLocaleString()} characters remaining
    </span>
  )
}
