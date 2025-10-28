'use client'

import { useState } from 'react'
import { CommandPalette } from '@/components/command-palette/command-palette'
import { QuickAddSubscriptionModal } from '@/components/subscriptions/quick-add-subscription-modal'
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcuts'

interface GlobalKeyboardShortcutsProps {
  brand: 'versoholdings' | 'versotech'
  role: string
}

export function GlobalKeyboardShortcuts({ brand, role }: GlobalKeyboardShortcutsProps) {
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  // Only show keyboard shortcuts for staff users
  const isStaff = ['staff_admin', 'staff_ops', 'staff_rm'].includes(role)

  // Cmd/Ctrl+Shift+S to open Quick Add Subscription
  useKeyboardShortcut(
    's',
    () => setQuickAddOpen(true),
    {
      meta: true, // Allows both Cmd and Ctrl
      shift: true,
      enabled: isStaff && brand === 'versotech'
    }
  )

  // Only render staff features for staff users
  if (!isStaff || brand !== 'versotech') {
    return (
      <CommandPalette
        brand={brand}
      />
    )
  }

  return (
    <>
      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        brand={brand}
        onQuickAddSubscription={() => setQuickAddOpen(true)}
      />

      {/* Quick Add Subscription Modal (Cmd+Shift+S) */}
      <QuickAddSubscriptionModal
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
      />
    </>
  )
}
