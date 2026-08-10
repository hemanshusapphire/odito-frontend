"use client"

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Tabs } from '@/components/ui/tabs'
import ToastStack from '@/components/shared/ToastStack'
import { useToastQueue } from '@/hooks/useToastQueue'

import UsersHeader from '@/components/wordpress/users/UsersHeader'
import UsersToolbar from '@/components/wordpress/users/UsersToolbar'
import RoleTabs from '@/components/wordpress/users/RoleTabs'
import UsersTable from '@/components/wordpress/users/UsersTable'
import BulkActionBar from '@/components/wordpress/users/BulkActionBar'
import AddUserModal from '@/components/wordpress/users/AddUserModal'
import UserDetailsDrawer from '@/components/wordpress/users/UserDetailsDrawer'
import UserStatistics from '@/components/wordpress/users/UserStatistics'
import UserActivityCard from '@/components/wordpress/users/UserActivityCard'
import SecurityCard from '@/components/wordpress/users/SecurityCard'
import RecentActivityCard from '@/components/wordpress/users/RecentActivityCard'

import { USERS as INITIAL_USERS, computeStats } from '@/lib/wordpressUsersDummyData'

const cardMotion = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
const INITIAL_LOAD_GAP = 4

/**
 * WordPress Management → Users. Frontend-only: USERS is a static mock
 * array (lib/wordpressUsersDummyData.js) copied into local state so
 * activate/deactivate/role-change/delete can mutate it - no backend, no
 * API, no WordPress authentication, no real user creation/deletion logic.
 */
