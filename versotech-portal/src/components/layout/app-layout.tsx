import { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { BrandHeader } from './brand-header'
import { UserMenu } from './user-menu'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'

interface AppLayoutProps {
  children: ReactNode
  brand: 'versoholdings' | 'versotech'
}

export async function AppLayout({ children, brand }: AppLayoutProps) {
  // Get user profile for sidebar
  const profile = await getProfile()
  
  if (!profile) {
    const loginUrl = brand === 'versoholdings' ? '/versoholdings/login' : '/versotech/login'
    redirect(loginUrl)
  }

  // Verify user has correct access for the brand
  if (brand === 'versoholdings' && profile.role !== 'investor') {
    redirect('/versotech/staff')
  }
  
  if (brand === 'versotech' && profile.role !== 'staff') {
    redirect('/versoholdings/dashboard')
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Sidebar */}
      <Sidebar brand={brand} userProfile={profile} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <BrandHeader brand={brand} />
          <div className="flex items-center space-x-4">
            <UserMenu profile={profile} />
          </div>
        </header>
        
        {/* Content Area with glass morphism effect */}
        <main className="flex-1 overflow-y-auto bg-transparent backdrop-blur-sm">
          <div className="min-h-full bg-white/60 backdrop-blur-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}