'use client'

import { useTheme } from '@/components/theme-provider'
import { useMemo } from 'react'

/**
 * Theme-aware color utilities for charts and dynamic content
 *
 * This module provides consistent colors that adapt to light/dark mode,
 * especially for Recharts which requires inline color props that can't
 * use CSS variables directly.
 */

export interface ChartColorScheme {
  // Grid and axis
  grid: string
  axis: string
  axisLine: string

  // Tooltip
  tooltip: {
    bg: string
    border: string
    text: string
    label: string
  }

  // Data visualization colors
  primary: string
  secondary: string
  success: string
  warning: string
  danger: string
  info: string

  // Gradient stops
  gradientStart: string
  gradientEnd: string

  // Chart-specific
  area: {
    fill: string
    stroke: string
  }
  bar: {
    fill: string
    hover: string
  }
  line: {
    stroke: string
    dot: string
    activeDot: string
  }
  pie: {
    stroke: string
  }
}

// Light mode chart colors
const lightColors: ChartColorScheme = {
  grid: '#e5e7eb',
  axis: '#6b7280',
  axisLine: '#e5e7eb',

  tooltip: {
    bg: '#ffffff',
    border: '#e5e7eb',
    text: '#111827',
    label: '#6b7280',
  },

  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#0ea5e9',

  gradientStart: '#3b82f6',
  gradientEnd: 'rgba(59, 130, 246, 0.1)',

  area: {
    fill: 'rgba(59, 130, 246, 0.1)',
    stroke: '#3b82f6',
  },
  bar: {
    fill: '#3b82f6',
    hover: '#2563eb',
  },
  line: {
    stroke: '#3b82f6',
    dot: '#ffffff',
    activeDot: '#3b82f6',
  },
  pie: {
    stroke: '#ffffff',
  },
}

// Dark mode chart colors
const darkColors: ChartColorScheme = {
  grid: '#27272a',
  axis: '#a1a1aa',
  axisLine: '#3f3f46',

  tooltip: {
    bg: '#18181b',
    border: '#3f3f46',
    text: '#fafafa',
    label: '#a1a1aa',
  },

  primary: '#60a5fa',
  secondary: '#a78bfa',
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  info: '#38bdf8',

  gradientStart: '#60a5fa',
  gradientEnd: 'rgba(96, 165, 250, 0.1)',

  area: {
    fill: 'rgba(96, 165, 250, 0.15)',
    stroke: '#60a5fa',
  },
  bar: {
    fill: '#60a5fa',
    hover: '#3b82f6',
  },
  line: {
    stroke: '#60a5fa',
    dot: '#18181b',
    activeDot: '#60a5fa',
  },
  pie: {
    stroke: '#18181b',
  },
}

// Multi-series color palette for charts with multiple data series
export const chartPalette = {
  light: [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#0ea5e9', // sky
    '#f97316', // orange
    '#14b8a6', // teal
  ],
  dark: [
    '#60a5fa', // blue
    '#34d399', // emerald
    '#fbbf24', // amber
    '#a78bfa', // violet
    '#f472b6', // pink
    '#38bdf8', // sky
    '#fb923c', // orange
    '#2dd4bf', // teal
  ],
}

/**
 * Hook to get theme-aware chart colors
 *
 * @example
 * ```tsx
 * const chartColors = useChartColors()
 * <CartesianGrid stroke={chartColors.grid} />
 * <XAxis stroke={chartColors.axis} />
 * ```
 */
export function useChartColors(): ChartColorScheme {
  const { theme } = useTheme()

  return useMemo(() => {
    return theme === 'staff-dark' ? darkColors : lightColors
  }, [theme])
}

/**
 * Hook to get theme-aware chart color palette for multi-series charts
 *
 * @example
 * ```tsx
 * const palette = useChartPalette()
 * {data.map((entry, index) => (
 *   <Cell key={index} fill={palette[index % palette.length]} />
 * ))}
 * ```
 */
export function useChartPalette(): string[] {
  const { theme } = useTheme()

  return useMemo(() => {
    return theme === 'staff-dark' ? chartPalette.dark : chartPalette.light
  }, [theme])
}

/**
 * Hook to check if dark mode is active
 */
export function useIsDarkMode(): boolean {
  const { theme } = useTheme()
  return theme === 'staff-dark'
}

/**
 * Get static chart colors (for non-React contexts)
 * Use the hooks above when possible for reactive updates
 */
export function getChartColors(isDark: boolean): ChartColorScheme {
  return isDark ? darkColors : lightColors
}

export function getChartPalette(isDark: boolean): string[] {
  return isDark ? chartPalette.dark : chartPalette.light
}
