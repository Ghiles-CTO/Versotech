'use client'

import { useEffect, useCallback } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  callback: (e: KeyboardEvent) => void
  description?: string
}

export function useKeyboardShortcut(
  key: string,
  callback: (e: KeyboardEvent) => void,
  options: {
    ctrl?: boolean
    meta?: boolean
    shift?: boolean
    alt?: boolean
    enabled?: boolean
  } = {}
) {
  const { ctrl = false, meta = false, shift = false, alt = false, enabled = true } = options

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.key || !key) return
      const isCorrectKey = e.key.toLowerCase() === key.toLowerCase()
      const isCorrectCtrl = ctrl ? e.ctrlKey : !e.ctrlKey
      const isCorrectMeta = meta ? e.metaKey : !e.metaKey
      const isCorrectShift = shift ? e.shiftKey : !e.shiftKey
      const isCorrectAlt = alt ? e.altKey : !e.altKey

      // Allow either Ctrl or Meta (Cmd on Mac) if ctrl or meta is specified
      const modifierMatch =
        (ctrl || meta)
          ? (e.ctrlKey || e.metaKey) && isCorrectShift && isCorrectAlt
          : isCorrectCtrl && isCorrectMeta && isCorrectShift && isCorrectAlt

      if (isCorrectKey && modifierMatch) {
        e.preventDefault()
        callback(e)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [key, ctrl, meta, shift, alt, enabled, callback])
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.key) return
      for (const shortcut of shortcuts) {
        if (!shortcut.key) continue
        const isCorrectKey = e.key.toLowerCase() === shortcut.key.toLowerCase()
        const isCorrectCtrl = shortcut.ctrlKey ? e.ctrlKey : !shortcut.ctrlKey
        const isCorrectMeta = shortcut.metaKey ? e.metaKey : !shortcut.metaKey
        const isCorrectShift = shortcut.shiftKey ? e.shiftKey : !shortcut.shiftKey
        const isCorrectAlt = shortcut.altKey ? e.altKey : !shortcut.altKey

        // Allow either Ctrl or Meta (Cmd on Mac) if either is specified
        const modifierMatch =
          (shortcut.ctrlKey || shortcut.metaKey)
            ? (e.ctrlKey || e.metaKey) && isCorrectShift && isCorrectAlt
            : isCorrectCtrl && isCorrectMeta && isCorrectShift && isCorrectAlt

        if (isCorrectKey && modifierMatch) {
          e.preventDefault()
          shortcut.callback(e)
          break // Only execute first matching shortcut
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, enabled])
}
