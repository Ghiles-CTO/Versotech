'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save, Bell } from 'lucide-react'
import { toast } from 'sonner'

interface PreferencesEditorProps {
  onUpdate?: () => void
}

export function PreferencesEditor({ onUpdate }: PreferencesEditorProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [preferences, setPreferences] = useState({
    notification_settings: {
      email_notifications: true,
      deal_updates: true,
      message_notifications: true
    }
  })

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
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
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-white" />
            <CardTitle className="text-white">Notification Preferences</CardTitle>
          </div>
          <CardDescription className="text-white/60">
            Manage how you receive notifications and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_notifications" className="text-white">Email Notifications</Label>
              <p className="text-sm text-white/60">
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
              <Label htmlFor="deal_updates" className="text-white">Deal Updates</Label>
              <p className="text-sm text-white/60">
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
              <Label htmlFor="message_notifications" className="text-white">Message Notifications</Label>
              <p className="text-sm text-white/60">
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
