'use client'

import { ReactNode, useState, useEffect } from 'react'
import { ThemeProvider, useTheme } from '@/components/theme-provider'
import { GlobalKeyboardShortcuts } from './global-keyboard-shortcuts'
import { PersonaSidebar, MobileSidebarContent } from './persona-sidebar'
import { NotificationCenter } from './notification-center'
import { IdentityMenu } from './identity-menu'
import { usePersona } from '@/contexts/persona-context'
import { AuthUser } from '@/lib/auth'
import { Sun, Moon, Monitor, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
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
// FIX: To prevent hydration mismatch from Radix UI's random ID generation,
// render a static placeholder during SSR and swap to DropdownMenu after mount.
function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, preference, setPreference } = useTheme()

  // Wait for client-side hydration to complete
  useEffect(() => {
    setMounted(true)
  }, [])

  // Compute styling based on theme
  const isDark = theme === 'staff-dark'

  // During SSR/initial render, show a static button placeholder (no Radix IDs)
  // This prevents hydration mismatch from Radix generating different IDs
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

  // After mount, render the full interactive DropdownMenu
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
// IMPORTANT: Main layout elements use CSS classes (app-*) that respond to .staff-dark
// on the html element. This prevents flash during SSR/hydration because the server-rendered
// HTML has static class names, and the actual colors come from CSS cascade.
function UnifiedAppLayoutInner({ children, profile }: UnifiedAppLayoutProps) {
  const { isLoading } = usePersona()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme } = useTheme()

  // Determine if dark mode for Sheet styling
  const isDark = theme === 'staff-dark'

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
        {/* Responsive padding: tighter on mobile (px-4), normal on desktop (px-6) */}
        <header className="app-header px-4 md:px-6 py-4 flex items-center justify-between">
          {/* Mobile hamburger - visible only on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Left spacer for centering - hidden on mobile */}
          <div className="hidden md:block w-32" />

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

        {/* Mobile Navigation Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent
            side="left"
            className={`w-[calc(100%-1rem)] max-w-[280px] p-0 ${isDark ? 'bg-zinc-950 border-white/10' : 'bg-white border-gray-200'}`}
          >
            {/* Visually hidden title for accessibility - required by Radix Dialog */}
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <MobileSidebarContent onClose={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

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
