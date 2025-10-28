'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileFormProps {
  userId: string
  initialData: {
    display_name: string | null
    email: string | null
    title: string | null
    phone: string | null
    office_location: string | null
    bio: string | null
    role: string
  }
  onUpdate: (updatedData: any) => void
  showStaffFields?: boolean
}

export function ProfileForm({
  userId,
  initialData,
  onUpdate,
  showStaffFields = false
}: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    display_name: initialData.display_name || '',
    title: initialData.title || '',
    phone: initialData.phone || '',
    office_location: initialData.office_location || '',
    bio: initialData.bio || ''
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/profiles/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      toast.success('Profile updated successfully')
      onUpdate(data.profile)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile', {
        description: error.message
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasChanges = JSON.stringify(formData) !== JSON.stringify({
    display_name: initialData.display_name || '',
    title: initialData.title || '',
    phone: initialData.phone || '',
    office_location: initialData.office_location || '',
    bio: initialData.bio || ''
  })

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Profile Information</CardTitle>
        <CardDescription className="text-white/60">
          Update your personal information and profile details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name" className="text-white">
              Display Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="display_name"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              required
              placeholder="Enter your display name"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
            <p className="text-xs text-white/60">
              This is how your name will appear throughout the portal
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={initialData.email || ''}
              disabled
              className="bg-white/5 border-white/20 text-white/50"
            />
            <p className="text-xs text-white/60">
              Email cannot be changed here. Contact support to update your email.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Job Title / Position</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Portfolio Manager, Investment Director"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          {showStaffFields && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="office_location" className="text-white">Office Location</Label>
                <Input
                  id="office_location"
                  name="office_location"
                  value={formData.office_location}
                  onChange={handleChange}
                  placeholder="e.g., London Office, New York HQ"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white">Bio / About</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Brief description about yourself, your expertise, and role..."
                  rows={4}
                  className="resize-none bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
                <p className="text-xs text-white/60">
                  {formData.bio.length}/500 characters
                </p>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-white/10">
            <Button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>

            {hasChanges && !isSubmitting && (
              <p className="text-xs text-white/60 mt-2">
                You have unsaved changes
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
