import { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { BrandHeader } from './brand-header'
import { UserMenu } from './user-menu'
import { GlobalKeyboardShortcuts } from './global-keyboard-shortcuts'
import { ThemeProvider } from '@/components/theme-provider'
import { getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KYCAlert } from '@/components/dashboard/kyc-alert'

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
  const isStaffRole = ['staff_admin', 'staff_ops', 'staff_rm', 'ceo'].includes(profile.role)

  console.log('[AppLayout] Profile check:', {
    brand,
    userRole: profile.role,
    isStaffRole,
    email: profile.email
  })

  if (brand === 'versoholdings' && profile.role !== 'investor') {
    console.log('[AppLayout] Redirecting non-investor from versoholdings')
    redirect('/versotech/staff')
  }

  if (brand === 'versotech' && !isStaffRole) {
    console.log('[AppLayout] Redirecting non-staff from versotech')
    redirect('/versoholdings/dashboard')
  }

  console.log('[AppLayout] Access granted for', profile.email, 'to', brand)

  const isStaff = brand === 'versotech'
  const theme = isStaff ? 'staff-dark' : 'light'

  // Fetch KYC status if investor
  let kycStatus = 'completed' // Default to completed so we don't show alert if check fails or not investor
  if (brand === 'versoholdings' && profile.role === 'investor') {
    try {
      const supabase = await createClient()
      const { data: investorUser } = await supabase
        .from('investor_users')
        .select('investor_id, investors(kyc_status)')
        .eq('user_id', profile.id)
        .single()

      if (investorUser?.investors) {
        // @ts-expect-error - Types might not be fully generated for the join
        kycStatus = investorUser.investors.kyc_status || 'not_started'
      }
    } catch (error) {
      console.error('[AppLayout] Error fetching KYC status:', error)
    }
  }

  return (
    <ThemeProvider defaultTheme={theme}>
      <div className={`flex h-screen min-h-screen overflow-hidden ${isStaff ? 'staff-dark bg-[#0a0a0a]' : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20'}`}>
        {/* Global Keyboard Shortcuts (Cmd+K, Cmd+Shift+S) */}
        <GlobalKeyboardShortcuts brand={brand} role={profile.role} />

        {/* Sidebar */}
        <Sidebar brand={brand} userProfile={profile} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className={`${isStaff ? 'bg-[#0a0a0a] border-b border-white/10' : 'bg-white/80 backdrop-blur-sm border-b border-gray-200'} px-6 py-4 flex items-center justify-between`}>
            <BrandHeader brand={brand} />
            <div className="flex items-center space-x-4">
              <UserMenu profile={profile} brand={brand} />
            </div>
          </header>

          {/* Content Area */}
          <main className={`flex-1 overflow-y-auto scrollbar-hide ${isStaff ? 'bg-[#0a0a0a]' : 'bg-transparent backdrop-blur-sm'}`}>
            <div className={`min-h-full ${isStaff ? '' : 'bg-white/60 backdrop-blur-sm'}`}>
              {/* KYC Alert for Investors */}
              {!isStaff && kycStatus !== 'completed' && (
                <div className="px-6 pt-6">
                  <KYCAlert status={kycStatus} />
                </div>
              )}
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
