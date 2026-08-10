"use client"

import { ShieldCheck } from 'lucide-react'
import WordPressStubPage from '@/components/wordpress/WordPressStubPage'

export default function WordPressSecurityPage() {
  return (
    <WordPressStubPage
      icon={ShieldCheck}
      title="Security"
      description="Firewall status, malware scans, login protection and SSL health in one place."
    />
  )
}
