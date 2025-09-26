// Demo session management utilities

export interface DemoSession {
  id: string
  email: string
  role: string
  displayName: string
}

export const DEMO_COOKIE_NAME = 'demo_auth_user'

export const createDemoSession = (user: DemoSession): string => {
  return JSON.stringify(user)
}

export const parseDemoSession = (cookieValue: string): DemoSession | null => {
  try {
    const data = JSON.parse(cookieValue)
    if (data.id && data.email && data.role && data.displayName) {
      return data as DemoSession
    }
    return null
  } catch (error) {
    console.error('[demo-session] Failed to parse demo session:', error)
    return null
  }
}

export const isStaffDemoRole = (role: string): boolean => {
  return ['staff_admin', 'staff_ops', 'staff_rm'].includes(role)
}

export const isInvestorDemoRole = (role: string): boolean => {
  return role === 'investor'
}

export const getDemoRedirectPath = (role: string): string => {
  return isStaffDemoRole(role) ? '/versotech/staff' : '/versoholdings/dashboard'
}
