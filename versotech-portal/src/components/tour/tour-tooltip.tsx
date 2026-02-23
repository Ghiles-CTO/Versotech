'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { X, ArrowRight, ArrowLeft, ChevronRight, Check, ChevronDown, ChevronUp, Keyboard } from 'lucide-react'
import { useTour } from '@/contexts/tour-context'
import type { TourStep } from '@/config/platform-tour'

interface TourTooltipProps {
  step: TourStep
  stepNumber: number
  persona?: string
}

type ArrowSide = 'left' | 'right' | 'top' | 'bottom'

interface Position {
  top: number
  left: number
  arrowSide: ArrowSide
}

// Persona-specific color theming for header
const personaColors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  ceo: {
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    border: 'border-purple-100 dark:border-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-500 to-purple-600'
  },
  staff: {
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    border: 'border-rose-100 dark:border-rose-500/20',
    text: 'text-rose-600 dark:text-rose-400',
    gradient: 'from-rose-500 to-rose-600'
  },
  arranger: {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-100 dark:border-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500 to-blue-600'
  },
  investor: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-100 dark:border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  investor_entity: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-100 dark:border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  investor_individual: {
    bg: 'bg-teal-50 dark:bg-teal-500/10',
    border: 'border-teal-100 dark:border-teal-500/20',
    text: 'text-teal-600 dark:text-teal-400',
    gradient: 'from-teal-500 to-teal-600'
  },
  introducer: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-100 dark:border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500 to-amber-600'
  },
  partner: {
    bg: 'bg-cyan-50 dark:bg-cyan-500/10',
    border: 'border-cyan-100 dark:border-cyan-500/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    gradient: 'from-cyan-500 to-cyan-600'
  },
  commercial_partner: {
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    border: 'border-indigo-100 dark:border-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    gradient: 'from-indigo-500 to-indigo-600'
  },
  lawyer: {
    bg: 'bg-slate-50 dark:bg-slate-500/10',
    border: 'border-slate-100 dark:border-slate-500/20',
    text: 'text-slate-600 dark:text-slate-400',
    gradient: 'from-slate-500 to-slate-600'
  },
}

// SVG Arrow component - cleaner than rotated CSS divs
function TooltipArrow({ side, className = '' }: { side: ArrowSide; className?: string }) {
  // Arrow dimensions
  const width = 22
  const height = 12

  // Arrow styles based on side
  const positionStyles: Record<ArrowSide, string> = {
    left: 'absolute -left-[11px] top-1/2 -translate-y-1/2 rotate-90',
    right: 'absolute -right-[11px] top-1/2 -translate-y-1/2 -rotate-90',
    top: 'absolute left-1/2 -translate-x-1/2 -top-[11px] rotate-180',
    bottom: 'absolute left-1/2 -translate-x-1/2 -bottom-[11px]',
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`${positionStyles[side]} ${className}`}
      style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
    >
      <path
        d="M1 12L11 2L21 12"
        className="fill-white dark:fill-zinc-900 stroke-border"
        strokeWidth="1"
      />
    </svg>
  )
}

