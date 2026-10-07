import { Facebook, Instagram } from 'lucide-react'
import { ACCOUNT_STATE, accountStatusLabel } from '@/lib/socialMedia/accountViewModel'

const PLATFORM_META = {
  facebook: { label: 'Facebook', Icon: Facebook, iconClass: 'text-white', badgeClass: 'bg-[#1877F2]' },
  instagram: {
    label: 'Instagram',
    Icon: Instagram,
    iconClass: 'text-white',
    badgeClass: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
  },
}

const TONE = {
  healthy: { text: 'text-emerald-600', dot: 'bg-emerald-500' },
  warning: { text: 'text-amber-600', dot: 'bg-amber-500' },
  error: { text: 'text-red-600', dot: 'bg-red-500' },
  neutral: { text: 'text-slate-400', dot: 'bg-slate-300' },
}

function toneFor(vm) {
  if (vm.state === ACCOUNT_STATE.CONNECTED) return vm.needsPermission ? TONE.warning : TONE.healthy
  if (vm.state === ACCOUNT_STATE.EXPIRED) return TONE.warning
  if (vm.state === ACCOUNT_STATE.ERROR) return TONE.error
  return TONE.neutral
}

/** Small connection-status pill shown in the Overview header for one platform — the color and label follow the REAL backend state. */
export function ConnectedAccountCard({ account }) {
  const meta = PLATFORM_META[account.platform]
  if (!meta) return null
  const { label, Icon, iconClass, badgeClass } = meta
  const tone = toneFor(account)

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-sm" data-testid={`overview-${account.platform}-pill`} data-state={account.state}>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${badgeClass}`}>
        <Icon className={`h-4 w-4 ${iconClass}`} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        <span className={`flex items-center gap-1 text-xs font-medium ${tone.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
          {accountStatusLabel(account)}
        </span>
      </span>
    </div>
  )
}

export default ConnectedAccountCard
