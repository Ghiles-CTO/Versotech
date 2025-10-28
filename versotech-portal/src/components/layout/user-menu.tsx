'use client'

import { useState } from 'react'
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

interface UserMenuProps {
  profile: Profile
}

export function UserMenu({ profile }: UserMenuProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await signOut()
      router.push('/')
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
      window.location.href = '/'
    }
  }

  const getProfileRoute = (role: string) => {
    if (role === 'investor') {
      return '/versoholdings/profile'
    } else if (role.startsWith('staff_')) {
      return '/versotech/staff/profile'
    }
    return '/profile'
  }

  const handleProfileClick = () => {
    router.push(getProfileRoute(profile.role))
  }

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'investor': return 'Investor'
      case 'staff_admin': return 'Administrator'
      case 'staff_ops': return 'Operations'
      case 'staff_rm': return 'Relationship Manager'
      default: return role
    }
  }

  const getRoleIcon = (role: string) => {
    if (role === 'investor') return Building2
    if (role.startsWith('staff_')) return Shield
    return User
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const RoleIcon = getRoleIcon(profile.role)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto px-3 py-2 hover:bg-white/10">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar || undefined} alt={profile.displayName} />
            <AvatarFallback className="bg-white/20 text-white text-xs">
              {getInitials(profile.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <div className="font-medium text-sm text-white">{profile.displayName}</div>
            <div className="text-xs text-white/70">{getRoleDisplay(profile.role)}</div>
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

