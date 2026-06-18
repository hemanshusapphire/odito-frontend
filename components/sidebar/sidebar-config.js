import {
  LayoutDashboard,
  FileText,
  Accessibility,
  Settings,
  Zap,
  Key,
  BrainCircuit,
  ShieldCheck,
  Video,
  Lightbulb,
  Wrench,
  Webhook,
  Link,
  FolderOpen,
  FileEdit,
  Quote,
  Database,
  BarChart3,
  Anchor,
  Link2,
  Eye,
  RefreshCw,
  Cpu,
  CreditCard,
  Tag,
  FileOutput,
  Bell,
  UserPlus,
  ClipboardList,
  History,
  MessageSquareQuote,
} from "lucide-react"

/**
 * Sidebar navigation configuration — mirrors existing Odito navigation
 * with Lucide React icons for the premium ElevenLabs-style sidebar.
 */

export const sidebarSections = [
  {
    id: "audit",
    label: "Audit",
    items: [
      {
        id: "pre-audit",
        label: "Pre Audit",
        href: "/pre-audit",
        icon: ClipboardList,
      },
      {
        id: "overview",
        label: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        id: "onpage",
        label: "On-Page Issues",
        href: "/onpage",
        icon: FileText,
      },
      {
        id: "accessibility",
        label: "Accessibility Issues",
        href: "/accessibility",
        icon: Accessibility,
      },
      {
        id: "technical-checks",
        label: "Technical Checks",
        href: "/technicalchecks",
        icon: Settings,
      },
      {
        id: "pagespeed",
        label: "PageSpeed",
        href: "/pagespeed",
        icon: Zap,
      },
      {
        id: "keywords",
        label: "Keywords",
        href: "/keywords",
        icon: Key,
      },
    ],
  },
  {
    id: "ai-intelligence",
    label: "AI Intelligence",
    items: [
      {
        id: "ai-search-audit",
        label: "AI Search Audit",
        href: "/ai-search-audit",
        icon: BrainCircuit,
      },
      {
        id: "aeo-hub",
        label: "AEO Hub",
        href: "/aeo-hub",
        icon: MessageSquareQuote,
      },
      {
        id: "ai-accessibility",
        label: "AI Accessibility",
        href: "/ai-accessibility",
        icon: ShieldCheck,
      },
      {
        id: "ai-video",
        label: "AI Video Report",
        href: "/ai-video",
        icon: Video,
      },
    ],
  },
  {
    id: "history",
    label: "History",
    items: [
      {
        id: "history-logs",
        label: "Optimization Center",
        href: "/history-logs",
        icon: History,
      },
      {
        id: "audit-analytics",
        label: "Audit Analytics",
        href: "/analytics",
        icon: BarChart3,
      },
      {
        id: "audit-comparison",
        label: "Audit Comparison",
        href: "/comparison",
        icon: Cpu,
      },
    ],
  },
]

export const bottomNavItems = [
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    id: "notifications",
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
]
