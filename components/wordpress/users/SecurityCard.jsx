"use client"

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SECURITY } from '@/lib/wordpressUsersDummyData'

/** 2FA-enabled count, weak passwords, locked accounts, security alerts, last audit. */
export default function SecurityCard() {
  return (
    <Card className="p-5 flex flex-col gap-3">
      <h3 className="text-sm font-semibold mb-1">Security</h3>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">2FA Enabled Users</span>
        <Badge variant="success" className="text-[10px]">{SECURITY.twoFactorEnabledCount}</Badge>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Weak Passwords</span>
        <Badge variant={SECURITY.weakPasswords > 0 ? 'warning' : 'success'} className="text-[10px]">{SECURITY.weakPasswords}</Badge>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Locked Accounts</span>
        <Badge variant={SECURITY.lockedAccounts > 0 ? 'critical' : 'success'} className="text-[10px]">{SECURITY.lockedAccounts}</Badge>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Security Alerts</span>
        <Badge variant={SECURITY.securityAlerts > 0 ? 'critical' : 'success'} className="text-[10px]">{SECURITY.securityAlerts}</Badge>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Last Audit</span>
        <span className="font-mono font-semibold">{SECURITY.lastAudit}</span>
      </div>
    </Card>
  )
}
