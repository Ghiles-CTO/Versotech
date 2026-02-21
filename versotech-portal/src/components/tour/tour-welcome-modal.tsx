'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  Sparkles,
  ArrowRight,
  Building2,
  Briefcase,
  Users,
  Scale,
  UserCircle,
  Shield,
  Clock,
  Keyboard,
  ListChecks,
  Check,
  RotateCcw
} from 'lucide-react'
import { useTour } from '@/contexts/tour-context'
import { getWelcomeMessage, getTourSteps } from '@/config/platform-tour'
import { useMemo } from 'react'

const ACTIVE_TOUR_PERSONA_COOKIE = 'verso_active_tour_persona'
const ALLOWED_TOUR_PERSONA_KEYS = new Set([
  'investor_entity',
  'investor_individual',
  'ceo',
  'staff',
  'arranger',
  'introducer',
  'partner',
  'commercial_partner',
  'lawyer',
])

interface TourWelcomeModalProps {
  open: boolean
  onClose: () => void
  onSkip: () => Promise<void>
  persona?: string
}

// Get the appropriate icon component for each persona type
function getPersonaIcon(persona: string) {
  switch (persona) {
    case 'ceo':
      return Shield
    case 'staff':
      return Users
    case 'arranger':
      return Briefcase
    case 'investor':
    case 'investor_entity':
      return Building2
    case 'investor_individual':
      return UserCircle
    case 'introducer':
    case 'partner':
    case 'commercial_partner':
      return Users
    case 'lawyer':
      return Scale
    default:
      return Sparkles
  }
}

// Persona-specific gradient colors for the icon
const personaGradients: Record<string, { from: string; to: string }> = {
  ceo: { from: 'from-purple-500', to: 'to-purple-600' },
  staff: { from: 'from-rose-500', to: 'to-rose-600' },
  arranger: { from: 'from-blue-500', to: 'to-indigo-600' },
  investor: { from: 'from-emerald-500', to: 'to-emerald-600' },
  investor_entity: { from: 'from-emerald-500', to: 'to-emerald-600' },
  investor_individual: { from: 'from-teal-500', to: 'to-teal-600' },
  introducer: { from: 'from-amber-500', to: 'to-amber-600' },
  partner: { from: 'from-cyan-500', to: 'to-cyan-600' },
  commercial_partner: { from: 'from-indigo-500', to: 'to-indigo-600' },
  lawyer: { from: 'from-slate-500', to: 'to-slate-600' },
}

export function TourWelcomeModal({ open, onClose, onSkip, persona = 'investor' }: TourWelcomeModalProps) {
  const { startTour } = useTour()

  // Get persona-specific welcome message
  const welcomeMessage = useMemo(() => getWelcomeMessage(persona), [persona])
  const steps = useMemo(() => getTourSteps(persona), [persona])
  const PersonaIcon = useMemo(() => getPersonaIcon(persona), [persona])
  const gradient = personaGradients[persona] || personaGradients.arranger

  // Calculate estimated time (roughly 30 seconds per step)
  const estimatedMinutes = Math.max(1, Math.ceil(steps.length * 0.5))

  const handleStartTour = () => {
    onClose()
    // Small delay to let modal close animation complete
    setTimeout(() => startTour(), 300)
  }

  const handleSkip = async () => {
    onClose()
    await onSkip()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden" showCloseButton={false}>
        {/* Gradient header background with decorative pattern */}
        <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 px-6 pt-8 pb-6">
          {/* Decorative pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <DialogHeader className="text-center relative">
            {/* Animated large icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                damping: 15,
                stiffness: 200,
                delay: 0.1
              }}
              className="mx-auto mb-5"
            >
              <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${gradient.from} ${gradient.to} shadow-lg flex items-center justify-center`}>
                <motion.div
                  animate={{
                    rotateY: [0, 10, 0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <PersonaIcon className="h-10 w-10 text-white" />
                </motion.div>
              </div>
            </motion.div>

            <DialogTitle className="text-2xl font-bold text-foreground">
              {welcomeMessage.title}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2 max-w-sm mx-auto">
              {welcomeMessage.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content section */}
        <div className="px-6 py-5">
          {/* Tour overview stats */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <ListChecks className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium">{steps.length} Steps</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="font-medium">~{estimatedMinutes} min</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                <Keyboard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-medium">Keyboard</span>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="space-y-2.5 mb-6">
            <div className="flex items-start gap-3 text-sm">
              <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-muted-foreground">Interactive walkthrough of key features</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-muted-foreground">Skip anytime or resume later</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-muted-foreground">Restart from settings anytime</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-3 sm:flex-col px-6 pb-6 pt-0">
          {/* Gradient CTA button */}
          <Button
            onClick={handleStartTour}
            className={`w-full h-12 bg-gradient-to-r ${gradient.from} ${gradient.to} hover:opacity-90 text-white font-medium text-base shadow-lg shadow-blue-500/20`}
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Start Tour
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>

          {/* Skip button */}
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Tour Restart Button Component
 * For use in settings/profile pages to let users restart the tour
 */
export function TourRestartButton({ className = '' }: { className?: string }) {
  const readCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null

    const prefix = `${name}=`
    for (const chunk of document.cookie.split('; ')) {
      if (chunk.startsWith(prefix)) {
        const rawValue = chunk.slice(prefix.length)
        return decodeURIComponent(rawValue)
      }
    }

    return null
  }

  const handleRestartTour = async () => {
    try {
      const activeTourPersona = readCookie(ACTIVE_TOUR_PERSONA_COOKIE)
      const body = ALLOWED_TOUR_PERSONA_KEYS.has(activeTourPersona || '')
        ? { personaKey: activeTourPersona }
        : { all: true }

      const response = await fetch('/api/profiles/tour-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        let message = 'Failed to reset tour'
        try {
          const payload = await response.json()
          if (payload?.error && typeof payload.error === 'string') {
            message = payload.error
          }
        } catch {
          // Keep default message
        }
        throw new Error(message)
      }

      // Reload to show welcome modal
      window.location.reload()
    } catch (error) {
      console.error('Failed to reset tour:', error)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleRestartTour}
      className={className}
    >
      <RotateCcw className="h-4 w-4 mr-2" />
      Restart Platform Tour
    </Button>
  )
}
