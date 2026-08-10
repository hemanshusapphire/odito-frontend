"use client"

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import ToastStack from '@/components/shared/ToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'

import PluginsHeader from '@/components/wordpress/plugins/PluginsHeader'
import PluginsTabs from '@/components/wordpress/plugins/PluginsTabs'
import PluginsToolbar from '@/components/wordpress/plugins/PluginsToolbar'
import PluginTable from '@/components/wordpress/plugins/PluginTable'
import BulkActionBar from '@/components/wordpress/plugins/BulkActionBar'
import AddPluginModal from '@/components/wordpress/plugins/AddPluginModal'
import SchedulingPanel from '@/components/wordpress/plugins/SchedulingPanel'
import SchedulingHistoryTable from '@/components/wordpress/plugins/SchedulingHistoryTable'
import PluginHealthCard from '@/components/wordpress/plugins/PluginHealthCard'
import RecentActivityCard from '@/components/wordpress/plugins/RecentActivityCard'
import SummaryPanel from '@/components/wordpress/plugins/SummaryPanel'

import { PLUGINS as INITIAL_PLUGINS } from '@/lib/wordpressPluginsDummyData'
import { hashColor } from '@/lib/leadsDummyData'

const cardMotion = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }

/**
 * WordPress Management → Plugins. Frontend-only: PLUGINS is a static mock
 * array (lib/wordpressPluginsDummyData.js) copied into local state so
 * activate/deactivate/update/delete can mutate it - no backend, no API,
 * no WordPress communication, no real plugin installation logic.
 */
