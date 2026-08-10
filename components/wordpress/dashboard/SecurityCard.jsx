"use client"

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ScoreRing from '@/components/ui/ScoreRing'
import { CheckCircle2 } from 'lucide-react'
import { SECURITY } from '@/lib/wordpressDummyData'

const ROWS = [
  { key: 'firewall', label: 'Firewall', value: SECURITY.firewall },
  { key: 'malwareScan', label: 'Malware Scan', value: SECURITY.malwareScan.status, sub: `Last scan ${SECURITY.malwareScan.lastScan}` },
  { key: 'loginProtection', label: 'Login Protection', value: SECURITY.loginProtection },
  { key: 'ssl', label: 'SSL', value: SECURITY.ssl.status, sub: `Expires in ${SECURITY.ssl.expiresInDays} days` },
]

/** Security score ring + firewall/malware/login/SSL status rows, all green (healthy) by default. */
export default function SecurityCard() {
  return (
    <Card className="p-6 flex flex-col gap-5">
      <h3 className="text-sm font-semibold">Security</h3>

      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          <ScoreRing val={SECURITY.score} color="#10b981" color2="#34d399" size={64} />
          <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm">{SECURITY.score}</div>
        </div>
        <div>
          <div className="text-sm font-semibold">Security Score</div>
          <div className="text-xs text-muted-foreground">Your site is well protected</div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5">
            <div>
              <div className="text-xs font-medium">{row.label}</div>
              {row.sub && <div className="text-[10.5px] text-muted-foreground">{row.sub}</div>}
            </div>
            <Badge variant="success" className="gap-1 text-[10px]">
              <CheckCircle2 className="h-3 w-3" />
              {row.value}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}
