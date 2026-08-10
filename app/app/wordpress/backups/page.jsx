"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import ToastStack from '@/components/shared/ToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'

import BackupsHeader from '@/components/wordpress/backups/BackupsHeader'
import BackupCalendar from '@/components/wordpress/backups/BackupCalendar'
import BackupStatusCard from '@/components/wordpress/backups/BackupStatusCard'
import BackupTimeline from '@/components/wordpress/backups/BackupTimeline'
import BackupDetailsCard from '@/components/wordpress/backups/BackupDetailsCard'
import BackupStatistics from '@/components/wordpress/backups/BackupStatistics'
import StorageCard from '@/components/wordpress/backups/StorageCard'
import RecentActivity from '@/components/wordpress/backups/RecentActivity'

import { LAST_BACKUP, backupHistoryFor } from '@/lib/wordpressBackupsDummyData'

const cardMotion = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }

function PageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
      <Card className="p-4 flex flex-col gap-3">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </Card>
      <Card className="p-6 flex flex-col gap-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64 w-full" />
      </Card>
    </div>
  )
}

/**
 * WordPress Management → Backups. Frontend-only: everything comes from
 * lib/wordpressBackupsDummyData.js - no API calls, no React Query, no
 * backend, no real backup engine.
 */
export default function WordPressBackupsPage() {
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(LAST_BACKUP.date)
  const [backingUp, setBackingUp] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { toasts, notify, dismiss } = useToastQueue()

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  function handleBackupNow() {
    setBackingUp(true)
    setTimeout(() => { setBackingUp(false); notify('Backup completed successfully', 'success') }, 1400)
  }

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); notify('Backups refreshed', 'success') }, 700)
  }

  return (
    <div className="flex-1 space-y-6 pb-10">
      <BackupsHeader
        onBackupNow={handleBackupNow}
        backingUp={backingUp}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onSettings={() => notify('Open the Backup Details → Settings tab to configure backups')}
      />

      {loading ? (
        <PageSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start">
            <motion.div {...cardMotion} transition={{ duration: 0.25 }} className="flex flex-col gap-4">
              <BackupCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
              <BackupStatusCard onBackupNow={handleBackupNow} backingUp={backingUp} />
              <div className="rounded-xl border bg-card p-4">
                <BackupTimeline selectedDate={selectedDate} entries={backupHistoryFor(selectedDate)} />
              </div>
            </motion.div>

            <motion.div {...cardMotion} transition={{ duration: 0.25, delay: 0.08 }}>
              <BackupDetailsCard
                onNotify={notify}
                onRestore={() => notify('Open the Restore tab to choose a restore point')}
                onDownload={() => notify('Backup download started', 'success')}
                onClone={() => notify('Cloning website from this backup…', 'success')}
                onDelete={() => notify('Backup deleted', 'danger')}
              />
            </motion.div>
          </div>

          <motion.div {...cardMotion} transition={{ duration: 0.25, delay: 0.12 }}>
            <BackupStatistics />
          </motion.div>

          <motion.div {...cardMotion} transition={{ duration: 0.25, delay: 0.16 }} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <StorageCard />
            <RecentActivity />
          </motion.div>
        </>
      )}

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
