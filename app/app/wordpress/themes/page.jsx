"use client"

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import ToastStack from '@/components/shared/ToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'

import ThemesHeader from '@/components/wordpress/themes/ThemesHeader'
import ThemesTabs from '@/components/wordpress/themes/ThemesTabs'
import ThemesToolbar from '@/components/wordpress/themes/ThemesToolbar'
import ThemeList from '@/components/wordpress/themes/ThemeList'
import BulkActionBar from '@/components/wordpress/themes/BulkActionBar'
import AddThemeModal from '@/components/wordpress/themes/AddThemeModal'
import ThemeDetailsDrawer from '@/components/wordpress/themes/ThemeDetailsDrawer'
import SchedulingPanel from '@/components/wordpress/themes/SchedulingPanel'
import SchedulingHistoryTable from '@/components/wordpress/themes/SchedulingHistoryTable'
import ThemeHealthCard from '@/components/wordpress/themes/ThemeHealthCard'
import CompatibilityCard from '@/components/wordpress/themes/CompatibilityCard'
import RecentActivityCard from '@/components/wordpress/themes/RecentActivityCard'

import { THEMES as INITIAL_THEMES } from '@/lib/wordpressThemesDummyData'
import { hashColor } from '@/lib/leadsDummyData'

const cardMotion = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }

/**
 * WordPress Management → Themes. Frontend-only: THEMES is a static mock
 * array (lib/wordpressThemesDummyData.js) copied into local state so
 * activate/deactivate/update/delete can mutate it - no backend, no API,
 * no WordPress communication, no real theme installation logic.
 */
