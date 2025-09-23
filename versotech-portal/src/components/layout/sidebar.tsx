'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BrandHeader } from './brand-header'
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
  LogOut
} from 'lucide-react'

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  description?: string
}

interface SidebarProps {
  brand: 'versoholdings' | 'versotech'
  userProfile: {
    display_name?: string
    email?: string
    role: string
    title?: string
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
    icon: TrendingUp,
    badge: 2,
    description: 'Investment opportunities and participation'
  },
  {
    name: 'Holdings',
    href: '/versoholdings/holdings',
    icon: Building2,
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
    badge: 3,
    description: 'Onboarding and compliance tasks'
  },
  {
    name: 'Messages',
    href: '/versoholdings/messages',
    icon: MessageSquare,
    badge: 2,
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
    icon: CheckSquare,
    badge: 5,
    description: 'Review and approve commitments'
  },
  {
    name: 'Deals',
    href: '/versotech/staff/deals',
    icon: Building2,
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
    badge: 8,
    description: 'Handle investor requests'
  },
  {
    name: 'Documents',
    href: '/versotech/staff/documents',
    icon: FileText,
    description: 'Document management and e-sign'
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
  const pathname = usePathname()
  
  const navItems = brand === 'versoholdings' ? investorNavItems : staffNavItems

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex-1">
              <BrandHeader brand={brand} />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out",
                "hover:bg-gray-100 hover:text-gray-900 hover:scale-[1.02] hover:shadow-sm",
                isActive 
                  ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm" 
                  : "text-gray-600"
              )}>
                <Icon className={cn(
                  "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                  collapsed ? "h-5 w-5" : "h-4 w-4",
                  isActive ? "text-blue-600" : ""
                )} />
                
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </div>
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-16 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {item.name}
                  {item.badge && (
                    <span className="ml-1 bg-blue-600 rounded px-1">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile & Settings */}
      <div className="border-t border-gray-200 p-2 space-y-1">
        {!collapsed && (
          <div className="px-3 py-2">
            <div className="text-sm font-medium text-gray-900">
              {userProfile.display_name || userProfile.email?.split('@')[0]}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {userProfile.title?.toUpperCase() || userProfile.role.split('_')[1]?.toUpperCase()}
              </Badge>
            </div>
          </div>
        )}
        
        <Link href={`/${brand}/settings`}>
          <div className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            "hover:bg-gray-100 text-gray-600"
          )}>
            <Settings className={cn(
              "flex-shrink-0",
              collapsed ? "h-5 w-5" : "h-4 w-4"
            )} />
            {!collapsed && <span>Settings</span>}
          </div>
        </Link>

        <form action="/auth/signout" method="post">
          <Button
            type="submit"
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 px-3 py-2 text-sm font-medium text-gray-600",
              collapsed && "px-2"
            )}
          >
            <LogOut className={cn(
              "flex-shrink-0",
              collapsed ? "h-5 w-5" : "h-4 w-4"
            )} />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </form>
      </div>
    </div>
  )
}