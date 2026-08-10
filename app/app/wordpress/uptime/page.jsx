"use client"

import { Activity } from 'lucide-react'
import WordPressStubPage from '@/components/wordpress/WordPressStubPage'

export default function WordPressUptimePage() {
  return (
    <WordPressStubPage
      icon={Activity}
      title="Uptime Monitor"
      description="Track site availability and get notified the moment your site goes down."
    />
  )
}
