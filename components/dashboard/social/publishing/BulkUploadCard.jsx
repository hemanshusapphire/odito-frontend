"use client"

import { Card } from '@/components/ui/card'
import { UploadCloud } from 'lucide-react'

/**
 * Bulk Upload has a real backend endpoint (POST /api/social/publishing/
 * bulk — every valid row becomes a real draft, never an immediate
 * publish) but no CSV/Excel parsing UI yet. The previous version of this
 * component simulated a fake import with a fabricated validation summary
 * and a made-up upload history — removed rather than left pointing at
 * nothing real. This honest "coming soon" state replaces it until a real
 * file-parsing flow exists.
 */
export default function BulkUploadCard() {
  return (
    <Card className="flex flex-col items-center justify-center text-center py-20 px-6">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
        <UploadCloud className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold mb-1.5">Bulk Upload is coming soon</h3>
      <p className="text-muted-foreground text-sm max-w-sm">
        Importing many posts at once from a CSV or Excel file isn't available yet. For now, create posts one at a time from Create New Post.
      </p>
    </Card>
  )
}
