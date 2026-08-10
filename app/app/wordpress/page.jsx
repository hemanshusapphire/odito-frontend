"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ToastStack from '@/components/shared/ToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'

import DashboardHeader from '@/components/wordpress/dashboard/DashboardHeader'
import DashboardSkeleton from '@/components/wordpress/dashboard/DashboardSkeleton'
import UpdatesCard from '@/components/wordpress/dashboard/UpdatesCard'
import BackupsCard from '@/components/wordpress/dashboard/BackupsCard'
import AnalyticsCard from '@/components/wordpress/dashboard/AnalyticsCard'
import OptimizationCard from '@/components/wordpress/dashboard/OptimizationCard'
import SecurityCard from '@/components/wordpress/dashboard/SecurityCard'
import PerformanceCard from '@/components/wordpress/dashboard/PerformanceCard'
import WebsiteInfoCard from '@/components/wordpress/dashboard/WebsiteInfoCard'
import RecentActivityCard from '@/components/wordpress/dashboard/RecentActivityCard'

import { SITES } from '@/lib/wordpressDummyData'

const cardMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}

/**
 * WordPress Management - Dashboard. Frontend-only: every figure comes from
 * lib/wordpressDummyData.js, no API calls, no React Query, no backend.
 * Modeled after the ManageWP dashboard reference, rebuilt in Odito's own
 * card/typography/color system rather than copied 1:1.
 */
export default function WordPressDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [siteId, setSiteId] = useState(SITES[0].id)
  const [syncing, setSyncing] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { toasts, notify, dismiss } = useToastQueue()

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  function handleSync() {
    setSyncing(true)
    setTimeout(() => { setSyncing(false); notify('Site data synced', 'success') }, 900)
  }

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); notify('Dashboard refreshed', 'success') }, 700)
  }

  return (
    <div className="flex-1 space-y-6 pb-10">
      <DashboardHeader
        siteId={siteId}
        onSiteChange={setSiteId}
        onSync={handleSync}
        syncing={syncing}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <motion.div {...cardMotion} transition={{ duration: 0.25, delay: 0 }}>
            <UpdatesCard onNotify={notify} />
          </motion.div>

          <div className="flex flex-col gap-5">
            <motion.div {...cardMotion} transition={{ duration: 0.25, delay: 0.05 }}>
              <BackupsCard />
            </motion.div>
            <motion.div {...cardMotion} transition={{ duration: 0.25, delay: 0.1 }}>
              <AnalyticsCard />
            </motion.div>
          </div>

          <motion.div {...cardMotion} transition={{ duration: 0.25, delay: 0.15 }}>
            <OptimizationCard onNotify={notify} />
          </motion.div>

          <motion.div {...cardMotion} transition={{ duration: 0.25, delay: 0.2 }}>
            <SecurityCard />
          </motion.div>

          <motion.div {...cardMotion} transition={{ duration: 0.25, delay: 0.25 }}>
            <PerformanceCard />
          </motion.div>

          <motion.div {...cardMotion} transition={{ duration: 0.25, delay: 0.3 }}>
            <WebsiteInfoCard />
          </motion.div>

          <motion.div {...cardMotion} transition={{ duration: 0.25, delay: 0.35 }} className="lg:col-span-2">
            <RecentActivityCard />
          </motion.div>
        </div>
      )}

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