export function TourTooltip({ step, stepNumber, persona = 'investor' }: TourTooltipProps) {
  const { isActive, totalSteps, nextStep, prevStep, skipTour, closeTour } = useTour()
  const pathname = usePathname()
  const [position, setPosition] = useState<Position | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [targetMissing, setTargetMissing] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Get persona colors or default to blue
  const colors = personaColors[persona] || personaColors.arranger

  // Handle client-side mounting for createPortal
  useEffect(() => {
    setMounted(true)
    // Check for mobile
    setIsMobile(window.innerWidth < 640)
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Reset showDetails when step changes
  useEffect(() => {
    setShowDetails(false)
  }, [stepNumber])

  useEffect(() => {
    if (!isActive || !mounted) {
      setPosition(null)
      setTargetMissing(false)
      return
    }

    const updatePosition = () => {
      // On mobile, always position at bottom
      if (isMobile) {
        setPosition({
          top: 0,
          left: 0,
          arrowSide: 'top' // Not used on mobile but required by type
        })
        return
      }

      const target = document.querySelector(step.target)
      if (!target) {
        setTargetMissing(true)
        // Target not found - position in center of screen
        setPosition({
          top: window.innerHeight / 2 - 100,
          left: window.innerWidth / 2 - 200,
          arrowSide: 'left'
        })
        return
      }

      setTargetMissing(false)

      const targetRect = target.getBoundingClientRect()
      const tooltipWidth = 400 // Wider tooltip
      const tooltipHeight = tooltipRef.current?.offsetHeight || 300
      const gap = 20 // Space between tooltip and target
      const viewportPadding = 20

      let top = 0
      let left = 0
      let arrowSide: ArrowSide = 'left'

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Calculate position based on preferred placement with collision detection
      switch (step.placement) {
        case 'right':
          left = targetRect.right + gap
          top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
          arrowSide = 'left'

          if (left + tooltipWidth > viewportWidth - viewportPadding) {
            left = targetRect.left - tooltipWidth - gap
            arrowSide = 'right'
          }
          break

        case 'left':
          left = targetRect.left - tooltipWidth - gap
          top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2
          arrowSide = 'right'

          if (left < viewportPadding) {
            left = targetRect.right + gap
            arrowSide = 'left'
          }
          break

        case 'bottom':
          top = targetRect.bottom + gap
          left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
          arrowSide = 'top'

          if (top + tooltipHeight > viewportHeight - viewportPadding) {
            top = targetRect.top - tooltipHeight - gap
            arrowSide = 'bottom'
          }
          break

        case 'top':
        default:
          top = targetRect.top - tooltipHeight - gap
          left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
          arrowSide = 'bottom'

          if (top < viewportPadding) {
            top = targetRect.bottom + gap
            arrowSide = 'top'
          }
      }

      // Keep within horizontal bounds
      left = Math.max(viewportPadding, Math.min(left, viewportWidth - tooltipWidth - viewportPadding))
      // Keep within vertical bounds
      top = Math.max(viewportPadding, Math.min(top, viewportHeight - tooltipHeight - viewportPadding))

      setPosition({ top, left, arrowSide })
    }

    // Small delay to let spotlight position first and DOM settle
    const timer = setTimeout(updatePosition, 200)

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, { passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [step, isActive, mounted, showDetails, isMobile])

  // Don't render on server or if not visible
  if (!mounted || !isActive || !position) return null

  const progress = ((stepNumber + 1) / totalSteps) * 100
  const hasExtendedContent = step.features && step.features.length > 0
  const isOnExpectedRoute = step.navigateTo ? pathname === step.navigateTo.split('?')[0] : true

  // Mobile bottom sheet variant
  if (isMobile) {
    return createPortal(
      <AnimatePresence>
        {isActive && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[9999]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Drag indicator */}
            <div className="flex justify-center pt-3 pb-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-t-2xl border-t border-x border-border">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Content */}
            <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-x border-border px-4 pb-4">
              {/* Header */}
              <div className={`${colors.bg} ${colors.border} border-b -mx-4 px-4 py-3 mb-4`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${colors.text} uppercase tracking-wider`}>
                    Step {stepNumber + 1} of {totalSteps}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${colors.text} hover:bg-black/5 dark:hover:bg-white/5`}
                    onClick={closeTour}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {/* Gradient progress bar */}
                <div className="h-1.5 mt-3 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
                  />
                </div>
              </div>

              {/* Title and Content */}
              <h3 className="font-semibold text-foreground text-xl mb-2 flex items-center gap-2">
                <ChevronRight className={`h-5 w-5 ${colors.text} flex-shrink-0`} />
                {step.title}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pl-7">
                {step.content}
              </p>

              {targetMissing && (
                <div className="mt-3 ml-7 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20">
                  <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                    <strong>Note:</strong> {isOnExpectedRoute
                      ? 'This feature is unavailable in your current context. You can continue to the next step.'
                      : 'Taking you to the right section for this step.'}
                  </p>
                </div>
              )}

              {/* Features (if any) */}
              {hasExtendedContent && (
                <div className="mt-3 pl-7">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className={`text-sm ${colors.text} hover:opacity-80 flex items-center gap-1 font-medium transition-colors`}
                  >
                    {showDetails ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Hide details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show key features
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {step.features && step.features.length > 0 && (
                          <ul className="mt-3 space-y-2">
                            {step.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 mt-6">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={skipTour}
                  className="text-muted-foreground hover:text-foreground h-12"
                >
                  Skip
                </Button>

                <div className="flex gap-2">
                  {stepNumber > 0 && (
                    <Button variant="outline" size="lg" onClick={prevStep} className="h-12">
                      <ArrowLeft className="h-5 w-5 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button
                    size="lg"
                    onClick={nextStep}
                    className={`bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white h-12 px-6`}
                  >
                    {stepNumber === totalSteps - 1 ? 'Done' : 'Next'}
                    {stepNumber < totalSteps - 1 && <ArrowRight className="h-5 w-5 ml-1" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )
  }

  // Desktop floating tooltip
  const tooltip = (
    <AnimatePresence>
      {isActive && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed z-[9999] w-[400px]"
          style={{
            top: position.top,
            left: position.left,
            pointerEvents: 'auto'
          }}
        >
          {/* SVG Arrow pointing to target */}
          <TooltipArrow side={position.arrowSide} />

          {/* Glass Morphism Tooltip Card */}
          <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/5 overflow-hidden">
            {/* Header with persona-specific coloring */}
            <div className={`${colors.bg} ${colors.border} border-b px-5 py-4`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${colors.text} uppercase tracking-wider`}>
                  Step {stepNumber + 1} of {totalSteps}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-7 w-7 ${colors.text} hover:bg-black/5 dark:hover:bg-white/5 -mr-1`}
                  onClick={skipTour}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {/* Gradient animated progress bar */}
              <div className="h-1.5 mt-3 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-semibold text-foreground text-xl mb-2 flex items-center gap-2">
                <ChevronRight className={`h-5 w-5 ${colors.text} flex-shrink-0`} />
                {step.title}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed pl-7">
                {step.content}
              </p>

              {targetMissing && (
                <div className="mt-3 ml-7 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20">
                  <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                    <strong>Note:</strong> {isOnExpectedRoute
                      ? 'This feature is unavailable in your current context. You can continue to the next step.'
                      : 'Taking you to the right section for this step.'}
                  </p>
                </div>
              )}

              {/* Expandable detailed content and features */}
              {hasExtendedContent && (
                <div className="mt-3 pl-7">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className={`text-sm ${colors.text} hover:opacity-80 flex items-center gap-1 font-medium transition-colors`}
                  >
                    {showDetails ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Hide details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show key features
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {/* Features list */}
                        {step.features && step.features.length > 0 && (
                          <ul className="mt-3 space-y-2">
                            {step.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Empty state hint if applicable */}
                        {step.emptyStateContent && (
                          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-200 dark:border-amber-500/20">
                            <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
                              <strong>Tip:</strong> {step.emptyStateContent}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Actions & Keyboard hints */}
            <div className="px-5 pb-4">
              {/* Keyboard hints */}
              <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground/70">
                <Keyboard className="h-3.5 w-3.5" />
                <span className="font-mono">[Esc]</span> close
                <span className="font-mono">[{'\u2190'}] [{'\u2192'}]</span> navigate
              </div>

              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTour}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Skip tour
                </Button>

                <div className="flex gap-2">
                  {stepNumber > 0 && (
                    <Button variant="outline" size="sm" onClick={prevStep}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={nextStep}
                    className={`bg-gradient-to-r ${colors.gradient} hover:opacity-90 text-white`}
                  >
                    {stepNumber === totalSteps - 1 ? 'Finish tour' : 'Continue'}
                    {stepNumber < totalSteps - 1 && <ArrowRight className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(tooltip, document.body)
}
