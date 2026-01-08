'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'staff-dark'
type ThemePreference = 'auto' | 'light' | 'dark'

const STORAGE_KEY = 'verso-theme-preference'
const RESOLVED_KEY = 'verso-theme-resolved'

interface ThemeContextType {
  theme: Theme
  preference: ThemePreference
  setPreference: (pref: ThemePreference) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  preference: 'auto',
  setPreference: () => {},
  toggleTheme: () => {},
})

// Read initial theme from DOM synchronously
// This matches what the head script set, preventing hydration mismatch
function getInitialThemeFromDOM(): Theme {
  if (typeof window !== 'undefined') {
    // The head script already added .staff-dark if needed - read it
    return document.documentElement.classList.contains('staff-dark') ? 'staff-dark' : 'light'
  }
  return 'light'
}

// Read initial preference from localStorage synchronously
function getInitialPreference(): ThemePreference {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && ['auto', 'light', 'dark'].includes(stored)) {
        return stored as ThemePreference
      }
    } catch {
      // localStorage might be blocked
    }
  }
  return 'auto'
}

export function ThemeProvider({
  defaultTheme,
  children,
}: {
  defaultTheme: Theme
  children: React.ReactNode
}) {
  // Initialize theme from DOM synchronously - matches head script result
  // This prevents hydration mismatch and flash
  const [theme, setTheme] = useState<Theme>(getInitialThemeFromDOM)

  // Initialize preference from localStorage synchronously
  const [preference, setPreferenceState] = useState<ThemePreference>(getInitialPreference)

  // Compute what theme SHOULD be based on preference
  const computeTheme = useCallback((pref: ThemePreference): Theme => {
    if (pref === 'dark') return 'staff-dark'
    if (pref === 'light') return 'light'
    // 'auto' - use default theme
    return defaultTheme
  }, [defaultTheme])

  // Set preference and persist to localStorage
  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref)
    const newTheme = computeTheme(pref)
    setTheme(newTheme)
    localStorage.setItem(STORAGE_KEY, pref)
  }, [computeTheme])

  // Toggle between themes
  const toggleTheme = useCallback(() => {
    const newPref: ThemePreference = theme === 'light' ? 'dark' : 'light'
    setPreference(newPref)
  }, [theme, setPreference])

  // Sync theme state with preference on mount (handles edge cases)
  // This runs AFTER first render, so no flash
  useEffect(() => {
    const expectedTheme = computeTheme(preference)
    if (theme !== expectedTheme) {
      setTheme(expectedTheme)
    }

    // Seed preference on first visit if not set
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, 'auto')
      }
    }
  }, [preference, computeTheme, theme])

  // Apply theme class to both html and body elements
  // - html: for immediate background color (flash prevention)
  // - body: for Radix UI Portal components (Dialog, Select, Popover, DropdownMenu)
  //   which render content outside the component hierarchy at document.body level
  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    // Remove all theme classes from both elements
    html.classList.remove('light', 'staff-dark', 'dark')
    body.classList.remove('light', 'staff-dark', 'dark')

    // CSS variable values for each theme - must match globals.css exactly
    // These MUST be set inline to ensure Portal components get the correct values
    // immediately, before CSS cascade can update (race condition fix)
    // CRITICAL: Include ALL variables for BOTH themes
    const lightVars: Record<string, string> = {
      '--background': '0 0% 100%',
      '--foreground': '222.2 84% 4.9%',
      '--card': '0 0% 100%',
      '--card-foreground': '222.2 84% 4.9%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '222.2 84% 4.9%',
      '--primary': '222.2 47.4% 11.2%',
      '--primary-foreground': '210 40% 98%',
      '--secondary': '210 40% 96%',
      '--secondary-foreground': '222.2 47.4% 11.2%',
      '--muted': '210 40% 96%',
      '--muted-foreground': '215.4 16.3% 46.9%',
      '--accent': '210 40% 96%',
      '--accent-foreground': '222.2 47.4% 11.2%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '210 40% 98%',
      '--border': '214.3 31.8% 91.4%',
      '--input': '214.3 31.8% 91.4%',
      '--ring': '222.2 84% 4.9%',
      '--radius': '0.5rem',
      '--chart-1': '12 76% 61%',
      '--chart-2': '173 58% 39%',
      '--chart-3': '197 37% 24%',
      '--chart-4': '43 74% 66%',
      '--chart-5': '27 87% 67%',
    }

    const darkVars: Record<string, string> = {
      '--background': '0 0% 3.9%',
      '--foreground': '220 14% 96%',
      '--card': '0 0% 6%',
      '--card-foreground': '220 14% 96%',
      '--popover': '0 0% 12%',
      '--popover-foreground': '220 14% 96%',
      '--primary': '210 100% 70%',
      '--primary-foreground': '222.2 47.4% 11.2%',
      '--secondary': '220 12% 18%',
      '--secondary-foreground': '220 14% 88%',
      '--muted': '220 12% 22%',
      '--muted-foreground': '220 15% 72%',
      '--accent': '220 12% 22%',
      '--accent-foreground': '220 14% 94%',
      '--destructive': '0 62.8% 30.6%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '220 12% 18%',
      '--input': '220 12% 18%',
      '--ring': '220 15% 70%',
      '--radius': '0.5rem',
      '--chart-1': '210 90% 56%',
      '--chart-2': '164 85% 60%',
      '--chart-3': '34 95% 62%',
      '--chart-4': '280 75% 65%',
      '--chart-5': '340 80% 60%',
    }

    // Add current theme class to both and set ALL CSS variables inline
    const vars = theme === 'staff-dark' ? darkVars : lightVars

    if (theme === 'staff-dark') {
      html.classList.add('staff-dark')
      body.classList.add('staff-dark')
      html.style.colorScheme = 'dark'
    } else {
      html.style.colorScheme = 'light'
    }

    // Set ALL CSS variables on html element to ensure immediate update
    // This fixes the race condition where Portal components read stale values
    Object.entries(vars).forEach(([key, value]) => {
      html.style.setProperty(key, value)
    })

    // Store resolved theme for flash prevention on next load
    localStorage.setItem(RESOLVED_KEY, theme)

    return () => {
      // Cleanup on unmount
      html.classList.remove('staff-dark')
      body.classList.remove('staff-dark')
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
