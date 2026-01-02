'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/use-notifications'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  FileText,
  FileSignature,
  MessageSquare,
  CheckSquare,
  TrendingUp,
  Settings,
  Users,
  Workflow,
  ClipboardList,
  Shield,
  Database,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HandHeart,
  CreditCard,
  Calculator,
  Activity,
  Briefcase,
  UserCheck,
  Search,
  Bell,
  Calendar
} from 'lucide-react'

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  description?: string
  notificationKey?: keyof NotificationCounts
  requiredPermission?: string
}

interface NotificationCounts {
  tasks: number
  messages: number
  deals: number
  requests: number
  approvals: number
  notifications: number
  signatures: number
  reconciliation: number
  fees: number
  totalUnread: number
}

interface SidebarProps {
  brand: 'versoholdings' | 'versotech'
  userProfile: {
    displayName?: string
    email?: string
    role: string
    title?: string
    id?: string
    permissions?: string[]
  }
}

// Navigation items
const investorNavItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/versotech_main/dashboard',
    icon: LayoutDashboard,
    description: 'Portfolio overview'
  },
  {
    name: 'Active Deals',
    href: '/versotech_main/opportunities',
    icon: Activity,
    notificationKey: 'deals',
    description: 'Investment opportunities'
  },
  {
    name: 'Portfolio',
    href: '/versotech_main/portfolio',
    icon: Briefcase,
    description: 'My investments'
  },
  {
    name: 'Data Rooms',
    href: '/versotech_main/data-rooms',
    icon: FileText,
    description: 'Documents & Due Diligence'
  },
  {
    name: 'Calendar',
    href: '/versotech_main/calendar',
    icon: Calendar,
    description: 'Schedule'
  },
  {
    name: 'Reports',
    href: '/versotech_main/documents',
    icon: TrendingUp,
    description: 'Performance reports'
  },
  {
    name: 'Tasks',
    href: '/versotech_main/tasks',
    icon: CheckSquare,
    notificationKey: 'tasks',
    description: 'Action items'
  },
  {
    name: 'Messages',
    href: '/versotech_main/messages',
    icon: MessageSquare,
    notificationKey: 'messages',
    description: 'Communications'
  },
  {
    name: 'Notifications',
    href: '/versotech_main/notifications',
    icon: Bell,
    notificationKey: 'notifications',
    description: 'Alerts'
  }
]

const staffNavItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/versotech_main',
    icon: LayoutDashboard,
    description: 'Overview'
  },
  {
    name: 'Messages',
    href: '/versotech_main/messages',
    icon: MessageSquare,
    notificationKey: 'messages',
    description: 'Inbox'
  },
  {
    name: 'Approvals',
    href: '/versotech_main/approvals',
    icon: UserCheck,
    notificationKey: 'approvals',
    description: 'Pending approvals'
  },
  {
    name: 'Deals',
    href: '/versotech_main/deals',
    icon: Activity,
    description: 'Deal management'
  },
  {
    name: 'Vehicles',
    href: '/versotech_main/entities',
    icon: Building2,
    description: 'Investment vehicles'
  },
  {
    name: 'Investors',
    href: '/versotech_main/investors',
    icon: Users,
    description: 'Investor relations'
  },
  {
    name: 'KYC Review',
    href: '/versotech_main/kyc-review',
    icon: UserCheck,
    description: 'KYC compliance review'
  },
  {
    name: 'Subscriptions',
    href: '/versotech_main/subscriptions',
    icon: FileText,
    description: 'Subscription tracking'
  },
  {
    name: 'Processes',
    href: '/versotech_main/processes',
    icon: Workflow,
    description: 'Workflows'
  },
  {
    name: 'Requests',
    href: '/versotech_main/requests',
    icon: ClipboardList,
    notificationKey: 'requests',
    description: 'Service requests'
  },
  {
    name: 'Documents',
    href: '/versotech_main/documents',
    icon: FileText,
    description: 'Document center'
  },
  {
    name: 'VersoSign',
    href: '/versotech_main/versosign',
    icon: FileSignature,
    notificationKey: 'signatures',
    description: 'E-signatures'
  },
  {
    name: 'Introducers',
    href: '/versotech_main/introducers',
    icon: HandHeart,
    description: 'Partners'
  },
  {
    name: 'Arrangers',
    href: '/versotech_main/arrangers',
    icon: Briefcase,
    description: 'Regulated entities'
  },
  {
    name: 'Fees',
    href: '/versotech_main/fees',
    icon: Calculator,
    notificationKey: 'fees',
    description: 'Billing'
  },
  {
    name: 'Reconciliation',
    href: '/versotech_main/reconciliation',
    icon: CreditCard,
    notificationKey: 'reconciliation',
    description: 'Payments'
  },
  {
    name: 'Calendar',
    href: '/versotech_main/calendar',
    icon: Calendar,
    description: 'Schedule'
  },
  {
    name: 'Audit',
    href: '/versotech_main/audit',
    icon: Shield,
    description: 'Compliance logs'
  },
  {
    name: 'Admin',
    href: '/versotech_main/admin',
    icon: Database,
    description: 'System settings',
    requiredPermission: 'super_admin'
  }
]