export default function WordPressThemesPage() {
  const [tab, setTab] = useState('themes')
  const [themes, setThemes] = useState(INITIAL_THEMES)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('name')
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [refreshing, setRefreshing] = useState(false)
  const [checking, setChecking] = useState(false)
  const [detailsTheme, setDetailsTheme] = useState(null)
  const [addThemeOpen, setAddThemeOpen] = useState(false)
  const { toasts, notify, dismiss } = useToastQueue()

  const counts = useMemo(() => ({
    all: themes.length,
    active: themes.filter((t) => t.status === 'active').length,
    inactive: themes.filter((t) => t.status === 'inactive').length,
    updates: themes.filter((t) => t.hasUpdate).length,
    favorites: themes.filter((t) => t.isFavorite).length,
  }), [themes])

  const filteredSorted = useMemo(() => {
    let out = themes.filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
      if (filter === 'active' && t.status !== 'active') return false
      if (filter === 'inactive' && t.status !== 'inactive') return false
      if (filter === 'updates' && !t.hasUpdate) return false
      if (filter === 'favorites' && !t.isFavorite) return false
      return true
    })
    out = [...out].sort((a, b) => {
      if (sort === 'updated') return new Date(b.lastUpdated) - new Date(a.lastUpdated)
      if (sort === 'version') return a.currentVersion.localeCompare(b.currentVersion, undefined, { numeric: true })
      if (sort === 'status') return a.status.localeCompare(b.status)
      if (sort === 'type') return (a.parentTheme ? 1 : 0) - (b.parentTheme ? 1 : 0)
      return a.name.localeCompare(b.name)
    })
    return out
  }, [themes, search, filter, sort])

  function updateTheme(id, updater) {
    setThemes((prev) => prev.map((t) => (t.id === id ? updater(t) : t)))
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
    setSelectedIds(checked ? new Set(filteredSorted.map((t) => t.id)) : new Set())
  }

  function toggleFavorite(id) {
    updateTheme(id, (t) => ({ ...t, isFavorite: !t.isFavorite }))
  }

  // ── Row-level actions ─────────────────────────────────────────────
  function handleActivate(theme) {
    updateTheme(theme.id, (t) => ({ ...t, status: 'active' }))
    notify(`${theme.name} activated`, 'success')
  }
  function handleDeactivate(theme) {
    updateTheme(theme.id, (t) => ({ ...t, status: 'inactive' }))
    notify(`${theme.name} deactivated`)
  }
  function handleUpdate(theme) {
    updateTheme(theme.id, (t) => ({ ...t, hasUpdate: false, currentVersion: t.latestVersion }))
    notify(`${theme.name} updated to ${theme.latestVersion}`, 'success')
  }
  function handleDelete(theme) {
    setThemes((prev) => prev.filter((t) => t.id !== theme.id))
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(theme.id); return next })
    notify(`${theme.name} deleted`, 'danger')
  }
  function handleCustomize(theme) {
    notify(`Opening Customizer for ${theme.name}`)
  }
  function handlePreview(theme) {
    notify(`Previewing ${theme.name}`)
  }

  // ── Bulk actions ──────────────────────────────────────────────────
  function bulkApply(action) {
    const count = selectedIds.size
    if (action === 'delete') {
      setThemes((prev) => prev.filter((t) => !selectedIds.has(t.id)))
    } else if (action === 'activate') {
      setThemes((prev) => prev.map((t) => (selectedIds.has(t.id) ? { ...t, status: 'active' } : t)))
    } else if (action === 'deactivate') {
      setThemes((prev) => prev.map((t) => (selectedIds.has(t.id) ? { ...t, status: 'inactive' } : t)))
    } else if (action === 'update') {
      setThemes((prev) => prev.map((t) => (selectedIds.has(t.id) && t.hasUpdate ? { ...t, hasUpdate: false, currentVersion: t.latestVersion } : t)))
    }
    notify(`${action[0].toUpperCase()}${action.slice(1)}d ${count} theme${count === 1 ? '' : 's'}`, action === 'delete' ? 'danger' : 'success')
    setSelectedIds(new Set())
  }

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); notify('Theme list refreshed', 'success') }, 700)
  }
  function handleCheckUpdates() {
    setChecking(true)
    setTimeout(() => { setChecking(false); notify('Update check complete', 'success') }, 1000)
  }

  function handleAddTheme(form) {
    const newTheme = {
      id: `theme-${Date.now()}`,
      name: form.name,
      tint: hashColor(form.name),
      description: form.description || 'No description provided.',
      status: 'inactive',
      hasUpdate: false,
      currentVersion: form.version || '1.0.0',
      latestVersion: form.version || '1.0.0',
      isPremium: form.isPremium,
      isFavorite: false,
      parentTheme: form.themeType === 'child' ? form.parentTheme : null,
      author: form.author || 'Unknown',
      wpCompat: '6.0+',
      phpCompat: '7.4+',
      license: form.isPremium ? 'Licensed' : 'Free (GPL)',
      installedAt: new Date().toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
    }
    setThemes((prev) => [newTheme, ...prev])
    notify(`${form.name} added`, 'success')
  }

  const pageIds = filteredSorted.map((t) => t.id)
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id)).length
  const allSelected = pageIds.length > 0 && selectedOnPage === pageIds.length
  const someSelected = selectedOnPage > 0 && !allSelected

  return (
    <div className="flex-1 space-y-6 pb-10">
      <ThemesHeader
        onAddTheme={() => setAddThemeOpen(true)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onCheckUpdates={handleCheckUpdates}
        checking={checking}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <ThemesTabs />

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-5 items-start mt-4">
          <div className="min-w-0 flex flex-col gap-4">
            <TabsContent value="themes" className="mt-0">
              <motion.div {...cardMotion} transition={{ duration: 0.2 }} className="flex flex-col gap-4">
                <ThemesToolbar
                  search={search}
                  onSearchChange={setSearch}
                  filter={filter}
                  onFilterChange={setFilter}
                  sort={sort}
                  onSortChange={setSort}
                  counts={counts}
                />

                <Card className="p-0 overflow-hidden">
                  <ThemeList
                    themes={filteredSorted}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onToggleFavorite={toggleFavorite}
                    onOpenDetails={setDetailsTheme}
                    onActivate={handleActivate}
                    onDeactivate={handleDeactivate}
                    onUpdate={handleUpdate}
                    onCustomize={handleCustomize}
                    onPreview={handlePreview}
                    onDelete={handleDelete}
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
            <motion.div {...cardMotion} transition={{ duration: 0.2, delay: 0.05 }}><ThemeHealthCard /></motion.div>
            <motion.div {...cardMotion} transition={{ duration: 0.2, delay: 0.1 }}><CompatibilityCard /></motion.div>
            <motion.div {...cardMotion} transition={{ duration: 0.2, delay: 0.15 }}><RecentActivityCard /></motion.div>
          </div>
        </div>
      </Tabs>

      <ThemeDetailsDrawer
        theme={detailsTheme}
        open={!!detailsTheme}
        onOpenChange={(open) => !open && setDetailsTheme(null)}
        onPreview={handlePreview}
        onCustomize={handleCustomize}
        onActivate={handleActivate}
        onUpdate={handleUpdate}
      />

      <AddThemeModal
        open={addThemeOpen}
        onOpenChange={setAddThemeOpen}
        onSubmit={handleAddTheme}
        parentThemeOptions={themes.filter((t) => !t.parentTheme).map((t) => t.name)}
      />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
