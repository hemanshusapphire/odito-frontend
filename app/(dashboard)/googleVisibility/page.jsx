"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Search,
  BarChart3,
  Building,
  Plus,
  RefreshCw,
} from 'lucide-react'

export default function GoogleVisibilityPage() {
  const router = useRouter()

  return (
    <div className="flex-1 space-y-6">
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Google Visibility</h1>
            <p className="text-muted-foreground">Monitor your Google search presence and performance</p>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Google Visibility Overview</h2>
            <p className="text-muted-foreground">Connect your Google account to view Search Console, Analytics, and Business Profile data.</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => router.push('/projects/new')}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Connect Google
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 border-dashed border-2">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Search Console</h3>
              <p className="text-sm text-muted-foreground">View search rankings and performance</p>
              <Button variant="outline" className="w-full">Coming Soon</Button>
            </div>
          </Card>

          <Card className="p-6 border-dashed border-2">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Analytics</h3>
              <p className="text-sm text-muted-foreground">Track website traffic and user behavior</p>
              <Button variant="outline" className="w-full">Coming Soon</Button>
            </div>
          </Card>

          <Card className="p-6 border-dashed border-2">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold">Business Profile</h3>
              <p className="text-sm text-muted-foreground">Manage your Google Business listing</p>
              <Button variant="outline" className="w-full">Coming Soon</Button>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  )
}
