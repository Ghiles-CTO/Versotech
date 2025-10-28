'use client'

import { useState, useCallback } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

interface ConfirmationConfig {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function useConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<ConfirmationConfig | null>(null)
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null)

  const confirm = useCallback((cfg: ConfirmationConfig, onConfirm: () => void) => {
    setConfig(cfg)
    setOnConfirmCallback(() => onConfirm)
    setIsOpen(true)
  }, [])

  const handleConfirm = useCallback(() => {
    onConfirmCallback?.()
    setIsOpen(false)
  }, [onConfirmCallback])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
  }, [])

  const ConfirmationDialog = useCallback(() => {
    if (!config) return null

    return (
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="bg-zinc-950 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{config.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {config.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancel}
              className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
            >
              {config.cancelText || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                config.variant === 'destructive'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }
            >
              {config.confirmText || 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }, [config, isOpen, handleConfirm, handleCancel])

  return {
    confirm,
    ConfirmationDialog
  }
}