export default function WordPressUsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS)
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [loadedCount, setLoadedCount] = useState(() => Math.max(1, INITIAL_USERS.length - INITIAL_LOAD_GAP))
  const [refreshing, setRefreshing] = useState(false)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [detailsUser, setDetailsUser] = useState(null)
  const { toasts, notify, dismiss } = useToastQueue()

  const stats = useMemo(() => computeStats(users), [users])
  const tabCounts = useMemo(() => ({
    Administrator: stats.administrators,
    Editor: stats.editors,
    Author: stats.authors,
    Subscriber: stats.subscribers,
    __inactive__: stats.inactive,
  }), [stats])

  const filtered = useMemo(() => users.filter((u) => {
    if (roleFilter === '__inactive__') { if (u.status !== 'inactive') return false }
    else if (roleFilter) { if (u.role !== roleFilter) return false }
    if (search) {
      const q = search.toLowerCase()
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase()
      if (!fullName.includes(q) && !u.username.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false
    }
    return true
  }), [users, roleFilter, search])

  const visibleUsers = filtered.slice(0, loadedCount)

  function updateFilter(setter, value) {
    setter(value)
    setSelectedIds(new Set())
  }

  function updateUser(id, updater) {
    setUsers((prev) => prev.map((u) => (u.id === id ? updater(u) : u)))
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
    setSelectedIds(checked ? new Set(visibleUsers.map((u) => u.id)) : new Set())
  }

  // ── Row-level actions ─────────────────────────────────────────────
  function handleEdit(user) {
    notify(`Opening editor for ${user.username}`)
  }
  function handleResetPassword(user) {
    notify(`Password reset email sent to ${user.email}`, 'success')
  }
  function handleChangeRoleRow(user) {
    notify(`Opening role picker for ${user.username}`)
  }
  function handleSuspend(user) {
    updateUser(user.id, (u) => ({ ...u, status: 'blocked' }))
    notify(`${user.username} suspended`, 'danger')
  }
  function handleDelete(user) {
    setUsers((prev) => prev.filter((u) => u.id !== user.id))
    setSelectedIds((prev) => { const next = new Set(prev); next.delete(user.id); return next })
    if (detailsUser?.id === user.id) setDetailsUser(null)
    notify(`${user.username} deleted`, 'danger')
  }

  // ── Bulk actions ──────────────────────────────────────────────────
  function bulkChangeRole(role) {
    const count = selectedIds.size
    setUsers((prev) => prev.map((u) => (selectedIds.has(u.id) ? { ...u, role } : u)))
    notify(`Changed role to ${role} for ${count} user${count === 1 ? '' : 's'}`, 'success')
    setSelectedIds(new Set())
  }
  function bulkDeactivate() {
    const count = selectedIds.size
    setUsers((prev) => prev.map((u) => (selectedIds.has(u.id) ? { ...u, status: 'inactive' } : u)))
    notify(`Deactivated ${count} user${count === 1 ? '' : 's'}`, 'success')
    setSelectedIds(new Set())
  }
  function bulkDelete() {
    const count = selectedIds.size
    setUsers((prev) => prev.filter((u) => !selectedIds.has(u.id)))
    notify(`Deleted ${count} user${count === 1 ? '' : 's'}`, 'danger')
    setSelectedIds(new Set())
  }

  function handleAddUser(form) {
    const newUser = {
      id: `new-${Date.now()}`, firstName: form.firstName, lastName: form.lastName, username: form.username,
      email: form.email, role: form.role, bio: form.bio || 'No biographical info', status: 'active',
      twoFactorEnabled: false, lastLogin: null, registeredAt: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      postsCreated: 0, comments: 0, website: null, activity: [{ text: 'Account created', time: 'Just now' }],
      initials: `${form.firstName[0] || ''}${form.lastName[0] || ''}`.toUpperCase() || form.username.slice(0, 2).toUpperCase(),
      tint: '#3b82f6',
    }
    setUsers((prev) => [newUser, ...prev])
    setLoadedCount((prev) => prev + 1)
    notify(`${form.username} created`, 'success')
  }

  function handleRefresh() {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); notify('User list refreshed', 'success') }, 700)
  }

  const pageIds = visibleUsers.map((u) => u.id)
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id)).length
  const allSelected = pageIds.length > 0 && selectedOnPage === pageIds.length
  const someSelected = selectedOnPage > 0 && !allSelected

  return (
    <div className="flex-1 space-y-6 pb-10">
      <UsersHeader
        onAddUser={() => setAddUserOpen(true)}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onImport={() => notify('Import Users is a frontend-only mock in this demo')}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-5 items-start">
        <div className="min-w-0 flex flex-col gap-4">
          <UsersToolbar
            role={roleFilter}
            onRoleChange={(v) => updateFilter(setRoleFilter, v)}
            search={search}
            onSearchChange={(v) => updateFilter(setSearch, v)}
            visibleCount={visibleUsers.length}
            totalCount={filtered.length}
            onLoadAll={() => setLoadedCount(filtered.length)}
          />

          <Tabs value={roleFilter || 'Administrator'} onValueChange={(v) => updateFilter(setRoleFilter, v)}>
            <RoleTabs counts={tabCounts} />
          </Tabs>

          <motion.div {...cardMotion} transition={{ duration: 0.2 }}>
            <Card className="p-0 overflow-hidden">
              <UsersTable
                users={visibleUsers}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onOpenDetails={setDetailsUser}
                onEdit={handleEdit}
                onResetPassword={handleResetPassword}
                onChangeRole={handleChangeRoleRow}
                onSuspend={handleSuspend}
                onDelete={handleDelete}
              />
              <BulkActionBar
                allSelected={allSelected}
                someSelected={someSelected}
                selectedCount={selectedIds.size}
                onToggleAll={toggleSelectAll}
                onChangeRole={bulkChangeRole}
                onDeactivate={bulkDeactivate}
                onDelete={bulkDelete}
                onExport={() => notify(`Exporting ${selectedIds.size} user(s)…`, 'success')}
              />
            </Card>
          </motion.div>
        </div>

        <div className="flex flex-col gap-4">
          <motion.div {...cardMotion} transition={{ duration: 0.2, delay: 0.05 }}><UserActivityCard /></motion.div>
          <motion.div {...cardMotion} transition={{ duration: 0.2, delay: 0.1 }}><SecurityCard /></motion.div>
          <motion.div {...cardMotion} transition={{ duration: 0.2, delay: 0.15 }}><RecentActivityCard /></motion.div>
        </div>
      </div>

      <motion.div {...cardMotion} transition={{ duration: 0.2, delay: 0.1 }}>
        <UserStatistics stats={stats} />
      </motion.div>

      <AddUserModal open={addUserOpen} onOpenChange={setAddUserOpen} onSubmit={handleAddUser} />

      <UserDetailsDrawer
        user={detailsUser}
        open={!!detailsUser}
        onOpenChange={(open) => !open && setDetailsUser(null)}
        onEdit={handleEdit}
        onResetPassword={handleResetPassword}
        onSuspend={handleSuspend}
        onDelete={handleDelete}
      />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
