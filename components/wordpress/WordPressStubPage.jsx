"use client"

/** Shared header + "coming soon" body for every WordPress Management sidebar item besides Dashboard. */
export default function WordPressStubPage({ icon: Icon, title, description }) {
  return (
    <div className="flex-1 space-y-6 pb-10">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground max-w-lg text-sm">{description}</p>
      </div>

      <div className="rounded-2xl border bg-card p-10 flex flex-col items-center text-center gap-3">
        <span className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="h-6 w-6" />
        </span>
        <h3 className="text-base font-semibold">{title} coming soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          This section of WordPress Management is on the roadmap - the Dashboard tab already surfaces the most relevant {title.toLowerCase()} data.
        </p>
      </div>
    </div>
  )
}
