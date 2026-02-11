'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Bot,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavItem[]
}

// Admin navigation structure
const adminNavItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/versotech_admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    href: '/versotech_admin/users',
    icon: Users,
    children: [
      { name: 'All Users', href: '/versotech_admin/users', icon: Users },
      { name: 'Investors', href: '/versotech_admin/users/investors', icon: Users },
      { name: 'Staff', href: '/versotech_admin/users/staff', icon: Users },
    ],
  },
  {
    name: 'Growth',
    href: '/versotech_admin/growth',
    icon: TrendingUp,
    children: [
      { name: 'Overview', href: '/versotech_admin/growth', icon: TrendingUp },
      { name: 'Engagement', href: '/versotech_admin/growth/engagement', icon: TrendingUp },
      { name: 'Retention', href: '/versotech_admin/growth/retention', icon: TrendingUp },
      { name: 'Funnels', href: '/versotech_admin/growth/funnel', icon: TrendingUp },
      { name: 'Cohorts', href: '/versotech_admin/growth/cohorts', icon: TrendingUp },
    ],
  },
  {
    name: 'Agents',
    href: '/versotech_admin/agents',
    icon: Bot,
  },
  {
    name: 'Settings',
    href: '/versotech_admin/settings',
    icon: Settings,
  },
]

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [mounted, setMounted] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['Users', 'Growth'])
  const pathname = usePathname()

  // Wait for client-side hydration before rendering interactive Radix components
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if a route is active (exact match or nested)
  const isRouteActive = (href: string, hasChildren: boolean = false) => {
    if (hasChildren) {
      // For parent items, check if any child is active
      return pathname.startsWith(href)
    }
    // Exact match for items without children
    return pathname === href
  }

  // Check if section should be expanded based on current route
  const isSectionExpanded = (item: NavItem) => {
    if (!item.children) return false
    return expandedSections.includes(item.name) || item.children.some(child => pathname.startsWith(child.href))
  }

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionName)
        ? prev.filter(s => s !== sectionName)
        : [...prev, sectionName]
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex items-center justify-between h-16 border-b border-gray-100 dark:border-white/5">
        {!collapsed && (
          <div className="flex items-center gap-2 animate-in fade-in duration-200">
            <div className="relative h-6 w-6 flex-shrink-0">
              <Image src="/versotech-icon.png" alt="" fill className="object-contain" priority />
            </div>
            <span style={{ fontFamily: 'var(--font-spartan), sans-serif' }} className="text-sm font-extrabold tracking-wide text-gray-900 dark:text-white">
              VERSOTECH
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              Admin
            </Badge>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
          </div>
        )}

        {/* Desktop collapse button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {adminNavItems.map((item) => {
          const Icon = item.icon
          const hasChildren = Boolean(item.children && item.children.length > 0)
          const isActive = isRouteActive(item.href, hasChildren)
          const isExpanded = isSectionExpanded(item)

          if (hasChildren && !collapsed) {
            // Before hydration, render static content to avoid Radix ID mismatches
            if (!mounted) {
              return (
                <div key={item.name}>
                  <button
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400"
                        : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-zinc-500"
                    )} />
                    <span className="flex-1 text-sm font-medium">{item.name}</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )} />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 pl-4 border-l border-gray-100 dark:border-white/10 mt-1 space-y-1">
                      {item.children?.map((child) => {
                        const childActive = pathname === child.href
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block px-3 py-2 rounded-lg text-sm transition-colors",
                              childActive
                                ? "bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400 font-medium"
                                : "text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                            )}
                          >
                            {child.name}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // After hydration, render interactive Collapsible component
            return (
              <Collapsible
                key={item.name}
                open={isExpanded}
                onOpenChange={() => toggleSection(item.name)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left",
                      isActive
                        ? "bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400"
                        : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-zinc-500"
                    )} />
                    <span className="flex-1 text-sm font-medium">{item.name}</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="animate-in slide-in-from-top-2 duration-200">
                  <div className="ml-4 pl-4 border-l border-gray-100 dark:border-white/10 mt-1 space-y-1">
                    {item.children?.map((child) => {
                      const childActive = pathname === child.href
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block px-3 py-2 rounded-lg text-sm transition-colors",
                            childActive
                              ? "bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400 font-medium"
                              : "text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                          )}
                        >
                          {child.name}
                        </Link>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          }

          // Non-collapsible item
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive
                  ? "bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400"
                  : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-zinc-500 group-hover:text-gray-600 dark:group-hover:text-white"
              )} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-sm font-medium">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}

              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-blue-600 dark:bg-blue-500" />
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border bg-white dark:bg-zinc-800 border-gray-100 dark:border-white/10 text-gray-900 dark:text-white">
                  {item.name}
                  {item.badge && <span className="ml-2 text-amber-600">({item.badge})</span>}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-white/5">
        {!collapsed && (
          <p className="text-xs text-gray-400 dark:text-zinc-600">
            Admin Portal v1.0
          </p>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden h-10 w-10 bg-white dark:bg-zinc-900 shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] bg-white dark:bg-zinc-950 transform transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen border-r border-gray-100 dark:border-white/5 bg-white dark:bg-zinc-950 transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]",
          className
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
