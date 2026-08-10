"use client"

import { Card } from '@/components/ui/card'

/** Shared placeholder body for the Feeds/Publishing/Reports tabs - the reference only specified these as tab labels, with no content shown for them. */
export default function SocialComingSoonCard({ icon: Icon, title, description }) {
  return (
    <Card className="p-10 flex flex-col items-center text-center gap-3">
      <span className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </Card>
  )
}
