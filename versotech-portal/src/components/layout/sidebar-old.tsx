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
  Sun,
  Moon
} from 'lucide-react'
import { Input } from '@/components/ui/input'

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
    description: 'Investment vehicles and positions'
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
  const [isDark, setIsDark] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  // Fetch real notification counts
  const { counts, loading: notificationsLoading } = useNotifications(userProfile.role, userProfile.id)

  const navItems = brand === 'versoholdings' ? investorNavItems : staffNavItems

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

  return (
    <div className={cn(
      "bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header with Brand */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-white font-semibold text-lg">
                {brand === 'versoholdings' ? 'VERSO Holdings' : 'VERSO Tech'}
              </h2>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {!collapsed && (
        <div className="p-4 border-b border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-slate-500"
            />
          </div>
        </div>
      )}

      {/* Menu Label */}
      <div className="px-4 py-2">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
          MENU
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          // Get dynamic badge count
          const badgeCount = item.notificationKey && !notificationsLoading
            ? counts[item.notificationKey]
            : item.badge

          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative",
                "hover:bg-slate-700",
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:text-white"
              )}>
                <Icon className="flex-shrink-0 h-5 w-5" />

                {!collapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {badgeCount && badgeCount > 0 && (
                      <div className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </div>
                    )}
                  </>
                )}

                {/* Collapsed state badge */}
                {collapsed && badgeCount && badgeCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </div>
                )}
              </div>

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-16 bg-slate-900 text-white text-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-xl">
                  <div className="font-medium">{item.name}</div>
                  {badgeCount && badgeCount > 0 && (
                    <div className="text-xs text-slate-300 mt-1">
                      {badgeCount} notifications
                    </div>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Theme Toggle */}
      {!collapsed && (
        <div className="px-3 py-4 border-t border-slate-700">
          <div className="flex items-center justify-center gap-2 bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setIsDark(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded text-sm transition-all",
                !isDark ? "bg-white text-slate-800" : "text-slate-300 hover:text-white"
              )}
            >
              <Sun className="h-4 w-4" />
              Light
            </button>
            <button
              onClick={() => setIsDark(true)}
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded text-sm transition-all",
                isDark ? "bg-slate-600 text-white" : "text-slate-300 hover:text-white"
              )}
            >
              <Moon className="h-4 w-4" />
              Dark
            </button>
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {(userProfile.display_name || userProfile.email?.split('@')[0] || 'U')[0].toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm truncate">
                {userProfile.display_name || userProfile.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-slate-400 text-xs truncate">
                {userProfile.email}
              </div>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white h-8 w-8 p-0"
              onClick={handleSignOut}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}