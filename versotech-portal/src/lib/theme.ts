// VERSO Holdings brand tokens from PRD
export const theme = {
  colors: {
    blue: '#0B5FFF',
    blueHover: '#0A54E6',
    black: '#0A0A0A',
    white: '#FFFFFF',
    text: '#111827',
    muted: '#6B7280',
    surface: '#F3F4F6',
    focus: '#93C5FD'
  }
}

// Brand configuration for unified portal
export const brands = {
  versoholdings: {
    name: 'VERSO',
    loginPath: '/login',
    dashboardPath: '/versotech_main/dashboard',
    primary: theme.colors.blue,
    // Investor-focused branding
  },
  versotech: {
    name: 'VERSO Tech',
    loginPath: '/login',
    dashboardPath: '/versotech_main',
    primary: theme.colors.blue,
    // Staff-focused branding
  }
} as const

export type Brand = keyof typeof brands

