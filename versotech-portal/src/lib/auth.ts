import { getUserById, type SessionData, type DemoUser } from './simple-auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type UserRole = 'investor' | 'staff'

export interface Profile {
  id: string
  role: UserRole
  displayName: string
  email: string
  avatar?: string
  department?: string
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('demo_session')
    
    if (!sessionCookie) {
      return null
    }

    const session: SessionData = JSON.parse(sessionCookie.value)
    
    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      cookieStore.delete('demo_session')
      return null
    }

    return getUserById(session.id)
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

export async function getProfile(): Promise<Profile | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('demo_session')
    
    if (!sessionCookie) {
      return null
    }

    const session: SessionData = JSON.parse(sessionCookie.value)
    
    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      cookieStore.delete('demo_session')
      return null
    }

    // Get user data
    const user = getUserById(session.id)
    if (!user) {
      cookieStore.delete('demo_session')
      return null
    }

    return {
      id: user.id,
      role: user.role,
      displayName: user.displayName,
      email: user.email,
      avatar: user.avatar,
      department: user.department
    }
  } catch (error) {
    console.error('Error in getProfile:', error)
    return null
  }
}

export async function requireAuth(allowedRoles?: UserRole[]) {
  const profile = await getProfile()
  
  if (!profile) {
    redirect('/versoholdings/login')
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    throw new Error('Insufficient permissions')
  }

  return profile
}

export async function requireInvestorAuth() {
  const profile = await getProfile()
  
  if (!profile) {
    redirect('/versoholdings/login')
  }

  if (profile.role !== 'investor') {
    throw new Error('Investor access required')
  }

  return profile
}

export async function requireStaffAuth() {
  const profile = await getProfile()
  
  if (!profile) {
    redirect('/versotech/login')
  }

  if (profile.role !== 'staff') {
    throw new Error('Staff access required')
  }

  return profile
}