'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface TourSpotlightProps {
  targetSelector: string
  isVisible: boolean
  padding?: number
}

/**
 * Tour Spotlight Component - Premium Glass Morphism Edition
 *
 * Uses a 4-div overlay approach for crisp rectangular cutouts with
 * glass morphism effects and enhanced animations:
 *
 * ┌────────────────────────────────────────┐
 * │              TOP OVERLAY               │
 * │         (blur + 55% opacity)           │
 * ├────────┬──────────────────┬────────────┤
 * │  LEFT  │   TARGET AREA    │   RIGHT    │
 * │OVERLAY │ ┌──────────────┐ │  OVERLAY   │
 * │        │ │  Inner Glow  │ │            │
 * │        │ └──────────────┘ │            │
 * ├────────┴──────────────────┴────────────┤
 * │            BOTTOM OVERLAY              │
 * └────────────────────────────────────────┘
 *
 * Features:
 * - Glass morphism backdrop blur on overlays
 * - Animated glow ring with pulsing effect
 * - Inner highlight ring for depth
 * - Staggered entry animations
 */
export function TourSpotlight({ targetSelector, isVisible, padding = 8 }: TourSpotlightProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isVisible || !mounted) {
      setTargetRect(null)
      return
    }

    const updateRect = () => {
      const element = document.querySelector(targetSelector)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
        setTimeout(() => {
          setTargetRect(element.getBoundingClientRect())
        }, 100)
      }
    }

    const timeoutId = setTimeout(updateRect, 50)
    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, { passive: true })

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect)
    }
  }, [targetSelector, isVisible, mounted])

  if (!mounted || !isVisible || !targetRect) return null

  // Calculate cutout dimensions with padding
  const cutout = {
    top: targetRect.top - padding,
    left: targetRect.left - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
    right: targetRect.right + padding,
    bottom: targetRect.bottom + padding,
  }

  // Lighter overlay for better context visibility
  const overlayColor = 'rgba(0, 0, 0, 0.55)'
  const borderRadius = 12

  // Staggered animation delays for premium feel
  const staggerDelays = {
    top: 0,
    bottom: 0.05,
    left: 0.1,
    right: 0.15,
    ring: 0.2,
    innerRing: 0.25,
  }

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <>
          {/* TOP OVERLAY - Glass morphism with blur */}
          <motion.div
            key="spotlight-top"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, delay: staggerDelays.top, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: Math.max(0, cutout.top),
              background: overlayColor,
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 9997,
              pointerEvents: 'none',
            }}
          />

          {/* BOTTOM OVERLAY - Glass morphism with blur */}
          <motion.div
            key="spotlight-bottom"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4, delay: staggerDelays.bottom, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: cutout.bottom,
              left: 0,
              right: 0,
              bottom: 0,
              background: overlayColor,
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 9997,
              pointerEvents: 'none',
            }}
          />

          {/* LEFT OVERLAY - Glass morphism with blur */}
          <motion.div
            key="spotlight-left"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.4, delay: staggerDelays.left, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: cutout.top,
              left: 0,
              width: Math.max(0, cutout.left),
              height: cutout.height,
              background: overlayColor,
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 9997,
              pointerEvents: 'none',
            }}
          />

          {/* RIGHT OVERLAY - Glass morphism with blur */}
          <motion.div
            key="spotlight-right"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.4, delay: staggerDelays.right, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: cutout.top,
              left: cutout.right,
              right: 0,
              height: cutout.height,
              background: overlayColor,
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 9997,
              pointerEvents: 'none',
            }}
          />

          {/* Outer pulsing highlight ring with enhanced glow animation */}
          <motion.div
            key="spotlight-ring"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: [1, 1.04, 1],
              boxShadow: [
                '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.3)',
                '0 0 0 8px rgba(59, 130, 246, 0.2), 0 0 40px rgba(59, 130, 246, 0.5)',
                '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.3)',
              ]
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              opacity: { duration: 0.4, delay: staggerDelays.ring },
              scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
              boxShadow: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
            }}
            style={{
              position: 'fixed',
              top: cutout.top,
              left: cutout.left,
              width: cutout.width,
              height: cutout.height,
              borderRadius: borderRadius,
              border: '2px solid rgb(59, 130, 246)',
              zIndex: 9998,
              pointerEvents: 'auto',
            }}
          />

          {/* Inner glow ring for premium depth effect */}
          <motion.div
            key="spotlight-inner-ring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: staggerDelays.innerRing }}
            style={{
              position: 'fixed',
              top: cutout.top + 2,
              left: cutout.left + 2,
              width: cutout.width - 4,
              height: cutout.height - 4,
              borderRadius: borderRadius - 2,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.15)',
              zIndex: 9998,
              pointerEvents: 'none',
            }}
          />
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
