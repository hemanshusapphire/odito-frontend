"use client"

import { Badge } from '@/components/ui/badge'

/** Platform icon chip + name + connection-status badge. */
export default function PlatformHeader({ icon: Icon, name, tint, connected, connectMessage }) {
  const isExpired = !connected && /expired/i.test(connectMessage || '')

  return (
    <div className="flex items-center gap-3">
      <span
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${tint}18`, color: tint }}
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <h3 className="text-base font-semibold">{name}</h3>
      {connected ? (
        <Badge variant="success">Connected</Badge>
      ) : (
        <Badge variant={isExpired ? 'warning' : 'critical'}>{isExpired ? 'Token Expired' : 'Not Connected'}</Badge>
      )}
    </div>
  )
}
