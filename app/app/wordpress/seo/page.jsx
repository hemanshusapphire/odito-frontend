"use client"

import { Search } from 'lucide-react'
import WordPressStubPage from '@/components/wordpress/WordPressStubPage'

export default function WordPressSEOPage() {
  return (
    <WordPressStubPage
      icon={Search}
      title="SEO"
      description="On-page SEO health, keyword rankings and sitemap status for your WordPress site."
    />
  )
}
