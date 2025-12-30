'use client'

import { ReactNode, useState, useEffect } from 'react'
import { ThemeProvider, useTheme } from '@/components/theme-provider'
import { GlobalKeyboardShortcuts } from './global-keyboard-shortcuts'
import { PersonaSidebar } from './persona-sidebar'
import { NotificationCenter } from './notification-center'
import { IdentityMenu } from './identity-menu'
import { usePersona } from '@/contexts/persona-context'
import { AuthUser } from '@/lib/auth'
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
// IMPORTANT: To prevent hydration mismatch, we must render the same DOM structure
// on both server and client. Only the content/styling can change after mount.
function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, preference, setPreference } = useTheme()

  // Wait for client-side hydration to complete
  useEffect(() => {
    setMounted(true)
  }, [])

  // Compute styling - use light mode defaults during SSR to match server render
  // After mount, use actual theme value
  const isDark = mounted && theme === 'staff-dark'
  const displayIcon = mounted ? (theme === 'light' ? 'sun' : 'moon') : 'sun'

  // Always render the same DOM structure (DropdownMenu wrapper)
  // Only the content and styling change after mount
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={isDark ? 'text-zinc-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}
        >
          {displayIcon === 'sun' ? (
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
// IMPORTANT: Main layout elements use CSS classes (app-*) that respond to .staff-dark
// on the html element. This prevents flash during SSR/hydration because the server-rendered
// HTML has static class names, and the actual colors come from CSS cascade.
function UnifiedAppLayoutInner({ children, profile }: UnifiedAppLayoutProps) {
  const { isLoading } = usePersona()

  if (isLoading) {
    // Use CSS classes that respond to .staff-dark - prevents SSR flash
    return (
      <div className="flex h-screen items-center justify-center app-loading-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 app-loading-spinner"></div>
      </div>
    )
  }

  return (
    // Use app-main-bg CSS class - responds to .staff-dark on html, preventing SSR flash
    <div className="flex h-screen min-h-screen overflow-hidden app-main-bg">
      {/* Global Keyboard Shortcuts */}
      <GlobalKeyboardShortcuts brand="versotech" role={profile.role} />

      {/* Persona-aware Sidebar */}
      <PersonaSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - uses app-header CSS class for SSR-safe theming */}
        <header className="app-header px-6 py-4 flex items-center justify-between">
          {/* Left spacer for centering */}
          <div className="w-32" />

          {/* Center - Brand name */}
          <h1
            style={{ fontFamily: 'var(--font-spartan), sans-serif' }}
            className="text-xl font-extrabold tracking-wide uppercase app-header-text"
          >
            VERSOTECH
          </h1>

          {/* Right side - Utilities */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <NotificationCenter />
            <IdentityMenu profile={profile} />
          </div>
        </header>

        {/* Content Area - uses app-content CSS class for SSR-safe theming */}
        <main className="flex-1 overflow-y-auto scrollbar-hide app-content">
          <div className="min-h-full app-content-inner">
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
