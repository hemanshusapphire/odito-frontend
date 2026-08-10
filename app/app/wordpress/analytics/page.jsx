"use client"

import { BarChart3 } from 'lucide-react'
import WordPressStubPage from '@/components/wordpress/WordPressStubPage'

export default function WordPressAnalyticsPage() {
  return (
    <WordPressStubPage
      icon={BarChart3}
      title="Analytics"
      description="Deeper visitor, pageview and traffic-source analytics for your WordPress site."
    />
  )
}
