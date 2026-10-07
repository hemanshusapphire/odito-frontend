import {
  Home,
  Link2,
  Building2,
  Sparkles,
  Calendar,
  CheckSquare,
  Palette,
  Send,
  BarChart3,
  Settings,
} from 'lucide-react'

// Single source of truth for the module's nav items - shared by the sidebar
// and by anything that needs to resolve a route's label (e.g. the header).
export const SOCIAL_MEDIA_NAV_ITEMS = [
  { label: 'Overview', href: '/app/social-media', icon: Home },
  { label: 'Connect Accounts', href: '/app/social-media/connect-accounts', icon: Link2 },
  { label: 'Business Profile', href: '/app/social-media/business-profile', icon: Building2 },
  { label: 'AI Strategy', href: '/app/social-media/ai-strategy', icon: Sparkles },
  { label: 'Content Calendar', href: '/app/social-media/content-calendar', icon: Calendar },
  { label: 'Content Approvals', href: '/app/social-media/content-approvals', icon: CheckSquare },
  { label: 'Creative Studio', href: '/app/social-media/creative-studio', icon: Palette },
  { label: 'Scheduled Posts', href: '/app/social-media/scheduled-posts', icon: Send },
  { label: 'Analytics', href: '/app/social-media/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/app/social-media/settings', icon: Settings },
]
