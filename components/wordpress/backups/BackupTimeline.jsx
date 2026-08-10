"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Clock, User, CalendarClock } from 'lucide-react'

const STATUS_VARIANT = { Completed: 'success', Failed: 'critical', 'In Progress': 'info' }

/** Backup entries for the selected calendar date - time, type, status, size - newest first. */
export default function BackupTimeline({ selectedDate, entries }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-xs font-semibold text-muted-foreground">Backups for {selectedDate}</h4>

      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No backups recorded for this date.</p>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {entries.map((entry, i) => (
              <motion.div
                key={`${selectedDate}-${entry.time}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="flex items-center gap-3 rounded-lg border-l-2 border-l-emerald-500 bg-muted/30 px-3 py-2.5"
              >
                <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold w-16 shrink-0">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  {entry.time}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground flex-1 min-w-0">
                  {entry.type === 'Manual' ? <User className="h-3 w-3 shrink-0" /> : <CalendarClock className="h-3 w-3 shrink-0" />}
                  {entry.type} Backup
                </span>
                <Badge variant={STATUS_VARIANT[entry.status]} className="text-[10px] shrink-0">{entry.status}</Badge>
                <span className="text-xs font-mono font-medium shrink-0 w-14 text-right">
                  {entry.sizeGb > 0 ? `${entry.sizeGb.toFixed(2)} GB` : '—'}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
