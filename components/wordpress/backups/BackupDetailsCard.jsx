"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import BackupOverview from './BackupOverview'
import BackupContent from './BackupContent'
import BackupSettings from './BackupSettings'
import BackupRestore from './BackupRestore'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'content', label: 'Content' },
  { value: 'settings', label: 'Settings' },
  { value: 'restore', label: 'Restore' },
]

/** Large "Backup Details" card: Overview / Content / Settings / Restore tabs. */
export default function BackupDetailsCard({ onNotify, onRestore, onDownload, onClone, onDelete }) {
  const [tab, setTab] = useState('overview')

  return (
    <Card className="p-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map((t) => <TabsTrigger key={t.value} value={t.value} className="px-4">{t.label}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <BackupOverview onRestore={onRestore} onDownload={onDownload} onClone={onClone} onDelete={onDelete} />
        </TabsContent>
        <TabsContent value="content" className="mt-5">
          <BackupContent />
        </TabsContent>
        <TabsContent value="settings" className="mt-5">
          <BackupSettings onSave={() => onNotify('Backup settings saved', 'success')} />
        </TabsContent>
        <TabsContent value="restore" className="mt-5">
          <BackupRestore onNotify={onNotify} />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
