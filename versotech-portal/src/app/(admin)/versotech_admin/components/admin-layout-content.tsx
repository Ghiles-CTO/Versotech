'use client'

import { ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AdminSidebar } from './admin-sidebar'
import { ThemeProvider, useTheme } from '@/components/theme-provider'
import { GlobalKeyboardShortcuts } from '@/components/layout/global-keyboard-shortcuts'
import { NotificationCenter } from '@/components/layout/notification-center'
import { IdentityMenu } from '@/components/layout/identity-menu'
import { AuthUser } from '@/lib/auth'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AdminLayoutContentProps {
  children: ReactNode
  profile: AuthUser
}

// Map routes to page titles
function getPageTitle(pathname: string): string {
  const routeTitles: Record<string, string> = {
    '/versotech_admin': 'Admin Portal',
    '/versotech_admin/dashboard': 'Platform Overview',
    '/versotech_admin/users': 'All Users',
    '/versotech_admin/users/staff': 'Staff Members',
    '/versotech_admin/growth': 'Growth Overview',
    '/versotech_admin/growth/engagement': 'Engagement Analytics',
    '/versotech_admin/growth/retention': 'Retention Analysis',
    '/versotech_admin/growth/funnel': 'Conversion Funnels',
    '/versotech_admin/growth/cohorts': 'Cohort Analysis',
    '/versotech_admin/agents': 'AI Agents',
    '/versotech_admin/settings': 'Settings',
  }

  // Check for exact match first
  if (routeTitles[pathname]) {
    return routeTitles[pathname]
  }

  // Check for user detail page pattern /versotech_admin/users/[id]
  if (pathname.match(/^\/versotech_admin\/users\/[^/]+$/)) {
    return 'User Details'
  }

  // Default fallback
  return 'Admin Portal'
}

// Theme toggle component (adapted from unified-app-layout)
function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, preference, setPreference } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = theme === 'staff-dark'

  // During SSR/initial render, show a static button placeholder
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={isDark ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}
        >
          {theme === 'light' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={isDark ? 'bg-zinc-900 border-white/10' : ''}>
        <DropdownMenuItem
          onClick={() => setPreference('light')}
          className={`${isDark ? 'text-zinc-300 focus:text-white focus:bg-white/10' : ''} ${preference === 'light' ? 'font-medium' : ''}`}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
          {preference === 'light' && <span className="ml-auto text-xs opacity-60">Active</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setPreference('dark')}
          className={`${isDark ? 'text-zinc-300 focus:text-white focus:bg-white/10' : ''} ${preference === 'dark' ? 'font-medium' : ''}`}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
          {preference === 'dark' && <span className="ml-auto text-xs opacity-60">Active</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setPreference('auto')}
          className={`${isDark ? 'text-zinc-300 focus:text-white focus:bg-white/10' : ''} ${preference === 'auto' ? 'font-medium' : ''}`}
        >
          <Monitor className="mr-2 h-4 w-4" />
          Auto (by persona)
          {preference === 'auto' && <span className="ml-auto text-xs opacity-60">Active</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Inner layout component that uses theme context
function AdminLayoutInner({ children, profile }: AdminLayoutContentProps) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)
  const { theme } = useTheme()

  // Wait for client-side hydration to apply theme-specific classes
  useEffect(() => {
    setMounted(true)
  }, [])

  // Use light theme styles during SSR to match server render
  const isDark = mounted && theme === 'staff-dark'

  return (
    <div className="flex h-screen min-h-screen overflow-hidden app-main-bg">
      {/* Global Keyboard Shortcuts */}
      <GlobalKeyboardShortcuts brand="versotech" role={profile.role} />

      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with page title */}
        <header className={`
          h-16 px-4 md:px-6 flex items-center justify-between border-b shrink-0
          ${isDark
            ? 'bg-zinc-950 border-white/5'
            : 'bg-white border-gray-100'
          }
        `}>
          {/* Page Title - with left padding on mobile for hamburger menu */}
          <div className="pl-12 md:pl-0">
            <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {pageTitle}
            </h1>
          </div>

          {/* Right side - Utilities */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <NotificationCenter />
            <IdentityMenu profile={profile} />
          </div>
        </header>

        {/* Content Area */}
        <main className={`
          flex-1 overflow-y-auto scrollbar-hide
          ${isDark ? 'bg-zinc-900' : 'bg-gray-50'}
        `}>
          <div className="min-h-full p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export function AdminLayoutContent({ children, profile }: AdminLayoutContentProps) {
  // Admin portal uses light theme by default
  const defaultTheme = 'light' as const

  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <AdminLayoutInner profile={profile}>
        {children}
      </AdminLayoutInner>
    </ThemeProvider>
  )
}
