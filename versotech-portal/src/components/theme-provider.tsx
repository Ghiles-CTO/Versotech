'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'light' | 'staff-dark'
type ThemePreference = 'auto' | 'light' | 'dark'

const STORAGE_KEY = 'verso-theme-preference'

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

export function ThemeProvider({
  defaultTheme,
  children,
}: {
  defaultTheme: Theme
  children: React.ReactNode
}) {
  // State for user preference (auto, light, dark)
  const [preference, setPreferenceState] = useState<ThemePreference>('auto')
  const [isHydrated, setIsHydrated] = useState(false)

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null
    if (stored && ['auto', 'light', 'dark'].includes(stored)) {
      setPreferenceState(stored)
    }
    setIsHydrated(true)
  }, [])

  // Calculate effective theme based on preference and default
  const theme: Theme = (() => {
    if (!isHydrated) return defaultTheme
    if (preference === 'auto') return defaultTheme
    if (preference === 'dark') return 'staff-dark'
    return 'light'
  })()

  // Set preference and persist to localStorage
  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref)
    localStorage.setItem(STORAGE_KEY, pref)
  }, [])

  // Toggle between themes
  const toggleTheme = useCallback(() => {
    const newPref: ThemePreference = theme === 'light' ? 'dark' : 'light'
    setPreference(newPref)
  }, [theme, setPreference])

  // Apply theme class to body element so portals inherit it
  // This is critical for Radix UI Portal components (Dialog, Select, Popover, DropdownMenu)
  // which render content outside the component hierarchy at document.body level
  useEffect(() => {
    // Remove all theme classes
    document.body.classList.remove('light', 'staff-dark', 'dark')

    // Add current theme class
    if (theme === 'staff-dark') {
      document.body.classList.add('staff-dark')
    }

    return () => {
      // Cleanup on unmount
      document.body.classList.remove('staff-dark')
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, preference, setPreference, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
