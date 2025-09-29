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
  Moon,
  Bell
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

const investorNavItems: SidebarItem[] = [
  {
    name: 'Home',
    href: '/versoholdings/dashboard',
    icon: LayoutDashboard,
    description: 'Portfolio overview and KPIs'
  },
  {
    name: 'Activity',
    href: '/versoholdings/deals',
    icon: Activity,
    notificationKey: 'deals',
    description: 'Investment opportunities and participation'
  },
  {
    name: 'Task',
    href: '/versoholdings/tasks',
    icon: CheckSquare,
    notificationKey: 'tasks',
    description: 'Onboarding and compliance tasks'
  },
  {
    name: 'Users',
    href: '/versoholdings/holdings',
    icon: Users,
    description: 'Investment vehicles and positions'
  },
  {
    name: 'Notification',
    href: '/versoholdings/messages',
    icon: Bell,
    notificationKey: 'messages',
    description: 'Communication with VERSO team'
  },
  {
    name: 'Settings',
    href: '/versoholdings/settings',
    icon: Settings,
    description: 'Account settings and preferences'
  },
  {
    name: 'Report',
    href: '/versoholdings/reports',
    icon: FileText,
    description: 'Request custom reports'
  }
]

const staffNavItems: SidebarItem[] = [
  {
    name: 'Home',
    href: '/versotech/staff',
    icon: LayoutDashboard,
    description: 'Operations overview and metrics'
  },
  {
    name: 'Activity',
    href: '/versotech/staff/deals',
    icon: Activity,
    description: 'Manage deal inventory and allocations'
  },
  {
    name: 'Task',
    href: '/versotech/staff/approvals',
    icon: CheckSquare,
    notificationKey: 'approvals',
    description: 'Review and approve commitments'
  },
  {
    name: 'Users',
    href: '/versotech/staff/investors',
    icon: Users,
    description: 'Manage investor accounts and KYC'
  },
  {
    name: 'Notification',
    href: '/versotech/staff/requests',
    icon: Bell,
    notificationKey: 'requests',
    description: 'Handle investor requests'
  },
  {
    name: 'Settings',
    href: '/versotech/settings',
    icon: Settings,
    description: 'Account settings and preferences'
  },
  {
    name: 'Report',
    href: '/versotech/staff/documents',
    icon: FileText,
    description: 'Document management and e-sign'
  }
]

export function Sidebar({ brand, userProfile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  // Fetch real notification counts
  const { counts, loading: notificationsLoading } = useNotifications(userProfile.role, userProfile.id)

  const navItems = brand === 'versoholdings' ? investorNavItems : staffNavItems

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

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

  return (
    <div className={cn(
      "bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col transition-all duration-300 h-screen",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header with Brand and Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-gray-900 dark:text-white font-semibold text-lg">
                {brand === 'versoholdings' ? 'VERSO Holdings' : 'VERSO Tech'}
              </h2>
            </div>
          )}
        </div>

        {/* Search Bar */}
        {!collapsed && (
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* Menu Section */}
      <div className="flex-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-4 py-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                  "hover:bg-gray-100 dark:hover:bg-slate-700",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300"
                )}>
                  <Icon className={cn(
                    "flex-shrink-0 h-5 w-5 transition-colors duration-200",
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  )} />

                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {badgeCount && badgeCount > 0 && (
                        <Badge
                          className={cn(
                            "text-xs font-bold h-5 min-w-[20px] flex items-center justify-center",
                            "bg-red-500 text-white hover:bg-red-600"
                          )}
                        >
                          {badgeCount > 99 ? '99+' : badgeCount}
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-16 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-lg whitespace-nowrap">
                    <div className="font-medium">{item.name}</div>
                    {badgeCount && badgeCount > 0 && (
                      <div className="text-xs text-red-400 dark:text-red-600 mt-1">
                        {badgeCount} {badgeCount === 1 ? 'item' : 'items'}
                      </div>
                    )}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Additional sections for staff */}
        {brand === 'versotech' && !collapsed && (
          <div className="mt-8 px-2 space-y-1">
            <Link href="/versotech/staff/processes" className="group">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                <Workflow className="flex-shrink-0 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="flex-1">Autotrack</span>
                <Badge className="bg-green-500 text-white text-xs">Active</Badge>
              </div>
            </Link>

            <Link href="/versotech/staff/audit" className="group">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700">
                <Shield className="flex-shrink-0 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="flex-1">Networks</span>
                <span className="text-xs text-gray-500">3</span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Theme Toggle */}
      <div className="border-t border-gray-200 dark:border-slate-700 p-4">
        {!collapsed && (
          <div className="flex items-center justify-center gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleDarkMode()}
              className={cn(
                "flex-1 h-8 text-xs font-medium transition-all duration-200",
                !darkMode
                  ? "bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Sun className="h-4 w-4 mr-1" />
              Light
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleDarkMode()}
              className={cn(
                "flex-1 h-8 text-xs font-medium transition-all duration-200",
                darkMode
                  ? "bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Moon className="h-4 w-4 mr-1" />
              Dark
            </Button>
          </div>
        )}

        {collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="w-full h-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* User Profile */}
      <div className="border-t border-gray-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {(userProfile.display_name || userProfile.email?.split('@')[0] || 'U')[0].toUpperCase()}
            </span>
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {userProfile.display_name || userProfile.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userProfile.email || 'user@example.com'}
              </div>
            </div>
          )}

          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}