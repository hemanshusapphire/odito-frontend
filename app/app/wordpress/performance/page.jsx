"use client"

import { Gauge } from 'lucide-react'
import WordPressStubPage from '@/components/wordpress/WordPressStubPage'

export default function WordPressPerformancePage() {
  return (
    <WordPressStubPage
      icon={Gauge}
      title="Performance"
      description="Page speed, database health, object cache and CDN status for your site."
    />
  )
}
