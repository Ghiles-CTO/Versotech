'use client'

import Image from 'next/image'
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
  Clock,
  Keyboard,
  ListChecks,
  RotateCcw
} from 'lucide-react'
import { useMemo } from 'react'

import { useTour } from '@/contexts/tour-context'
import { getWelcomeMessage, getTourSteps } from '@/config/platform-tour'

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

// Unified gradient for tour icon (blue light, white dark)
const tourGradient = { from: 'from-blue-500', to: 'to-blue-600', fromDark: 'dark:from-white', toDark: 'dark:to-gray-200' }

export function TourWelcomeModal({ open, onClose, onSkip, persona = 'investor' }: TourWelcomeModalProps) {
  const { startTour } = useTour()

  const welcomeMessage = useMemo(
    () => getWelcomeMessage(persona),
    [persona]
  )
  const steps = useMemo(
    () => getTourSteps(persona),
    [persona]
  )
  const highlights = useMemo(
    () => {
      switch (persona) {
        case 'investor':
        case 'investor_entity':
        case 'investor_individual':
          return [
            'Access investment opportunities and start investing effortlessly',
            'Stay in control by tracking your entities and investments in real time',
            'Rely on expert support at every step',
          ]
        case 'arranger':
          return [
            'Manage mandates, deals, and subscription packs from one workspace',
            'Coordinate with introducers and track fee plans in real time',
            'Rely on expert support at every step',
          ]
        case 'introducer':
          return [
            'Track your introductions, agreements, and commissions in one place',
            'Monitor referral status and coordinate with arrangers seamlessly',
            'Rely on expert support at every step',
          ]
        case 'partner':
        case 'commercial_partner':
          return [
            'Manage your portfolio and track performance across vehicles',
            'Stay on top of commissions and fee structures in real time',
            'Rely on expert support at every step',
          ]
        case 'lawyer':
          return [
            'Review and manage signature tasks and legal documents',
            'Track deal progress and coordinate with arrangers efficiently',
            'Rely on expert support at every step',
          ]
        case 'ceo':
        case 'staff':
          return [
            'Oversee approvals, deals, and investor activity from one dashboard',
            'Access reconciliation, audit trails, and operational controls',
            'Rely on expert support at every step',
          ]
        default:
          return [
            'Explore the platform features tailored to your role',
            'Stay in control with real-time tracking and updates',
            'Rely on expert support at every step',
          ]
      }
    },
    [persona]
  )
  const gradient = tourGradient

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
        <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-zinc-900/50 dark:via-zinc-900/50 dark:to-zinc-900/50 px-6 pt-8 pb-6">
          {/* Decorative pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <DialogHeader className="text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: 'spring',
                damping: 18,
                stiffness: 180,
                delay: 0.1
              }}
              className="mx-auto mb-5"
            >
              <div className="flex items-center justify-center gap-3.5">
                <div className="relative h-14 w-14 flex-shrink-0">
                  <Image
                    src="/versotech-icon.png"
                    alt=""
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <span
                  style={{ fontFamily: 'var(--font-spartan), sans-serif', fontWeight: 700 }}
                  className="text-4xl tracking-wide text-gray-900 dark:text-white"
                >
                  VERSOTECH
                </span>
              </div>
            </motion.div>

            <DialogTitle className="text-2xl font-bold text-foreground">
              {welcomeMessage.title}
            </DialogTitle>
            <DialogDescription className="mt-2 max-w-md text-base text-muted-foreground mx-auto">
              {welcomeMessage.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content section */}
        <div className="px-6 py-5">
          {/* Tour overview stats */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-white/5 flex items-center justify-center">
                <ListChecks className="h-4 w-4 text-blue-600 dark:text-white" />
              </div>
              <span className="font-medium">{steps.length} Steps</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-white/5 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600 dark:text-white" />
              </div>
              <span className="font-medium">~{estimatedMinutes} min</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-white/5 flex items-center justify-center">
                <Keyboard className="h-4 w-4 text-blue-600 dark:text-white" />
              </div>
              <span className="font-medium">Keyboard</span>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="mb-6">
            <ul className="space-y-2.5 pl-5 text-left text-sm text-muted-foreground">
              {highlights.map((highlight) => (
                <li key={highlight} className="list-disc marker:text-blue-600 dark:marker:text-white">
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col gap-3 sm:flex-col px-6 pb-6 pt-0">
          {/* Gradient CTA button */}
          <Button
            onClick={handleStartTour}
            className={`w-full h-12 bg-gradient-to-r ${gradient.from} ${gradient.to} ${gradient.fromDark} ${gradient.toDark} hover:opacity-90 text-white dark:text-zinc-900 font-medium text-base shadow-lg shadow-blue-500/20 dark:shadow-white/10`}
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
