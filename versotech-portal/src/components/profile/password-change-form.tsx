'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Lock, Eye, EyeOff, Check, X } from 'lucide-react'
import { toast } from 'sonner'

export function PasswordChangeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    return checks
  }

  const passwordChecks = validatePassword(formData.newPassword)
  const isPasswordValid = Object.values(passwordChecks).every(check => check)
  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.confirmPassword !== ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPasswordValid) {
      toast.error('Password does not meet requirements')
      return
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password')
      }

      toast.success('Password updated successfully')

      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      console.error('Error updating password:', error)
      toast.error('Failed to update password', {
        description: error.message
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-white/40" />
      )}
      <span className={met ? 'text-green-400' : 'text-white/60'}>
        {text}
      </span>
    </div>
  )

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Change Password</CardTitle>
        <CardDescription className="text-white/60">
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-white">
              Current Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleChange}
                required
                placeholder="Enter your current password"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-white">
              New Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleChange}
                required
                placeholder="Enter your new password"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {formData.newPassword && (
              <div className="mt-3 space-y-1 p-3 bg-white/5 rounded-md border border-white/10">
                <p className="text-sm font-medium mb-2 text-white">Password Requirements:</p>
                <PasswordRequirement met={passwordChecks.length} text="At least 8 characters" />
                <PasswordRequirement met={passwordChecks.uppercase} text="One uppercase letter" />
                <PasswordRequirement met={passwordChecks.lowercase} text="One lowercase letter" />
                <PasswordRequirement met={passwordChecks.number} text="One number" />
                <PasswordRequirement met={passwordChecks.special} text="One special character" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">
              Confirm New Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your new password"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {formData.confirmPassword && (
              <div className="flex items-center gap-2 text-sm">
                {passwordsMatch ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-green-400">Passwords match</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-destructive" />
                    <span className="text-destructive">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.currentPassword ||
                !isPasswordValid ||
                !passwordsMatch
              }
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
