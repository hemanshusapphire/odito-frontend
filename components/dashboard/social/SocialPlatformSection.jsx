"use client"

import { Card } from '@/components/ui/card'
import PlatformHeader from './PlatformHeader'
import PlatformStatsGrid from './PlatformStatsGrid'
import PlatformChart from './PlatformChart'

/** One full platform card: header (icon/name/status) + KPI grid + chart. */
export default function SocialPlatformSection({ platform, onConnect, period, onPeriodChange, chartLoading }) {
  return (
    <Card className="p-5 flex flex-col gap-4">
      <PlatformHeader
        icon={platform.icon}
        name={platform.name}
        tint={platform.brandColor}
        connected={platform.connected}
        connectMessage={platform.connectMessage}
      />

      <PlatformStatsGrid kpis={platform.kpis} tint={platform.brandColor} />

      <PlatformChart
        chart={platform.chart}
        connected={platform.connected}
        icon={platform.icon}
        tint={platform.brandColor}
        platformName={platform.name}
        connectMessage={platform.connectMessage}
        onConnect={() => onConnect(platform.id)}
        emptyMessage={platform.chartEmptyMessage}
        period={period}
        onPeriodChange={onPeriodChange}
        loading={chartLoading}
        rangeLabel={platform.chartRangeLabel}
      />
    </Card>
  )
}