export default function WordPressPluginsPage() {
  const [tab, setTab] = useState('plugins')
  const [plugins, setPlugins] = useState(INITIAL_PLUGINS)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('name')
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [refreshing, setRefreshing] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [addPluginOpen, setAddPluginOpen] = useState(false)
  const { toasts, notify, dismiss } = useToastQueue()

  const counts = useMemo(() => ({
    all: plugins.length,
    active: plugins.filter((p) => p.status === 'active').length,
    inactive: plugins.filter((p) => p.status === 'inactive').length,
    updates: plugins.filter((p) => p.hasUpdate).length,
    favorites: plugins.filter((p) => p.isFavorite).length,
  }), [plugins])

  const filteredSorted = useMemo(() => {
    let out = plugins.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      if (filter === 'active' && p.status !== 'active') return false
      if (filter === 'inactive' && p.status !== 'inactive') return false
      if (filter === 'updates' && !p.hasUpdate) return false
      if (filter === 'favorites' && !p.isFavorite) return false
      return true
    })
    out = [...out].sort((a, b) => {
      if (sort === 'updated') return new Date(b.lastUpdated) - new Date(a.lastUpdated)
      if (sort === 'status') return a.status.localeCompare(b.status)
      if (sort === 'version') return a.currentVersion.localeCompare(b.currentVersion, undefined, { numeric: true })
      if (sort === 'size') return b.sizeKb - a.sizeKb
      return a.name.localeCompare(b.name)
    })
    return out
  }, [plugins, search, filter, sort])

  function updatePlugin(id, updater) {
    setPlugins((prev) => prev.map((p) => (p.id === id ? updater(p) : p)))
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll(checked) {
    setSelectedIds(checked ? new Set(filteredSorted.map((p) => p.id)) : new Set())
  }

  function toggleFavorite(id) {
    updatePlugin(id, (p) => ({ ...p, isFavorite: !p.isFavorite }))
  }

  // ── Row-level actions ─────────────────────────────────────────────
  function handleActivate(plugin) {
    updatePlugin(plugin.id, (p) => ({ ...p, status: 'active' }))
    notify(`${plugin.name} activated`, 'success')
  }
  function handleDeactivate(plugin) {
    updatePlugin(plugin.id, (p) => ({ ...p, status: 'inactive' }))
    notify(`${plugin.name} deactivated`)
  }
  function handleUpdate(plugin) {
    updatePlugin(plugin.id, (p) => ({ ...p, hasUpdate: false, currentVersion: p.latestVersion }))
    notify(`${plugin.name} updated to ${plugin.latestVersion}`, 'success')
  }
  function handleDelete(plugin) {
    setPlugins((prev) => prev.filter((p) => p.id !== plugin.id))
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(plugin.id); return next })
    notify(`${plugin.name} deleted`, 'danger')
  }
  function handleSettings(plugin) {
    notify(`Opening settings for ${plugin.name}`)
  }
  function handleViewDetails(plugin) {
    notify(`Viewing details for ${plugin.name}`)
  }

  // ── Bulk actions ──────────────────────────────────────────────────
  function bulkApply(action) {
    const count = selectedIds.size
    if (action === 'delete') {
      setPlugins((prev) => prev.filter((p) => !selectedIds.has(p.id)))
    } else if (action === 'activate') {
      setPlugins((prev) => prev.map((p) => (selectedIds.has(p.id) ? { ...p, status: 'active' } : p)))
    } else if (action === 'deactivate') {
      setPlugins((prev) => prev.map((p) => (selectedIds.has(p.id) ? { ...p, status: 'inactive' } : p)))
    } else if (action === 'update') {
      setPlugins((prev) => prev.map((p) => (selectedIds.has(p.id) && p.hasUpdate ? { ...p, hasUpdate: false, currentVersion: p.latestVersion } : p)))
    }
    notify(`${action[0].toUpperCase()}${action.slice(1)}d ${count} plugin${count === 1 ? '' : 's'}`, action === 'delete' ? 'danger' : 'success')
    setSelectedIds(new Set())
  }

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); notify('Plugin list refreshed', 'success') }, 700)
  }
  function handleScanUpdates() {
    setScanning(true)
    setTimeout(() => { setScanning(false); notify('Update scan complete', 'success') }, 1000)
  }

  function handleAddPlugin(form) {
    const newPlugin = {
      id: `plugin-${Date.now()}`,
      name: form.name,
      initials: form.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
      tint: hashColor(form.name),
      description: form.description || 'No description provided.',
      status: form.status,
      hasUpdate: false,
      currentVersion: form.version || '1.0.0',
      latestVersion: form.version || '1.0.0',
      isPremium: form.isPremium,
      isFavorite: false,
      hasSecurityWarning: false,
      sizeKb: 1024,
      lastUpdated: new Date().toISOString().slice(0, 10),
    }
    setPlugins((prev) => [newPlugin, ...prev])
    notify(`${form.name} added`, 'success')
  }

  const pageIds = filteredSorted.map((p) => p.id)
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id)).length
  const allSelected = pageIds.length > 0 && selectedOnPage === pageIds.length
  const someSelected = selectedOnPage > 0 && !allSelected

  return (
    <div className="flex-1 space-y-6 pb-10">
      <PluginsHeader
        onAddPlugin={() => setAddPluginOpen(true)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onScanUpdates={handleScanUpdates}
        scanning={scanning}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <PluginsTabs />

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-5 items-start mt-4">
          <div className="min-w-0 flex flex-col gap-4">
            <TabsContent value="plugins" className="mt-0">
              <motion.div {...cardMotion} transition={{ duration: 0.2 }} className="flex flex-col gap-4">
                <PluginsToolbar
                  search={search}
                  onSearchChange={setSearch}
                  filter={filter}
                  onFilterChange={setFilter}
                  sort={sort}
                  onSortChange={setSort}
                  counts={counts}
                />

                <Card className="p-0 overflow-hidden">
                  <PluginTable
                    plugins={filteredSorted}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onToggleFavorite={toggleFavorite}
                    onActivate={handleActivate}
                    onDeactivate={handleDeactivate}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onSettings={handleSettings}
                    onViewDetails={handleViewDetails}
                  />
                  <BulkActionBar
                    allSelected={allSelected}
                    someSelected={someSelected}
                    selectedCount={selectedIds.size}
                    onToggleAll={toggleSelectAll}
                    onActivate={() => bulkApply('activate')}
                    onDeactivate={() => bulkApply('deactivate')}
                    onUpdate={() => bulkApply('update')}
                    onDelete={() => bulkApply('delete')}
                    onExport={() => notify(`Exporting ${selectedIds.size} plugin(s)…`, 'success')}
                  />
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="scheduling" className="mt-0">
              <motion.div {...cardMotion} transition={{ duration: 0.2 }}>
                <SchedulingPanel onSave={() => notify('Scheduling settings saved', 'success')} />
              </motion.div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <motion.div {...cardMotion} transition={{ duration: 0.2 }}>
                <SchedulingHistoryTable />
              </motion.div>
            </TabsContent>
          </div>

          <div className="flex flex-col gap-4">
            <motion.div {...cardMotion} transition={{ duration: 0.2, delay: 0.05 }}><SummaryPanel /></motion.div>
            <motion.div {...cardMotion} transition={{ duration: 0.2, delay: 0.1 }}><PluginHealthCard /></motion.div>
            <motion.div {...cardMotion} transition={{ duration: 0.2, delay: 0.15 }}><RecentActivityCard /></motion.div>
          </div>
        </div>
      </Tabs>

      <AddPluginModal open={addPluginOpen} onOpenChange={setAddPluginOpen} onSubmit={handleAddPlugin} />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
