'use client'

import { createContext, useContext, useEffect } from 'react'

interface ThemeContextType {
  theme: 'light' | 'staff-dark'
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light' })

export function ThemeProvider({
  theme,
  children,
}: {
  theme: 'light' | 'staff-dark'
  children: React.ReactNode
}) {
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
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
