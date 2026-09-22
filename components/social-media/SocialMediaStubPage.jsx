/** Shared header + "coming soon" body for every Social Media AI sidebar item besides Overview. */
export function SocialMediaStubPage({ icon: Icon, title, description }) {
  return (
    <div className="flex-1 space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 max-w-lg text-sm text-slate-500">{description}</p>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
          <Icon className="h-6 w-6" />
        </span>
        <h3 className="text-base font-semibold text-slate-900">{title} coming soon</h3>
        <p className="max-w-sm text-sm text-slate-500">
          This section of Social Media AI is on the roadmap - the Overview tab already surfaces the most relevant {title.toLowerCase()} activity.
        </p>
      </div>
    </div>
  )
}

export default SocialMediaStubPage