export function Sidebar({ brand, userProfile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  // Fetch real notification counts
  const { counts, loading: notificationsLoading } = useNotifications(userProfile.role, userProfile.id)

  const baseNavItems = brand === 'versoholdings' ? investorNavItems : staffNavItems
  const isDark = brand === 'versotech'

  // Filter nav items based on required permissions
  const navItems = baseNavItems.filter(item => {
    if (!item.requiredPermission) return true
    return userProfile.permissions?.includes(item.requiredPermission)
  })

  // Handle sign out
  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const filteredNavItems = navItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={cn(
      "flex flex-col h-screen transition-all duration-300 border-r relative z-50",
      collapsed ? "w-[80px]" : "w-[280px]",
      isDark
        ? "bg-[#0a0a0a] border-white/5 text-gray-400"
        : "bg-white border-gray-100 text-gray-600"
    )}>
      {/* Header */}
      <div className="p-6 flex items-center justify-between h-20">
        {!collapsed && (
          <div className="flex items-center gap-3 animate-in fade-in duration-300">
            <div className={cn(
              "relative h-10 w-32 overflow-hidden", // Increased size
            )}>
              <Image
                src={brand === 'versotech' ? '/versotech-logo.jpg' : '/versoholdings-logo.jpg'}
                alt="Logo"
                fill
                className={cn(
                  "object-contain object-left",
                  isDark && "invert" // Invert for dark mode staff portal
                )}
                priority
              />
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto">
            <div className={cn(
              "relative h-8 w-8 rounded-lg overflow-hidden",
              isDark ? "bg-white/5 ring-1 ring-white/10" : "bg-gray-50 ring-1 ring-gray-100"
            )}>
              <Image
                src={brand === 'versotech' ? '/versotech-logo.jpg' : '/versoholdings-logo.jpg'}
                alt="Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute -right-3 top-8 h-6 w-6 rounded-full border shadow-sm z-50 hidden md:flex items-center justify-center transition-colors",
            isDark
              ? "bg-[#0F1115] border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
              : "bg-white border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative group">
            <Search className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
              isDark
                ? "text-gray-500 group-focus-within:text-white"
                : "text-gray-400 group-focus-within:text-gray-900"
            )} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full pl-9 pr-4 py-2 rounded-lg text-sm transition-all outline-none",
                isDark
                  ? "bg-white/5 border border-white/5 text-white placeholder:text-gray-600 focus:bg-white/10 focus:border-white/10"
                  : "bg-gray-50 border border-gray-100 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-blue-500/10"
              )}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-2 space-y-1">
        {filteredNavItems.map((item) => {
          // Special case: dashboard paths that are base paths (e.g., /versotech/staff)
          // should only match exactly, not all sub-paths
          const isDashboard = item.name === 'Dashboard'
          const isActive = isDashboard
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          const badgeCount = item.notificationKey && !notificationsLoading ? counts[item.notificationKey] : item.badge

          return (
            <Link key={item.name} href={item.href} className="block group relative">
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? isDark
                    ? "bg-gradient-to-r from-blue-600/20 to-blue-600/5 text-blue-400"
                    : "bg-blue-50 text-blue-700"
                  : isDark
                    ? "text-gray-400 hover:text-white hover:bg-white/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive
                    ? isDark ? "text-blue-400" : "text-blue-600"
                    : isDark ? "text-gray-500 group-hover:text-white" : "text-gray-400 group-hover:text-gray-600"
                )} />

                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium">{item.name}</span>
                    {badgeCount && Number(badgeCount) > 0 && (
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        isDark
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-blue-100 text-blue-700"
                      )}>
                        {Number(badgeCount) > 99 ? '99+' : badgeCount}
                      </span>
                    )}
                  </>
                )}

                {/* Active Indicator Bar */}
                {isActive && (
                  <div className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full",
                    isDark ? "bg-blue-500" : "bg-blue-600"
                  )} />
                )}
              </div>

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className={cn(
                  "absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border",
                  isDark
                    ? "bg-[#1A1D24] border-white/10 text-white"
                    : "bg-white border-gray-100 text-gray-900"
                )}>
                  {item.name}
                  {badgeCount && Number(badgeCount) > 0 && (
                    <span className="ml-2 opacity-75">({badgeCount})</span>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* User Profile / Settings Section */}
      <div className={cn(
        "p-4 border-t mt-auto",
        isDark ? "border-white/5" : "border-gray-100"
      )}>
        <Link href={`/${brand}${brand === 'versotech' ? '/staff' : ''}/profile`}>
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer group",
            isDark
              ? "hover:bg-white/5"
              : "hover:bg-gray-50"
          )}>
            <div className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ring-2",
              isDark
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white ring-black"
                : "bg-white text-blue-600 ring-white border border-gray-100"
            )}>
              {userProfile.displayName?.[0]?.toUpperCase() || 'U'}
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className={cn(
                  "text-sm font-semibold truncate",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  {userProfile.displayName || 'User'}
                </p>
                <p className={cn(
                  "text-xs truncate flex items-center gap-1",
                  isDark ? "text-gray-500 group-hover:text-gray-400" : "text-gray-500 group-hover:text-gray-600"
                )}>
                  View Profile
                </p>
              </div>
            )}

            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className={cn(
                  "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
                  isDark
                    ? "text-gray-500 hover:text-red-400 hover:bg-white/5"
                    : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                )}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}
