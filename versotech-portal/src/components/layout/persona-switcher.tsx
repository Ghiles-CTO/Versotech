'use client'

import { useState } from 'react'
import { usePersona, Persona } from '@/contexts/persona-context'
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
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  Check,
  Building2,
  Users,
  UserPlus,
  Briefcase,
  Scale,
  User
} from 'lucide-react'
import Image from 'next/image'

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

interface PersonaSwitcherProps {
  className?: string
}

export function PersonaSwitcher({ className }: PersonaSwitcherProps) {
  const { personas, activePersona, switchPersona } = usePersona()
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()

  // Theme based on ACTIVE persona only
  const isDark = theme === 'staff-dark'

  if (!activePersona || personas.length <= 1) {
    return null
  }

  const ActiveIcon = PERSONA_ICONS[activePersona.persona_type] || User

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 px-3 py-2 h-auto",
            isDark
              ? "text-gray-300 hover:text-white hover:bg-white/10"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
            className
          )}
        >
          {/* Entity logo or icon */}
          {activePersona.entity_logo_url ? (
            <div className="relative h-6 w-6 rounded-full overflow-hidden">
              <Image
                src={activePersona.entity_logo_url}
                alt={activePersona.entity_name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <ActiveIcon className="h-5 w-5" />
          )}

          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium leading-none">
              {activePersona.entity_name}
            </span>
            <span className={cn(
              "text-xs leading-none mt-0.5",
              isDark ? "text-gray-500" : "text-gray-500"
            )}>
              {activePersona.persona_type === 'staff'
                ? activePersona.role_in_entity
                : PERSONA_LABELS[activePersona.persona_type]}
            </span>
          </div>

          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            open && "rotate-180"
          )} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn(
          "w-64",
          isDark
            ? "bg-[#1A1D24] border-white/10 text-white"
            : "bg-white border-gray-200"
        )}
      >
        <DropdownMenuLabel className={cn(
          "text-xs",
          isDark ? "text-gray-400" : "text-gray-500"
        )}>
          Switch Persona
        </DropdownMenuLabel>
        <DropdownMenuSeparator className={isDark ? "bg-white/10" : "bg-gray-100"} />

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
                "flex items-center gap-3 py-2 cursor-pointer",
                isDark
                  ? "focus:bg-white/10 focus:text-white"
                  : "focus:bg-gray-100 focus:text-gray-900",
                isActive && (isDark ? "bg-white/5" : "bg-gray-50")
              )}
            >
              {/* Entity logo or icon */}
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
                  {persona.is_primary && ' (Primary)'}
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
