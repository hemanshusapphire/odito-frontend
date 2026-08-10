"use client"

import { Settings } from 'lucide-react'
import WordPressStubPage from '@/components/wordpress/WordPressStubPage'

export default function WordPressSettingsPage() {
  return (
    <WordPressStubPage
      icon={Settings}
      title="Settings"
      description="Configure sync frequency, notification preferences and connected sites."
    />
  )
}
