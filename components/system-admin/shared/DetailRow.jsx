/**
 * label/value row reused across every profile card (Account, Subscription,
 * ...) so none of them duplicates this layout.
 */
export function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm border-b border-border/40 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value ?? "—"}</span>
    </div>
  )
}
