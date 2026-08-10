"use client"

import { AnimatePresence, motion } from 'framer-motion'
import { Users } from 'lucide-react'
import UserRow from './UserRow'

/** User list - one UserRow per user, or an empty state when filters/search leave zero results. */
export default function UsersTable({ users, selectedIds, onToggleSelect, ...rowHandlers }) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-2 text-muted-foreground py-16">
        <Users className="h-8 w-8 opacity-40" />
        <p className="text-sm">No users match your filters.</p>
      </div>
    )
  }

  return (
    <div>
      <AnimatePresence initial={false}>
        {users.map((user) => (
          <motion.div key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <UserRow user={user} selected={selectedIds.has(user.id)} onToggleSelect={onToggleSelect} {...rowHandlers} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
