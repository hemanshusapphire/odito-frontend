"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UploadCloud, FileSpreadsheet } from 'lucide-react'

/**
 * Simulated CSV import - no backend to import into. Picking a file just
 * shows its name and lets "Import" fire the same success toast a real
 * import would; nothing is parsed or persisted.
 */
export default function ImportLeadsDialog({ open, onOpenChange, onImport }) {
  const [fileName, setFileName] = useState(null)

  function handleOpenChange(next) {
    if (!next) setFileName(null)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Import Leads</DialogTitle>
          <DialogDescription>Upload a CSV file of leads to add to your pipeline.</DialogDescription>
        </DialogHeader>

        <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors">
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
          />
          {fileName ? (
            <>
              <FileSpreadsheet className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">{fileName}</span>
            </>
          ) : (
            <>
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to choose a CSV file</span>
            </>
          )}
        </label>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onImport(fileName)} disabled={!fileName}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
