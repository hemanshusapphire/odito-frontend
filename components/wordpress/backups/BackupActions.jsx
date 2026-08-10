"use client"

import { motion } from 'framer-motion'
import { RotateCcw, Download, Copy, Trash2 } from 'lucide-react'

/** Large icon action grid: Restore / Download / Clone / Delete backup. */
export default function BackupActions({ onRestore, onDownload, onClone, onDelete }) {
  const actions = [
    { key: 'restore', label: 'Restore Backup', icon: RotateCcw, onClick: onRestore, tint: '#3b82f6' },
    { key: 'download', label: 'Download Backup', icon: Download, onClick: onDownload, tint: '#10b981' },
    { key: 'clone', label: 'Clone Website', icon: Copy, onClick: onClone, tint: '#8b5cf6' },
    { key: 'delete', label: 'Delete Backup', icon: Trash2, onClick: onDelete, tint: '#ef4444' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <motion.button
            key={action.key}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2.5 rounded-xl border bg-muted/20 px-3 py-5 text-center hover:shadow-md hover:bg-muted/40 transition-shadow"
          >
            <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${action.tint}18`, color: action.tint }}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-xs font-medium">{action.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
