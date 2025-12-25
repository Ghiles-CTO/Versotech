'use client'

import { ReactNode, useState, useEffect } from 'react'
import { ThemeProvider, useTheme } from '@/components/theme-provider'
import { GlobalKeyboardShortcuts } from './global-keyboard-shortcuts'
import { PersonaSidebar } from './persona-sidebar'
import { PersonaSwitcher } from './persona-switcher'
import { NotificationCenter } from './notification-center'
import { UserMenu } from './user-menu'
import { usePersona } from '@/contexts/persona-context'
import { AuthUser } from '@/lib/auth'
import Image from 'next/image'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface UnifiedAppLayoutProps {
  children: ReactNode
  profile: AuthUser
}

// Theme toggle component
function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, preference, setPreference } = useTheme()
  const isDark = theme === 'staff-dark'

  // Wait for client-side hydration to complete
  useEffect(() => {
    setMounted(true)
  }, [])

  // Render placeholder until mounted to prevent Radix UI hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`${isDark ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
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
          className={`${isDark ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
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
function UnifiedAppLayoutInner({ children, profile }: UnifiedAppLayoutProps) {
  const { activePersona, isLoading, hasMultiplePersonas } = usePersona()
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`flex h-screen min-h-screen overflow-hidden ${isDark ? 'staff-dark bg-[#0a0a0a]' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20'}`}>
      {/* Global Keyboard Shortcuts */}
      <GlobalKeyboardShortcuts brand="versotech" role={profile.role} />

      {/* Persona-aware Sidebar */}
      <PersonaSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`${isDark ? 'bg-[#0a0a0a] border-b border-white/10' : 'bg-white/80 backdrop-blur-sm border-b border-gray-200'} px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="relative h-8 w-24">
              <Image
                src="/versotech-logo.jpg"
                alt="VERSO"
                fill
                className={`object-contain object-left ${isDark ? 'invert' : ''}`}
                priority
              />
            </div>

            {/* Active Persona Indicator */}
            {activePersona && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-white/10 text-white/70' : 'bg-gray-100 text-gray-600'}`}>
                {activePersona.entity_name}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Center */}
            <NotificationCenter />

            {/* Persona Switcher (only show if multiple personas) */}
            {hasMultiplePersonas && <PersonaSwitcher />}

            {/* User Menu */}
            <UserMenu profile={profile} brand="versotech" useThemeColors />
          </div>
        </header>

        {/* Content Area */}
        <main className={`flex-1 overflow-y-auto scrollbar-hide ${isDark ? 'bg-[#0a0a0a]' : 'bg-transparent backdrop-blur-sm'}`}>
          <div className={`min-h-full ${isDark ? '' : 'bg-white/60 backdrop-blur-sm'}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export function UnifiedAppLayout({ children, profile }: UnifiedAppLayoutProps) {
  // Per PHASE2_BASE_PLAN.md Section 11.6:
  // "Default to light theme (investor style) for ALL users"
  // Theme is USER CHOICE, not persona-based. Light is always default.
  // Users can toggle to dark mode if they prefer.
  const defaultTheme = 'light' as const

  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <UnifiedAppLayoutInner profile={profile}>
        {children}
      </UnifiedAppLayoutInner>
    </ThemeProvider>
  )
}
