'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { Loader2, Save, Bell, ShieldCheck, Mail, Phone, MessageSquare, Download, Trash2, Shield, PlayCircle } from 'lucide-react'
import { useTourOptional } from '@/contexts/tour-context'
import type { LucideIcon } from 'lucide-react'
import { toast } from 'sonner'

interface PreferencesEditorProps {
  onUpdate?: () => void
  variant?: 'investor' | 'staff' | 'arranger'
}

export function PreferencesEditor({ onUpdate, variant = 'investor' }: PreferencesEditorProps) {
  const tourContext = useTourOptional()
  const isStaff = variant === 'staff'
  const isArranger = variant === 'arranger'
  const [isLoading, setIsLoading] = useState(!isStaff && !isArranger)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // GDPR state
  const [isExporting, setIsExporting] = useState(false)
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false)
  const [deletionReason, setDeletionReason] = useState('')
  const [deletionConfirmed, setDeletionConfirmed] = useState(false)
  const [hasPendingDeletion, setHasPendingDeletion] = useState(false)

  const [preferences, setPreferences] = useState({
    notification_settings: {
      email_notifications: true,
      deal_updates: true,
      message_notifications: true
    }
  })

  const loadPreferences = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/dashboard-preferences')
      const data = await response.json()

      if (response.ok && data.preferences) {
        setPreferences({
          notification_settings: data.preferences.notification_settings || preferences.notification_settings
        })
      }
    } catch (error: any) {
      console.error('Error loading preferences:', error)
      toast.error('Failed to load preferences')
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Check for pending deletion requests
  const checkPendingDeletion = useCallback(async () => {
    try {
      const response = await fetch('/api/gdpr/deletion-request')
      const data = await response.json()
      if (response.ok && data.has_pending) {
        setHasPendingDeletion(true)
      }
    } catch (error) {
      console.error('Error checking pending deletion:', error)
    }
  }, [])

  useEffect(() => {
    if (isStaff || isArranger) {
      setIsLoading(false)
      return
    }
    loadPreferences()
    checkPendingDeletion()
  }, [isStaff, isArranger, loadPreferences, checkPendingDeletion])

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

  const handleNotificationChange = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notification_settings: {
        ...prev.notification_settings,
        [key]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/dashboard-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update preferences')
      }

      toast.success('Preferences updated successfully')
      onUpdate?.()
    } catch (error: any) {
      console.error('Error updating preferences:', error)
      toast.error('Failed to update preferences', {
        description: error.message
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Arranger-specific notifications
  if (isArranger) {
    const arrangerChannels: {
      label: string
      description: string
      icon: LucideIcon
      configurable: boolean
    }[] = [
      {
        label: 'Mandate Updates',
        description: 'Notifications about new mandates, status changes, and investor activity on your deals.',
        icon: Mail,
        configurable: true
      },
      {
        label: 'Subscription Packs',
        description: 'Alerts when subscription packs require your signature or have status updates.',
        icon: MessageSquare,
        configurable: true
      },
      {
        label: 'Payment Requests',
        description: 'Notifications about fee events, invoice submissions, and payment confirmations.',
        icon: Bell,
        configurable: true
      },
      {
        label: 'Compliance Alerts',
        description: 'License expiry reminders, KYC renewal notices, and regulatory updates.',
        icon: ShieldCheck,
        configurable: false
      }
    ]

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>
              Manage how you receive updates about your mandates and business activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {arrangerChannels.map(channel => (
              <div
                key={channel.label}
                className="flex items-start justify-between gap-4 rounded-lg border p-4"
              >
                <div className="flex items-start gap-3">
                  <channel.icon className="mt-1 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold">{channel.label}</p>
                    <p className="text-sm text-muted-foreground">{channel.description}</p>
                  </div>
                </div>
                {channel.configurable ? (
                  <Switch defaultChecked />
                ) : (
                  <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">
                    Always on
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="py-4">
            <div className="flex gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Compliance Notifications</p>
                <p className="text-blue-700 mt-1">
                  Some notifications cannot be disabled as they are required for regulatory compliance.
                  These include license expiry warnings and mandatory KYC renewal reminders.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Tour Section for Arranger */}
        {tourContext && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                <CardTitle>Platform Tour</CardTitle>
              </div>
              <CardDescription>
                Take a guided tour of the platform features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Restart Platform Tour</Label>
                  <p className="text-sm text-muted-foreground">
                    Walk through the platform features again with an interactive guide
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => tourContext.startTour()}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Tour
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  if (isStaff) {
    const staffChannels: {
      label: string
      description: string
      icon: LucideIcon
    }[] = [
      {
        label: 'Email Alerts',
        description: 'Critical incidents, investor escalations, and compliance reminders are always routed to your inbox.',
        icon: Mail
      },
      {
        label: 'In-App Notifications',
        description: 'Task reminders, approvals, and operational updates show up in the notification center automatically.',
        icon: MessageSquare
      },
      {
        label: 'SMS Escalations',
        description: 'After-hours or high-priority issues trigger backup SMS alerts for the on-call operations lead.',
        icon: Phone
      }
    ]

    return (
      <div className="space-y-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-white">Notifications are centrally managed</CardTitle>
            </div>
            <CardDescription className="text-white/70">
              Staff alerts follow an operations-wide policy so nothing critical can be turned off accidentally.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {staffChannels.map(channel => (
              <div key={channel.label} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <channel.icon className="mt-1 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-white">{channel.label}</p>
                  <p className="text-sm text-white/70">{channel.description}</p>
                  <p className="text-xs text-emerald-300/90 mt-1">Status: Always on</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Need to adjust routing?</CardTitle>
            <CardDescription className="text-white/70">
              Changes go through the Platform team so audit trails stay intact.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-white/70">
              Share the context (investor, deal, urgency) and the team will update the notification matrix or escalate to engineering.
            </p>
            <Button
              asChild
              className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
            >
              <a href="mailto:admin@versotech.com?subject=Notification%20routing%20update">
                Contact Platform Team
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Platform Tour Section for Staff */}
        {tourContext && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-white">Platform Tour</CardTitle>
              </div>
              <CardDescription className="text-white/70">
                Take a guided tour of the platform features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Restart Platform Tour</Label>
                  <p className="text-sm text-white/70">
                    Walk through the platform features again with an interactive guide
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => tourContext.startTour()}
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start Tour
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* GDPR Data & Privacy Section for Staff */}
        <Card className="bg-white/5 border-amber-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-400" />
              <CardTitle className="text-white">Data & Privacy</CardTitle>
            </div>
            <CardDescription className="text-white/70">
              Manage your personal data in accordance with GDPR regulations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Export Data */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Export Your Data</Label>
                <p className="text-sm text-white/70">
                  Download a copy of all your personal data stored in our system
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
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
                    Export My Data
                  </>
                )}
              </Button>
            </div>

            <div className="border-t border-white/10 pt-6">
              {/* Request Account Deletion */}
              <div className="space-y-4">
                <div className="space-y-0.5">
                  <Label className="text-red-400">Request Account Deletion</Label>
                  <p className="text-sm text-white/70">
                    Request permanent deletion of your account and all associated data.
                    This action is irreversible and will be reviewed by our team.
                  </p>
                </div>

                {hasPendingDeletion ? (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                    <p className="text-sm text-amber-300">
                      You have a pending deletion request. Our team will review it within 30 days.
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
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Request Account Deletion</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                          <div className="space-y-4">
                            <p>
                              This will submit a request to permanently delete your account
                              and all associated data. This action cannot be undone.
                            </p>

                            <div className="space-y-2">
                              <Label htmlFor="staff-deletion-reason">
                                Please tell us why you want to delete your account:
                              </Label>
                              <Textarea
                                id="staff-deletion-reason"
                                placeholder="Enter your reason (minimum 10 characters)"
                                value={deletionReason}
                                onChange={(e) => setDeletionReason(e.target.value)}
                                className="min-h-[100px]"
                              />
                            </div>

                            <div className="flex items-start space-x-2">
                              <Checkbox
                                id="staff-deletion-confirm"
                                checked={deletionConfirmed}
                                onCheckedChange={(checked) => setDeletionConfirmed(checked === true)}
                              />
                              <label
                                htmlFor="staff-deletion-confirm"
                                className="text-sm text-muted-foreground leading-tight"
                              >
                                I understand that this will permanently delete my account,
                                all my data, and I will lose access to the platform.
                              </label>
                            </div>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <CardDescription>
            Manage how you receive notifications and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_notifications">Email Notifications</Label>
              <p className="text-sm text-gray-600">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email_notifications"
              checked={preferences.notification_settings.email_notifications}
              onCheckedChange={(checked) =>
                handleNotificationChange('email_notifications', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="deal_updates">Deal Updates</Label>
              <p className="text-sm text-gray-600">
                Get notified about deal status changes
              </p>
            </div>
            <Switch
              id="deal_updates"
              checked={preferences.notification_settings.deal_updates}
              onCheckedChange={(checked) =>
                handleNotificationChange('deal_updates', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="message_notifications">Message Notifications</Label>
              <p className="text-sm text-gray-600">
                Get notified about new messages
              </p>
            </div>
            <Switch
              id="message_notifications"
              checked={preferences.notification_settings.message_notifications}
              onCheckedChange={(checked) =>
                handleNotificationChange('message_notifications', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Platform Tour Section */}
      {tourContext && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              <CardTitle>Platform Tour</CardTitle>
            </div>
            <CardDescription>
              Take a guided tour of the platform features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Restart Platform Tour</Label>
                <p className="text-sm text-muted-foreground">
                  Walk through the platform features again with an interactive guide
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => tourContext.startTour()}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Tour
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Preferences...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </div>

      {/* GDPR Data & Privacy Section */}
      <Card className="border-amber-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            <CardTitle>Data & Privacy</CardTitle>
          </div>
          <CardDescription>
            Manage your personal data in accordance with GDPR regulations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Data */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Export Your Data</Label>
              <p className="text-sm text-muted-foreground">
                Download a copy of all your personal data stored in our system
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
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
                  Export My Data
                </>
              )}
            </Button>
          </div>

          <div className="border-t pt-6">
            {/* Request Account Deletion */}
            <div className="space-y-4">
              <div className="space-y-0.5">
                <Label className="text-destructive">Request Account Deletion</Label>
                <p className="text-sm text-muted-foreground">
                  Request permanent deletion of your account and all associated data.
                  This action is irreversible and will be reviewed by our team.
                </p>
              </div>

              {hasPendingDeletion ? (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">
                    You have a pending deletion request. Our team will review it within 30 days.
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
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Request Account Deletion</AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div className="space-y-4">
                          <p>
                            This will submit a request to permanently delete your account
                            and all associated data. This action cannot be undone.
                          </p>

                          <div className="space-y-2">
                            <Label htmlFor="deletion-reason">
                              Please tell us why you want to delete your account:
                            </Label>
                            <Textarea
                              id="deletion-reason"
                              placeholder="Enter your reason (minimum 10 characters)"
                              value={deletionReason}
                              onChange={(e) => setDeletionReason(e.target.value)}
                              className="min-h-[100px]"
                            />
                          </div>

                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="deletion-confirm"
                              checked={deletionConfirmed}
                              onCheckedChange={(checked) => setDeletionConfirmed(checked === true)}
                            />
                            <label
                              htmlFor="deletion-confirm"
                              className="text-sm text-muted-foreground leading-tight"
                            >
                              I understand that this will permanently delete my account,
                              all my data, and I will lose access to all investments and documents.
                            </label>
                          </div>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleRequestDeletion}
                        disabled={isRequestingDeletion || !deletionReason || deletionReason.length < 10 || !deletionConfirmed}
                        className="bg-destructive hover:bg-destructive/90"
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
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
