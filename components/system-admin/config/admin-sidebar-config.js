import {
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  FolderOpen,
  Cpu,
  Webhook,
  ClipboardList,
  Settings,
  Briefcase,
  Layers,
  ListOrdered,
  RotateCcw,
  HeartPulse,
} from "lucide-react"

/**
 * System Admin sidebar navigation configuration.
 * Mirrors the shape of components/sidebar/sidebar-config.js
 * (sidebarSections / bottomNavItems) so it can be consumed by the same
 * SidebarNav/SidebarSection/SidebarItem primitives from components/sidebar.
 * Navigation only — no data fetching, no business logic.
 */

export const adminSidebarSections = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        id: "admin-dashboard",
        label: "Dashboard",
        href: "/system-admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "management",
    label: "Management",
    items: [
      {
        id: "admin-users",
        label: "Users",
        href: "/system-admin/users",
        icon: Users,
      },
      {
        id: "admin-subscriptions",
        label: "Subscriptions",
        href: "/system-admin/subscriptions",
        icon: CreditCard,
      },
      {
        id: "admin-payments",
        label: "Payments",
        href: "/system-admin/payments",
        icon: DollarSign,
      },
      {
        id: "admin-projects",
        label: "Projects",
        href: "/system-admin/projects",
        icon: FolderOpen,
      },
      {
        id: "admin-custom-plan-requests",
        label: "Custom Plan Requests",
        href: "/system-admin/custom-plan-requests",
        icon: Briefcase,
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      {
        id: "admin-jobs",
        label: "Jobs",
        href: "/system-admin/jobs",
        icon: Cpu,
      },
      {
        id: "admin-webhooks",
        label: "Webhooks",
        href: "/system-admin/webhooks",
        icon: Webhook,
      },
      {
        id: "admin-audit-logs",
        label: "Audit Logs",
        href: "/system-admin/audit-logs",
        icon: ClipboardList,
      },
    ],
  },
  {
    // ODITO-OPS-001: Verification Operations Dashboard — a distinct section
    // rather than folded into "Operations" above, since it's a set of 4
    // pages (not 1) all specific to the Verification Batch pipeline.
    id: "verification-ops",
    label: "Verification Ops",
    items: [
      {
        id: "admin-verification-batches",
        label: "Batch Dashboard",
        href: "/system-admin/verification-batches",
        icon: Layers,
      },
      {
        id: "admin-verification-queue",
        label: "Queue Dashboard",
        href: "/system-admin/verification-queue",
        icon: ListOrdered,
      },
      {
        id: "admin-verification-recovery",
        label: "Recovery Dashboard",
        href: "/system-admin/verification-recovery",
        icon: RotateCcw,
      },
      {
        id: "admin-verification-workers",
        label: "Worker Health",
        href: "/system-admin/verification-workers",
        icon: HeartPulse,
      },
    ],
  },
]

export const adminBottomNavItems = [
  {
    id: "admin-settings",
    label: "Settings",
    href: "/system-admin/settings",
    icon: Settings,
  },
]
