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
import { User, Settings, LogOut, Shield, Building2 } from 'lucide-react'
import { Profile } from '@/lib/auth'

interface UserMenuProps {
  profile: Profile
}

export function UserMenu({ profile }: UserMenuProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        // Redirect to home page
        router.push('/')
        // Force page refresh to clear all state
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout failed:', error)
      // Still redirect on error
      window.location.href = '/'
    }
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

  const RoleIcon = getRoleIcon(profile.role)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-auto px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <RoleIcon className="h-4 w-4 text-gray-600" />
          </div>
          <div className="text-left">
            <div className="font-medium text-sm">{profile.display_name}</div>
            <div className="text-xs text-muted-foreground">{getRoleDisplay(profile.role)}</div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <div className="px-2 py-1.5">
          <div className="text-sm font-medium">{profile.display_name}</div>
          <div className="text-xs text-muted-foreground">{profile.email}</div>
          {profile.title && (
            <div className="text-xs text-muted-foreground">{profile.title}</div>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile Settings
        </DropdownMenuItem>
        
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Preferences
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

