'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save, Bell, ShieldCheck, Mail, Phone, MessageSquare } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { toast } from 'sonner'

interface PreferencesEditorProps {
  onUpdate?: () => void
  variant?: 'investor' | 'staff'
}

export function PreferencesEditor({ onUpdate, variant = 'investor' }: PreferencesEditorProps) {
  const isStaff = variant === 'staff'
  const [isLoading, setIsLoading] = useState(!isStaff)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  useEffect(() => {
    if (isStaff) {
      setIsLoading(false)
      return
    }
    loadPreferences()
  }, [isStaff, loadPreferences])

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
    </form>
  )
}
