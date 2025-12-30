'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePersona } from '@/contexts/persona-context'
import { useTheme } from '@/components/theme-provider'
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
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  Check,
  Building2,
  Users,
  UserPlus,
  Briefcase,
  Scale,
  User,
  Settings,
  LogOut,
} from 'lucide-react'
import Image from 'next/image'
import { Profile } from '@/lib/auth'
import { signOut } from '@/lib/auth-client'

const PERSONA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  staff: Building2,
  investor: User,
  arranger: Briefcase,
  introducer: UserPlus,
  partner: Users,
  commercial_partner: Building2,
  lawyer: Scale,
}

const PERSONA_LABELS: Record<string, string> = {
  staff: 'Staff',
  investor: 'Investor',
  arranger: 'Arranger',
  introducer: 'Introducer',
  partner: 'Partner',
  commercial_partner: 'Commercial Partner',
  lawyer: 'Lawyer',
}

interface IdentityMenuProps {
  profile: Profile
  className?: string
}

export function IdentityMenu({ profile, className }: IdentityMenuProps) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { personas, activePersona, switchPersona, hasMultiplePersonas } = usePersona()
  const { theme } = useTheme()
  const router = useRouter()

  // Hydration fix: Only apply theme after component mounts to avoid SSR mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Use mounted check to prevent hydration mismatch (server renders light, client may have dark)
  const isDark = mounted && theme === 'staff-dark'

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

  const handleProfileClick = () => {
    setOpen(false)
    // Route to persona-specific profile page
    const profileRoutes: Record<string, string> = {
      arranger: '/versotech_main/arranger-profile',
      lawyer: '/versotech_main/lawyer-profile',
      // investor and staff use the unified profile
      investor: '/versotech_main/profile',
      staff: '/versotech_main/profile',
      introducer: '/versotech_main/profile',
      partner: '/versotech_main/profile',
      commercial_partner: '/versotech_main/profile',
    }
    const route = activePersona
      ? profileRoutes[activePersona.persona_type] || '/versotech_main/profile'
      : '/versotech_main/profile'
    router.push(route)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Render placeholder until mounted to prevent Radix UI hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        className={cn(
          "flex items-center gap-2 h-auto px-3 py-2",
          isDark ? 'hover:bg-white/10' : 'hover:bg-black/5',
          className
        )}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className={cn(
            "text-xs",
            isDark ? 'bg-white/20 text-white' : 'bg-black/10 text-black'
          )}>
            {getInitials(profile.displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="text-left">
          <div className={cn("font-medium text-sm", isDark ? "text-white" : "text-black")}>
            {profile.displayName}
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4", isDark ? "text-white/70" : "text-black/70")} />
      </Button>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 h-auto px-3 py-2",
            isDark ? 'hover:bg-white/10' : 'hover:bg-black/5',
            className
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar || undefined} alt={profile.displayName} />
            <AvatarFallback className={cn(
              "text-xs",
              isDark ? 'bg-white/20 text-white' : 'bg-black/10 text-black'
            )}>
              {getInitials(profile.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <div className={cn("font-medium text-sm", isDark ? "text-white" : "text-black")}>
              {profile.displayName}
            </div>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            isDark ? "text-white/70" : "text-black/70",
            open && "rotate-180"
          )} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn(
          "w-72",
          isDark ? "bg-[#1A1D24] border-white/10" : "bg-white border-gray-200"
        )}
      >
        {/* User Info */}
        <div className="px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile.avatar || undefined} alt={profile.displayName} />
              <AvatarFallback className={cn(
                "text-sm",
                isDark ? 'bg-white/20 text-white' : 'bg-black/10 text-black'
              )}>
                {getInitials(profile.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className={cn(
                "font-medium text-sm truncate",
                isDark ? "text-white" : "text-gray-900"
              )}>
                {profile.displayName}
              </div>
              <div className={cn(
                "text-xs truncate",
                isDark ? "text-gray-400" : "text-gray-500"
              )}>
                {profile.email}
              </div>
            </div>
          </div>
        </div>

        {/* Persona Switching - Only if multiple personas */}
        {hasMultiplePersonas && personas.length > 0 && (
          <>
            <DropdownMenuSeparator className={isDark ? "bg-white/10" : "bg-gray-100"} />
            <DropdownMenuLabel className={cn(
              "text-xs uppercase tracking-wider",
              isDark ? "text-gray-500" : "text-gray-400"
            )}>
              Switch Context
            </DropdownMenuLabel>

            {personas.map((persona) => {
              const Icon = PERSONA_ICONS[persona.persona_type] || User
              const isActive = activePersona?.entity_id === persona.entity_id

              return (
                <DropdownMenuItem
                  key={persona.entity_id}
                  onClick={() => {
                    switchPersona(persona)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex items-center gap-3 py-2.5 cursor-pointer",
                    isDark
                      ? "focus:bg-white/10 focus:text-white"
                      : "focus:bg-gray-100 focus:text-gray-900",
                    isActive && (isDark ? "bg-white/5" : "bg-blue-50")
                  )}
                >
                  {persona.entity_logo_url ? (
                    <div className="relative h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={persona.entity_logo_url}
                        alt={persona.entity_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                      isDark ? "bg-white/10" : "bg-gray-100"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "text-sm font-medium truncate",
                      isDark ? "text-white" : "text-gray-900"
                    )}>
                      {persona.entity_name}
                    </div>
                    <div className={cn(
                      "text-xs truncate",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>
                      {persona.persona_type === 'staff'
                        ? persona.role_in_entity
                        : PERSONA_LABELS[persona.persona_type]}
                    </div>
                  </div>

                  {isActive && (
                    <Check className={cn(
                      "h-4 w-4 flex-shrink-0",
                      isDark ? "text-blue-400" : "text-blue-600"
                    )} />
                  )}
                </DropdownMenuItem>
              )
            })}
          </>
        )}

        {/* Single Persona - Show context */}
        {!hasMultiplePersonas && activePersona && (
          <>
            <DropdownMenuSeparator className={isDark ? "bg-white/10" : "bg-gray-100"} />
            <div className="px-3 py-2">
              <div className={cn(
                "text-xs uppercase tracking-wider mb-1.5",
                isDark ? "text-gray-500" : "text-gray-400"
              )}>
                Current Context
              </div>
              <div className="flex items-center gap-2">
                {activePersona.entity_logo_url ? (
                  <div className="relative h-6 w-6 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={activePersona.entity_logo_url}
                      alt={activePersona.entity_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0",
                    isDark ? "bg-white/10" : "bg-gray-100"
                  )}>
                    {(() => {
                      const Icon = PERSONA_ICONS[activePersona.persona_type] || User
                      return <Icon className="h-3 w-3" />
                    })()}
                  </div>
                )}
                <div className={cn(
                  "text-sm",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  {activePersona.entity_name}
                </div>
              </div>
            </div>
          </>
        )}

        <DropdownMenuSeparator className={isDark ? "bg-white/10" : "bg-gray-100"} />

        {/* Actions */}
        <DropdownMenuItem
          onClick={handleProfileClick}
          className={isDark ? "focus:bg-white/10 focus:text-white" : ""}
        >
          <Settings className="mr-2 h-4 w-4" />
          Profile Settings
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? 'Signing out...' : 'Sign Out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
