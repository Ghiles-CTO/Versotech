'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BrandHeader } from './brand-header'
import { useNotifications } from '@/hooks/use-notifications'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Building2,
  FileText,
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
  Package,
  Activity,
  Briefcase,
  UserCheck,
  Search,
  MoreHorizontal,
} from 'lucide-react'

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  description?: string
  notificationKey?: keyof NotificationCounts
}

interface NotificationCounts {
  tasks: number
  messages: number
  deals: number
  requests: number
  approvals: number
  totalUnread: number
}

interface SidebarProps {
  brand: 'versoholdings' | 'versotech'
  userProfile: {
    display_name?: string
    email?: string
    role: string
    title?: string
    id?: string
  }
}

// Original navigation items from the working sidebar
const investorNavItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/versoholdings/dashboard',
    icon: LayoutDashboard,
    description: 'Portfolio overview and KPIs'
  },
  {
    name: 'Active Deals',
    href: '/versoholdings/deals',
    icon: Activity,
    notificationKey: 'deals',
    description: 'Investment opportunities and participation'
  },
  {
    name: 'Holdings',
    href: '/versoholdings/holdings',
    icon: Briefcase,
    description: 'Investment entities and positions'
  },
  {
    name: 'Documents',
    href: '/versoholdings/documents',
    icon: FileText,
    description: 'Reports, statements, and contracts'
  },
  {
    name: 'Tasks',
    href: '/versoholdings/tasks',
    icon: CheckSquare,
    notificationKey: 'tasks',
    description: 'Onboarding and compliance tasks'
  },
  {
    name: 'Messages',
    href: '/versoholdings/messages',
    icon: MessageSquare,
    notificationKey: 'messages',
    description: 'Communication with VERSO team'
  },
  {
    name: 'Reports',
    href: '/versoholdings/reports',
    icon: TrendingUp,
    description: 'Request custom reports'
  }
]

const staffNavItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/versotech/staff',
    icon: LayoutDashboard,
    description: 'Operations overview and metrics'
  },
  {
    name: 'Messages',
    href: '/versotech/staff/messages',
    icon: MessageSquare,
    notificationKey: 'messages',
    description: 'Investor threads and internal collaboration'
  },
  {
    name: 'Approvals',
    href: '/versotech/staff/approvals',
    icon: UserCheck,
    notificationKey: 'approvals',
    description: 'Review and approve commitments'
  },
  {
    name: 'Deals',
    href: '/versotech/staff/deals',
    icon: Activity,
    description: 'Manage deal inventory and allocations'
  },
  {
    name: 'Entities',
    href: '/versotech/staff/entities',
    icon: Building2,
    description: 'Manage vehicles and legal entities'
  },
  {
    name: 'Investors',
    href: '/versotech/staff/investors',
    icon: Users,
    description: 'Manage investor accounts and KYC'
  },
  {
    name: 'Processes',
    href: '/versotech/staff/processes',
    icon: Workflow,
    description: 'Workflow automation center'
  },
  {
    name: 'Requests',
    href: '/versotech/staff/requests',
    icon: ClipboardList,
    notificationKey: 'requests',
    description: 'Handle investor requests'
  },
  {
    name: 'Documents',
    href: '/versotech/staff/documents',
    icon: FileText,
    description: 'Document management and e-sign'
  },
  {
    name: 'Introducers',
    href: '/versotech/staff/introducers',
    icon: HandHeart,
    description: 'Manage introducer relationships'
  },
  {
    name: 'Fees',
    href: '/versotech/staff/fees',
    icon: Calculator,
    description: 'Fee plans and billing management'
  },
  {
    name: 'Reconciliation',
    href: '/versotech/staff/reconciliation',
    icon: CreditCard,
    description: 'Bank reconciliation and payments'
  },
  {
    name: 'Doc Automation',
    href: '/versotech/staff/documents/automation',
    icon: Package,
    description: 'Document templates and automation'
  },
  {
    name: 'Audit',
    href: '/versotech/staff/audit',
    icon: Shield,
    description: 'Audit logs and compliance'
  },
  {
    name: 'Admin',
    href: '/versotech/staff/admin',
    icon: Database,
    description: 'System administration'
  }
]

