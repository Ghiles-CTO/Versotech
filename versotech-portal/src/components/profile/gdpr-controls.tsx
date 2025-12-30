'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Loader2,
  Download,
  Trash2,
  Shield,
  FileText,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface GDPRControlsProps {
  variant?: 'light' | 'dark'
  className?: string
}

/**
 * GDPR Controls Component
 * User Stories 2.7.1-2.7.7: Data export, deletion, restriction rights
 *
 * Reusable component for managing GDPR data rights across all profile types
 */
export function GDPRControls({ variant = 'light', className }: GDPRControlsProps) {
  const isDark = variant === 'dark'

  const [isExporting, setIsExporting] = useState(false)
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false)
  const [deletionReason, setDeletionReason] = useState('')
  const [deletionConfirmed, setDeletionConfirmed] = useState(false)
  const [hasPendingDeletion, setHasPendingDeletion] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check for pending deletion requests on mount
  const checkPendingDeletion = useCallback(async () => {
    try {
      const response = await fetch('/api/gdpr/deletion-request')
      const data = await response.json()
      if (response.ok && data.has_pending) {
        setHasPendingDeletion(true)
      }
    } catch (error) {
      console.error('Error checking pending deletion:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkPendingDeletion()
  }, [checkPendingDeletion])

  // GDPR: Export data handler
  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/gdpr/export', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Get the blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `verso-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()

      toast.success('Your data has been exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export your data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // GDPR: Request deletion handler
  const handleRequestDeletion = async () => {
    if (!deletionReason || deletionReason.length < 10) {
      toast.error('Please provide a reason (at least 10 characters)')
      return
    }
    if (!deletionConfirmed) {
      toast.error('Please confirm you understand the consequences')
      return
    }

    setIsRequestingDeletion(true)
    try {
      const response = await fetch('/api/gdpr/deletion-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: deletionReason,
          confirm_understood: deletionConfirmed
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request')
      }

      toast.success('Your deletion request has been submitted and will be reviewed within 30 days.')
      setHasPendingDeletion(true)
      setDeletionReason('')
      setDeletionConfirmed(false)
    } catch (error: any) {
      console.error('Deletion request error:', error)
      toast.error(error.message || 'Failed to submit deletion request')
    } finally {
      setIsRequestingDeletion(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Card */}
      <Card className={cn(
        isDark ? 'bg-white/5 border-white/10' : 'border-slate-200'
      )}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className={cn('h-5 w-5', isDark ? 'text-primary' : 'text-blue-600')} />
            <CardTitle className={isDark ? 'text-white' : ''}>Your Data Rights</CardTitle>
          </div>
          <CardDescription className={isDark ? 'text-white/70' : ''}>
            Under GDPR, you have rights to access, export, and request deletion of your personal data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn(
            'rounded-lg p-4',
            isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'
          )}>
            <div className="flex items-start gap-3">
              <FileText className={cn('h-5 w-5 flex-shrink-0 mt-0.5', isDark ? 'text-blue-400' : 'text-blue-600')} />
              <div className="text-sm">
                <p className={cn('font-medium', isDark ? 'text-blue-300' : 'text-blue-900')}>
                  About Your Privacy Rights
                </p>
                <p className={cn('mt-1', isDark ? 'text-blue-200/80' : 'text-blue-700')}>
                  As a VERSO user, you have the right to access your data, receive a portable copy,
                  request corrections, and request deletion. All requests are processed within 30 days.
                </p>
                <a
                  href="/privacy-policy"
                  target="_blank"
                  className={cn(
                    'inline-flex items-center gap-1 mt-2 text-sm font-medium',
                    isDark ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'
                  )}
                >
                  View Privacy Policy
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Data Card */}
      <Card className={cn(
        isDark ? 'bg-white/5 border-white/10' : ''
      )}>
        <CardHeader>
          <CardTitle className={cn('text-base', isDark ? 'text-white' : '')}>
            Export Your Data
          </CardTitle>
          <CardDescription className={isDark ? 'text-white/70' : ''}>
            Download a complete copy of all your personal data stored in our system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className={cn('text-sm', isDark ? 'text-white/60' : 'text-muted-foreground')}>
              Includes: Profile information, preferences, activity history, and documents metadata
            </div>
            <Button
              type="button"
              variant={isDark ? 'outline' : 'default'}
              className={cn(
                'shrink-0',
                isDark && 'border-white/20 text-white hover:bg-white/10'
              )}
              onClick={handleExportData}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download My Data
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Request Deletion Card */}
      <Card className={cn(
        isDark ? 'bg-white/5 border-red-500/30' : 'border-red-200'
      )}>
        <CardHeader>
          <CardTitle className={cn('text-base', isDark ? 'text-red-400' : 'text-red-600')}>
            Request Account Deletion
          </CardTitle>
          <CardDescription className={isDark ? 'text-white/70' : ''}>
            Permanently delete your account and all associated data. This action is irreversible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasPendingDeletion ? (
            <div className={cn(
              'rounded-lg border p-4',
              isDark ? 'border-amber-500/30 bg-amber-500/10' : 'border-amber-300 bg-amber-50'
            )}>
              <p className={cn('text-sm', isDark ? 'text-amber-300' : 'text-amber-800')}>
                You have a pending deletion request. Our team will review it within 30 days.
                You will receive an email notification once the review is complete.
              </p>
            </div>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Request Account Deletion
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className={isDark ? 'bg-zinc-900 border-white/10' : ''}>
                <AlertDialogHeader>
                  <AlertDialogTitle className={isDark ? 'text-white' : ''}>
                    Request Account Deletion
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-4">
                      <p className={isDark ? 'text-white/70' : ''}>
                        This will submit a request to permanently delete your account
                        and all associated data. This action cannot be undone.
                      </p>

                      <div className="space-y-2">
                        <Label
                          htmlFor="gdpr-deletion-reason"
                          className={isDark ? 'text-white' : ''}
                        >
                          Please tell us why you want to delete your account:
                        </Label>
                        <Textarea
                          id="gdpr-deletion-reason"
                          placeholder="Enter your reason (minimum 10 characters)"
                          value={deletionReason}
                          onChange={(e) => setDeletionReason(e.target.value)}
                          className={cn(
                            'min-h-[100px]',
                            isDark && 'bg-white/5 border-white/10 text-white placeholder:text-white/40'
                          )}
                        />
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="gdpr-deletion-confirm"
                          checked={deletionConfirmed}
                          onCheckedChange={(checked) => setDeletionConfirmed(checked === true)}
                        />
                        <label
                          htmlFor="gdpr-deletion-confirm"
                          className={cn(
                            'text-sm leading-tight',
                            isDark ? 'text-white/70' : 'text-muted-foreground'
                          )}
                        >
                          I understand that this will permanently delete my account,
                          all my data, and I will lose access to the platform and all
                          associated documents.
                        </label>
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className={isDark ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' : ''}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRequestDeletion}
                    disabled={isRequestingDeletion || !deletionReason || deletionReason.length < 10 || !deletionConfirmed}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isRequestingDeletion ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Deletion Request'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
