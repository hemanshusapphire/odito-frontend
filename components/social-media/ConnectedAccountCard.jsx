import { Facebook, Instagram } from 'lucide-react'

const PLATFORM_META = {
  facebook: {
    label: 'Facebook',
    Icon: Facebook,
    iconClass: 'text-white',
    badgeClass: 'bg-[#1877F2]',
  },
  instagram: {
    label: 'Instagram',
    Icon: Instagram,
    iconClass: 'text-white',
    badgeClass: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
  },
}

/** Small connected-status pill shown in the Overview header for one platform. */
export function ConnectedAccountCard({ platform, connected }) {
  const meta = PLATFORM_META[platform]
  if (!meta) return null
  const { label, Icon, iconClass, badgeClass } = meta

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-sm">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${badgeClass}`}>
        <Icon className={`h-4 w-4 ${iconClass}`} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {connected ? 'Connected' : 'Not connected'}
        </span>
      </span>
    </div>
  )
}

export default ConnectedAccountCard