export function Sidebar({ brand, userProfile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  // Fetch real notification counts
  const { counts, loading: notificationsLoading } = useNotifications(userProfile.role, userProfile.id)

  const navItems = brand === 'versoholdings' ? investorNavItems : staffNavItems

  // Set theme based on brand: staff portal uses dark mode, investor portal uses light mode
  const sidebarDarkMode = brand === 'versotech'

  // Handle sign out with proper redirect
  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Sign out error:', error)
        return
      }

      // Redirect to the appropriate login page based on brand
      const loginPath = brand === 'versoholdings' ? '/versoholdings/login' : '/versotech/login'
      router.push(loginPath)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Filter nav items based on search
  const filteredNavItems = navItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sidebarClasses = cn(
    "border-r flex flex-col transition-all duration-300 h-screen",
    collapsed ? "w-16" : "w-64",
    sidebarDarkMode
      ? "bg-background border"
      : "bg-white border-gray-200"
  )

  return (
    <div className={sidebarClasses}>
      {/* Header with Brand, Logo and Collapse Toggle */}
      <div className={cn(
        "p-4 border-b",
        sidebarDarkMode ? "border" : "border-gray-200"
      )}>
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center">
              <h2 className={cn(
                "font-bold text-2xl tracking-tight",
                sidebarDarkMode ? "text-foreground" : "text-black"
              )}>
                VERSO
              </h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "h-8 w-8 p-0",
              sidebarDarkMode
                ? "hover:bg-muted text-muted-foreground"
                : "hover:bg-gray-100 text-gray-600"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Search Bar */}
        {!collapsed && (
          <div className="mt-4">
            <div className="relative">
              <Search className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
                sidebarDarkMode ? "text-muted-foreground" : "text-gray-400"
              )} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-3 py-2 border rounded-lg text-sm transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                  sidebarDarkMode
                    ? "bg-muted border text-foreground placeholder-muted-foreground"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                )}
              />
            </div>
          </div>
        )}
      </div>

      {/* Menu Section */}
      <div className="flex-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-4 py-3">
            <p className={cn(
              "text-xs font-semibold uppercase tracking-wider",
              sidebarDarkMode ? "text-muted-foreground" : "text-gray-500"
            )}>
              MENU
            </p>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="px-2 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            // Get dynamic badge count
            const badgeCount = item.notificationKey && !notificationsLoading
              ? counts[item.notificationKey]
              : item.badge

            return (
              <Link key={item.name} href={item.href} className="group">
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
                  sidebarDarkMode
                    ? "hover:bg-muted"
                    : "hover:bg-gray-100",
                  isActive
                    ? sidebarDarkMode
                      ? "bg-muted text-primary"
                      : "bg-blue-50 text-blue-600"
                    : sidebarDarkMode
                      ? "text-foreground"
                      : "text-gray-700"
                )}>
                  <Icon className={cn(
                    "flex-shrink-0 h-5 w-5 transition-colors duration-200",
                    isActive
                      ? sidebarDarkMode
                        ? "text-primary"
                        : "text-blue-600"
                      : sidebarDarkMode
                        ? "text-muted-foreground group-hover:text-foreground"
                        : "text-gray-500 group-hover:text-gray-700"
                  )} />

                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {badgeCount && badgeCount > 0 && (
                        <div className={cn(
                          "flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-xs font-medium",
                          badgeCount > 9 ? "px-1.5" : "",
                          sidebarDarkMode
                            ? "bg-blue-500 text-white"
                            : "bg-blue-500 text-white"
                        )}>
                          {badgeCount > 99 ? '99+' : badgeCount}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className={cn(
                    "absolute left-16 text-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-lg whitespace-nowrap",
                    sidebarDarkMode
                      ? "bg-gray-100 text-gray-900"
                      : "bg-gray-900 text-white"
                  )}>
                    <div className="font-medium">{item.name}</div>
                    {badgeCount && badgeCount > 0 && (
                      <div className={cn(
                        "text-xs mt-1",
                        sidebarDarkMode ? "text-blue-400" : "text-blue-600"
                      )}>
                        {badgeCount} {badgeCount === 1 ? 'item' : 'items'}
                      </div>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Settings and User Profile */}
      <div className={cn(
        "border-t p-4 space-y-3",
        sidebarDarkMode ? "border" : "border-gray-200"
      )}>
        {/* Settings Link */}
        <Link href={`/${brand}/settings`}>
          <div className={cn(
            "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            "border border-transparent",
            sidebarDarkMode
              ? "text-foreground hover:bg-muted hover:border"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 hover:border-gray-200",
            pathname.includes('/settings') && (sidebarDarkMode
              ? "bg-muted text-primary border"
              : "bg-blue-50 text-blue-600 border-blue-200/60")
          )}>
            <Settings className={cn(
              "flex-shrink-0 transition-all duration-200",
              collapsed ? "h-5 w-5" : "h-4 w-4",
              "group-hover:scale-110"
            )} />
            {!collapsed && <span className="font-semibold">Settings</span>}
          </div>
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {userProfile.display_name?.[0]?.toUpperCase() || userProfile.email?.split('@')[0]?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className={cn(
                "text-sm font-medium truncate",
                sidebarDarkMode ? "text-foreground" : "text-gray-900"
              )}>
                {userProfile.display_name || 'User'}
              </div>
              <div className={cn(
                "text-xs truncate",
                sidebarDarkMode ? "text-muted-foreground" : "text-gray-500"
              )}>
                {userProfile.email || 'user@example.com'}
              </div>
            </div>
          )}

          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className={cn(
                "h-8 w-8 p-0",
                sidebarDarkMode
                  ? "text-muted-foreground hover:text-red-400 hover:bg-muted"
                  : "text-gray-500 hover:text-red-600 hover:bg-gray-100"
              )}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}