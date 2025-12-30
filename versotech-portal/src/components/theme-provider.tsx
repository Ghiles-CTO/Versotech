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

    // Add current theme class to both and set CSS variable
    if (theme === 'staff-dark') {
      html.classList.add('staff-dark')
      body.classList.add('staff-dark')
      html.style.colorScheme = 'dark'
      // Set CSS variable to ensure bg-background uses dark color
      html.style.setProperty('--background', '0 0% 3.9%')
    } else {
      html.style.colorScheme = 'light'
      // Reset to light mode CSS variable
      html.style.setProperty('--background', '0 0% 100%')
    }

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
