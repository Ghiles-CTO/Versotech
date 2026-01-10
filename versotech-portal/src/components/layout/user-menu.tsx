'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Settings, LogOut, Shield, Building2 } from 'lucide-react'
import { Profile } from '@/lib/auth'
import { signOut } from '@/lib/auth-client'
import { useTheme } from '@/components/theme-provider'

interface UserMenuProps {
  profile: Profile
  brand?: 'versoholdings' | 'versotech'
  useThemeColors?: boolean
}

export function UserMenu({ profile, brand = 'versotech', useThemeColors = false }: UserMenuProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const isDark = useThemeColors ? theme === 'staff-dark' : brand === 'versotech'
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Wait for client-side hydration to complete
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const loginPath = '/versotech_main/login'

    try {
      await signOut()
      router.push(loginPath)
      window.location.href = loginPath
    } catch (error) {
      console.error('Logout failed:', error)
      window.location.href = loginPath
    }
  }

  const getProfileRoute = (role: string) => {
    // All users now use unified portal profile
    // Legacy routes redirect via next.config.ts
    return '/versotech_main/profile'
  }

  const handleProfileClick = () => {
    router.push(getProfileRoute(profile.role))
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'investor': return 'Investor'
      case 'staff_admin': return 'CEO'
      case 'staff_ops': return 'Operations'
      case 'staff_rm': return 'Relationship Manager'
      case 'ceo': return 'CEO'
      default: return role
    }
  }

  const getRoleIcon = (role: string) => {
    if (role === 'investor') return Building2
    if (role.startsWith('staff_') || role === 'ceo') return Shield
    return User
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(part => part[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  }

  const RoleIcon = getRoleIcon(profile.role)

  // Render placeholder until mounted to prevent Radix UI hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" className={`flex items-center gap-2 h-auto px-3 py-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
        <Avatar className="h-8 w-8">
          <AvatarFallback className={`${isDark ? 'bg-white/20 text-white' : 'bg-black/10 text-black'} text-xs`}>
            {getInitials(profile.displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="text-left">
          <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-black'}`}>{profile.displayName}</div>
          <div className={`text-xs ${isDark ? 'text-white/70' : 'text-black/70'}`}>{getRoleDisplay(profile.role)}</div>
        </div>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`flex items-center gap-2 h-auto px-3 py-2 ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar || undefined} alt={profile.displayName} />
            <AvatarFallback className={`${isDark ? 'bg-white/20 text-white' : 'bg-black/10 text-black'} text-xs`}>
              {getInitials(profile.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-black'}`}>{profile.displayName}</div>
            <div className={`text-xs ${isDark ? 'text-white/70' : 'text-black/70'}`}>{getRoleDisplay(profile.role)}</div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <div className="px-2 py-1.5">
          <div className="text-sm font-medium">{profile.displayName}</div>
          <div className="text-xs text-muted-foreground">{profile.email}</div>
          {profile.title && (
            <div className="text-xs text-muted-foreground">{profile.title}</div>
          )}
        </div>
        
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleProfileClick}>
          <User className="mr-2 h-4 w-4" />
          Profile Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? 'Signing out...' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

