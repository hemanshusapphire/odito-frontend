"use client"

import { Card } from '@/components/ui/card'
import { WEBSITE_INFO } from '@/lib/wordpressDummyData'

const ROWS = [
  { label: 'Website URL', value: WEBSITE_INFO.url },
  { label: 'Hosting', value: WEBSITE_INFO.hosting },
  { label: 'PHP Version', value: WEBSITE_INFO.phpVersion },
  { label: 'WordPress Version', value: WEBSITE_INFO.wpVersion },
  { label: 'Theme', value: WEBSITE_INFO.theme },
  { label: 'Active Plugins', value: WEBSITE_INFO.activePlugins },
  { label: 'Users', value: WEBSITE_INFO.users },
  { label: 'Disk Usage', value: `${WEBSITE_INFO.diskUsage.usedGb} GB / ${WEBSITE_INFO.diskUsage.totalGb} GB` },
]

/** Static site info table: URL, hosting, PHP/WP versions, theme, plugin/user counts, disk usage. */
export default function WebsiteInfoCard() {
  return (
    <Card className="p-6 flex flex-col gap-3">
      <h3 className="text-sm font-semibold">Website Information</h3>
      <div className="flex flex-col divide-y">
        {ROWS.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2 text-xs">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium text-right truncate max-w-[60%]">{row.value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
