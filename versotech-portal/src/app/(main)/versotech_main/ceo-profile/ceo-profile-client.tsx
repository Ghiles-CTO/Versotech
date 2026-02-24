'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Shield,
  Edit,
  Loader2,
  PenTool,
  Save,
  X,
  Camera,
  Users,
  UserPlus,
  MoreHorizontal,
  Trash2,
  Crown,
  User,
} from 'lucide-react'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { getCountryName } from '@/components/kyc/country-select'
import { toast } from 'sonner'
import Image from 'next/image'
import { PasswordChangeForm } from '@/components/profile/password-change-form'

/**
 * CEO Entity info (Verso Capital)
 */
interface CeoEntity {
  id: string
  legalName: string
  displayName: string | null
  registrationNumber: string | null
  taxId: string | null
  registeredAddress: string | null
  city: string | null
  postalCode: string | null
  country: string | null
  email: string | null
  phone: string | null
  website: string | null
  logoUrl: string | null
  status: string
}

/**
 * CEO member (user with CEO access)
 */
interface CeoMember {
  userId: string
  email: string
  displayName: string
  avatarUrl: string | null
  role: string
  canSign: boolean
  isPrimary: boolean
  title: string | null
  createdAt: string
}

/**
 * Current user profile
 */
interface UserProfile {
  displayName: string | null
  email: string
  avatarUrl: string | null
}

interface CeoProfileClientProps {
  userId: string
  userEmail: string
  userRole: string
  canManageMembers: boolean
  profile: UserProfile | null
  ceoEntity: CeoEntity
  ceoMembers: CeoMember[]
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700',
  suspended: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrator', description: 'Full access to CEO functions' },
  { value: 'member', label: 'Member', description: 'Standard CEO access' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
]

/**
 * Editable field component for forms
 */
function EditableField({
  label,
  value,
  field,
  isEditing,
  editValue,
  onChange,
  type = 'text',
  multiline = false,
  icon: Icon,
  className,
}: {
  label: string
  value: string | null
  field: string
  isEditing: boolean
  editValue: string
  onChange: (field: string, value: string) => void
  type?: 'text' | 'email' | 'tel' | 'url'
  multiline?: boolean
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}) {
  if (isEditing) {
    return (
      <div className={cn("space-y-1.5", className)}>
        <Label htmlFor={field} className="text-sm font-medium text-muted-foreground">
          {label}
        </Label>
        {multiline ? (
          <Textarea
            id={field}
            value={editValue}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
            rows={3}
            className="mt-1"
          />
        ) : type === 'tel' ? (
          <PhoneInput
            value={editValue}
            onChange={(val) => onChange(field, val || '')}
            className="mt-1"
          />
        ) : (
          <Input
            id={field}
            type={type}
            value={editValue}
            onChange={(e) => onChange(field, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
            className="mt-1"
          />
        )}
      </div>
    )
  }

  return (
    <div className={cn("flex items-start gap-3", className)}>
      {Icon && <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />}
      <div className="min-w-0">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <p className={cn(
          "text-foreground mt-1",
          field.includes('number') || field.includes('id') ? 'font-mono' : '',
          multiline && 'whitespace-pre-line'
        )}>
          {value || <span className="text-muted-foreground italic">Not set</span>}
        </p>
      </div>
    </div>
  )
}

export function CeoProfileClient({
  userId,
  userEmail,
  userRole,
  canManageMembers,
  profile,
  ceoEntity: initialCeoEntity,
  ceoMembers: initialCeoMembers,
}: CeoProfileClientProps) {
  // State for CEO entity
  const [ceoEntity, setCeoEntity] = useState(initialCeoEntity)
  const [ceoMembers, setCeoMembers] = useState(initialCeoMembers)

  // Edit mode states
  const [isEditingEntity, setIsEditingEntity] = useState(false)
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Invite dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviteTitle, setInviteTitle] = useState('')
  const [inviteCanSign, setInviteCanSign] = useState(false)
  const [isSendingInvite, setIsSendingInvite] = useState(false)

  // Edit member dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<CeoMember | null>(null)
  const [editRole, setEditRole] = useState('member')
  const [editTitle, setEditTitle] = useState('')
  const [editCanSign, setEditCanSign] = useState(false)
  const [isUpdatingMember, setIsUpdatingMember] = useState(false)

  // Edit form data
  const [entityForm, setEntityForm] = useState({
    legal_name: ceoEntity.legalName || '',
    display_name: ceoEntity.displayName || '',
    registration_number: ceoEntity.registrationNumber || '',
    tax_id: ceoEntity.taxId || '',
    country: ceoEntity.country || '',
  })

  const [contactForm, setContactForm] = useState({
    email: ceoEntity.email || '',
    phone: ceoEntity.phone || '',
    website: ceoEntity.website || '',
    registered_address: ceoEntity.registeredAddress || '',
    city: ceoEntity.city || '',
    postal_code: ceoEntity.postalCode || '',
  })

  // Personal profile state
  const [userProfile, setUserProfile] = useState(profile)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    display_name: profile?.displayName || '',
    phone: '', // Will be loaded separately if needed
  })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Current user info
  const currentMember = ceoMembers.find(m => m.userId === userId)

  // Save handlers
  const handleSaveEntity = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/ceo/update-entity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entityForm),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      setCeoEntity(prev => ({
        ...prev,
        legalName: entityForm.legal_name,
        displayName: entityForm.display_name,
        registrationNumber: entityForm.registration_number,
        taxId: entityForm.tax_id,
        country: entityForm.country,
      }))
      setIsEditingEntity(false)
      toast.success('Entity details updated successfully')
    } catch (error: any) {
      console.error('Error saving entity:', error)
      toast.error(error.message || 'Failed to save entity details')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveContact = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/ceo/update-entity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      setCeoEntity(prev => ({
        ...prev,
        email: contactForm.email,
        phone: contactForm.phone,
        website: contactForm.website,
        registeredAddress: contactForm.registered_address,
        city: contactForm.city,
        postalCode: contactForm.postal_code,
      }))
      setIsEditingContact(false)
      toast.success('Contact information updated successfully')
    } catch (error: any) {
      console.error('Error saving contact:', error)
      toast.error(error.message || 'Failed to save contact information')
    } finally {
      setIsSaving(false)
    }
  }

  // Cancel handlers
  const handleCancelEntity = () => {
    setEntityForm({
      legal_name: ceoEntity.legalName || '',
      display_name: ceoEntity.displayName || '',
      registration_number: ceoEntity.registrationNumber || '',
      tax_id: ceoEntity.taxId || '',
      country: ceoEntity.country || '',
    })
    setIsEditingEntity(false)
  }

  const handleCancelContact = () => {
    setContactForm({
      email: ceoEntity.email || '',
      phone: ceoEntity.phone || '',
      website: ceoEntity.website || '',
      registered_address: ceoEntity.registeredAddress || '',
      city: ceoEntity.city || '',
      postal_code: ceoEntity.postalCode || '',
    })
    setIsEditingContact(false)
  }

  // Personal profile handlers
  const handleSaveProfile = async () => {
    setIsSavingProfile(true)
    try {
      const response = await fetch(`/api/profiles/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: profileForm.display_name,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save')
      }

      setUserProfile(prev => prev ? {
        ...prev,
        displayName: profileForm.display_name,
      } : prev)
      setIsEditingProfile(false)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast.error(error.message || 'Failed to save profile')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleCancelProfile = () => {
    setProfileForm({
      display_name: userProfile?.displayName || '',
      phone: '',
    })
    setIsEditingProfile(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 2MB to match API)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/profiles/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload')
      }

      const data = await response.json()
      setUserProfile(prev => prev ? {
        ...prev,
        avatarUrl: data.avatar_url,
      } : prev)
      toast.success('Avatar updated successfully')
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      toast.error(error.message || 'Failed to upload avatar')
    } finally {
      setIsUploadingAvatar(false)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''
      }
    }
  }

  // Logo upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a PNG, JPEG, or WebP image')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB')
      return
    }

    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch('/api/ceo/upload-logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload logo')
      }

      const data = await response.json()
      setCeoEntity(prev => ({ ...prev, logoUrl: data.logo_url }))
      toast.success('Logo uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading logo:', error)
      toast.error(error.message || 'Failed to upload logo')
    } finally {
      setIsUploadingLogo(false)
      if (logoInputRef.current) {
        logoInputRef.current.value = ''
      }
    }
  }

  // Invite member handler
  const handleInviteMember = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address')
      return
    }

    setIsSendingInvite(true)
    try {
      const response = await fetch('/api/ceo/invite-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          title: inviteTitle || null,
          can_sign: inviteCanSign,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      toast.success(`Invitation sent to ${inviteEmail}`)
      setInviteDialogOpen(false)
      setInviteEmail('')
      setInviteRole('member')
      setInviteTitle('')
      setInviteCanSign(false)

      // Refresh members list if user was added directly (existing user)
      if (data.added_directly) {
        window.location.reload()
      }
    } catch (error: any) {
      console.error('Error inviting member:', error)
      toast.error(error.message || 'Failed to send invitation')
    } finally {
      setIsSendingInvite(false)
    }
  }

  // Remove member handler
  const handleRemoveMember = async (memberUserId: string) => {
    if (memberUserId === userId) {
      toast.error("You can't remove yourself")
      return
    }

    const member = ceoMembers.find(m => m.userId === memberUserId)
    if (member?.isPrimary) {
      toast.error("Can't remove the primary CEO member")
      return
    }

    try {
      const response = await fetch('/api/ceo/remove-member', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: memberUserId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove member')
      }

      setCeoMembers(prev => prev.filter(m => m.userId !== memberUserId))
      toast.success('Member removed successfully')
    } catch (error: any) {
      console.error('Error removing member:', error)
      toast.error(error.message || 'Failed to remove member')
    }
  }

  // Open edit dialog for a member
  const handleOpenEditDialog = (member: CeoMember) => {
    setEditingMember(member)
    setEditRole(member.role)
    setEditTitle(member.title || '')
    setEditCanSign(member.canSign)
    setEditDialogOpen(true)
  }

  // Update member handler
  const handleUpdateMember = async () => {
    if (!editingMember) return

    setIsUpdatingMember(true)
    try {
      const response = await fetch('/api/ceo/update-member', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: editingMember.userId,
          role: editRole,
          title: editTitle || null,
          can_sign: editCanSign,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update member')
      }

      // Update local state
      setCeoMembers(prev => prev.map(m =>
        m.userId === editingMember.userId
          ? { ...m, role: editRole, title: editTitle || null, canSign: editCanSign }
          : m
      ))

      toast.success('Member updated successfully')
      setEditDialogOpen(false)
      setEditingMember(null)
    } catch (error: any) {
      console.error('Error updating member:', error)
      toast.error(error.message || 'Failed to update member')
    } finally {
      setIsUpdatingMember(false)
    }
  }

  // Quick toggle signatory status
  const handleToggleSignatory = async (member: CeoMember) => {
    try {
      const response = await fetch('/api/ceo/update-member', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: member.userId,
          can_sign: !member.canSign,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update signatory status')
      }

      // Update local state
      setCeoMembers(prev => prev.map(m =>
        m.userId === member.userId
          ? { ...m, canSign: !m.canSign }
          : m
      ))

      toast.success(member.canSign
        ? `${member.displayName} is no longer a signatory`
        : `${member.displayName} is now an authorized signatory`
      )
    } catch (error: any) {
      console.error('Error toggling signatory:', error)
      toast.error(error.message || 'Failed to update signatory status')
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with Logo Upload */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "relative h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden",
              canManageMembers && "cursor-pointer group"
            )}
            onClick={() => canManageMembers && logoInputRef.current?.click()}
          >
            {ceoEntity.logoUrl ? (
              <Image
                src={ceoEntity.logoUrl}
                alt={ceoEntity.legalName}
                fill
                className="object-cover"
              />
            ) : (
              <Building2 className="h-8 w-8 text-primary" />
            )}
            {canManageMembers && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploadingLogo ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
              </div>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleLogoUpload}
              disabled={isUploadingLogo || !canManageMembers}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {ceoEntity.displayName || ceoEntity.legalName}
            </h1>
            <p className="text-muted-foreground">
              {profile?.displayName || userEmail} - {currentMember?.title || userRole}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn('capitalize', STATUS_STYLES[ceoEntity.status] || STATUS_STYLES.inactive)}
        >
          {ceoEntity.status}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ceoMembers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active CEO users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Authorized Signers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ceoMembers.filter(m => m.canSign).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Can sign documents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Your Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold capitalize">{userRole}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMember?.canSign ? 'Authorized signer' : 'Not a signer'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Details Tabs */}
      <Tabs defaultValue="profile" className="space-y-4" id="ceo-profile-tabs">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 gap-1">
          <TabsTrigger value="profile" className="flex items-center gap-2 text-xs sm:text-sm">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">My Profile</span>
          </TabsTrigger>
          <TabsTrigger value="entity" className="flex items-center gap-2 text-xs sm:text-sm">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Company</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2 text-xs sm:text-sm">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2 text-xs sm:text-sm">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Members</span>
          </TabsTrigger>
        </TabsList>

        {/* My Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Profile</CardTitle>
                  <CardDescription>Your personal information and settings</CardDescription>
                </div>
                {!isEditingProfile ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelProfile} disabled={isSavingProfile}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile} disabled={isSavingProfile}>
                      {isSavingProfile ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {userProfile?.avatarUrl ? (
                      <Image
                        src={userProfile.avatarUrl}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {userProfile?.displayName || userEmail}
                  </h3>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {currentMember?.title || userRole}
                  </p>
                </div>
              </div>

              {/* Profile Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="profile-display-name">Display Name</Label>
                  {isEditingProfile ? (
                    <Input
                      id="profile-display-name"
                      value={profileForm.display_name}
                      onChange={(e) => setProfileForm(f => ({ ...f, display_name: e.target.value }))}
                      placeholder="Your display name"
                    />
                  ) : (
                    <p className="text-foreground py-2">
                      {userProfile?.displayName || <span className="text-muted-foreground italic">Not set</span>}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="text-foreground py-2">{userEmail}</p>
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <p className="text-foreground py-2 capitalize">{userRole}</p>
                </div>

                <div className="space-y-2">
                  <Label>Signing Authority</Label>
                  <p className="text-foreground py-2">
                    {currentMember?.canSign ? (
                      <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <PenTool className="h-4 w-4" />
                        Authorized Signatory
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not a signatory</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Change Section */}
          <div className="mt-6">
            <PasswordChangeForm />
          </div>
        </TabsContent>

        {/* Entity Details Tab - EDITABLE */}
        <TabsContent value="entity">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Verso Capital legal and registration details</CardDescription>
                </div>
                {canManageMembers && !isEditingEntity ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingEntity(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : isEditingEntity ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelEntity} disabled={isSaving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveEntity} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField
                  label="Legal Name"
                  value={ceoEntity.legalName}
                  field="legal_name"
                  isEditing={isEditingEntity}
                  editValue={entityForm.legal_name}
                  onChange={(_, v) => setEntityForm(f => ({ ...f, legal_name: v }))}
                />
                <EditableField
                  label="Display Name"
                  value={ceoEntity.displayName}
                  field="display_name"
                  isEditing={isEditingEntity}
                  editValue={entityForm.display_name}
                  onChange={(_, v) => setEntityForm(f => ({ ...f, display_name: v }))}
                />
                <EditableField
                  label="Registration Number"
                  value={ceoEntity.registrationNumber}
                  field="registration_number"
                  isEditing={isEditingEntity}
                  editValue={entityForm.registration_number}
                  onChange={(_, v) => setEntityForm(f => ({ ...f, registration_number: v }))}
                />
                <EditableField
                  label="Tax ID"
                  value={ceoEntity.taxId}
                  field="tax_id"
                  isEditing={isEditingEntity}
                  editValue={entityForm.tax_id}
                  onChange={(_, v) => setEntityForm(f => ({ ...f, tax_id: v }))}
                />
                <EditableField
                  label="Country"
                  value={getCountryName(ceoEntity.country)}
                  field="country"
                  isEditing={isEditingEntity}
                  editValue={entityForm.country}
                  onChange={(_, v) => setEntityForm(f => ({ ...f, country: v }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab - EDITABLE */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>How to reach Verso Capital</CardDescription>
                </div>
                {canManageMembers && !isEditingContact ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingContact(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                ) : isEditingContact ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelContact} disabled={isSaving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveContact} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField
                  label="Email"
                  value={ceoEntity.email}
                  field="email"
                  isEditing={isEditingContact}
                  editValue={contactForm.email}
                  onChange={(_, v) => setContactForm(f => ({ ...f, email: v }))}
                  type="email"
                  icon={isEditingContact ? undefined : Mail}
                />
                <EditableField
                  label="Phone"
                  value={ceoEntity.phone}
                  field="phone"
                  isEditing={isEditingContact}
                  editValue={contactForm.phone}
                  onChange={(_, v) => setContactForm(f => ({ ...f, phone: v }))}
                  type="tel"
                  icon={isEditingContact ? undefined : Phone}
                />
                <EditableField
                  label="Website"
                  value={ceoEntity.website}
                  field="website"
                  isEditing={isEditingContact}
                  editValue={contactForm.website}
                  onChange={(_, v) => setContactForm(f => ({ ...f, website: v }))}
                  type="url"
                  icon={isEditingContact ? undefined : Globe}
                />
                <EditableField
                  label="City"
                  value={ceoEntity.city}
                  field="city"
                  isEditing={isEditingContact}
                  editValue={contactForm.city}
                  onChange={(_, v) => setContactForm(f => ({ ...f, city: v }))}
                />
                <EditableField
                  label="Postal Code"
                  value={ceoEntity.postalCode}
                  field="postal_code"
                  isEditing={isEditingContact}
                  editValue={contactForm.postal_code}
                  onChange={(_, v) => setContactForm(f => ({ ...f, postal_code: v }))}
                />
                <EditableField
                  label="Registered Address"
                  value={ceoEntity.registeredAddress}
                  field="registered_address"
                  isEditing={isEditingContact}
                  editValue={contactForm.registered_address}
                  onChange={(_, v) => setContactForm(f => ({ ...f, registered_address: v }))}
                  multiline
                  icon={isEditingContact ? undefined : MapPin}
                  className="md:col-span-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Users with CEO access to Verso Capital</CardDescription>
                </div>
                {canManageMembers && (
                  <Button onClick={() => setInviteDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Joined</TableHead>
                    {canManageMembers && <TableHead className="w-10"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ceoMembers.map((member) => (
                    <TableRow key={member.userId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            {member.avatarUrl ? (
                              <Image
                                src={member.avatarUrl}
                                alt={member.displayName}
                                width={32}
                                height={32}
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                {member.displayName[0]?.toUpperCase() || '?'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {member.displayName}
                              {member.isPrimary && (
                                <Crown className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline" className="capitalize w-fit">
                            {member.role}
                          </Badge>
                          {member.title && (
                            <span className="text-xs text-muted-foreground">{member.title}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {member.isPrimary && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                          {member.canSign && (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/40 text-xs">
                              <PenTool className="w-3 h-3 mr-1" />
                              Signer
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(member.createdAt)}
                      </TableCell>
                      {canManageMembers && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenEditDialog(member)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Member
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleSignatory(member)}>
                                <PenTool className="h-4 w-4 mr-2" />
                                {member.canSign ? 'Remove Signatory' : 'Make Signatory'}
                              </DropdownMenuItem>
                              {!member.isPrimary && member.userId !== userId && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleRemoveMember(member.userId)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove Member
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite CEO Member</DialogTitle>
            <DialogDescription>
              Add a new member to the Verso Capital CEO team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@versocapital.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-title">Title (Optional)</Label>
              <Input
                id="invite-title"
                placeholder="e.g., COO, CFO, Managing Director"
                value={inviteTitle}
                onChange={(e) => setInviteTitle(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="can-sign"
                checked={inviteCanSign}
                onCheckedChange={(checked) => setInviteCanSign(checked === true)}
              />
              <Label htmlFor="can-sign" className="flex items-center gap-2 cursor-pointer">
                <PenTool className="h-4 w-4" />
                Authorized Signatory
                <span className="text-xs text-muted-foreground">(can sign documents for Verso Capital)</span>
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
              disabled={isSendingInvite}
            >
              Cancel
            </Button>
            <Button onClick={handleInviteMember} disabled={isSendingInvite || !inviteEmail}>
              {isSendingInvite ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
            <DialogDescription>
              Update {editingMember?.displayName}'s role and permissions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editRole}
                onValueChange={setEditRole}
                disabled={editingMember?.isPrimary}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editingMember?.isPrimary && (
                <p className="text-xs text-muted-foreground">Primary member must be an admin</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="e.g., CEO, COO, CFO, Managing Director"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="edit-can-sign"
                checked={editCanSign}
                onCheckedChange={(checked) => setEditCanSign(checked === true)}
              />
              <Label htmlFor="edit-can-sign" className="flex items-center gap-2 cursor-pointer">
                <PenTool className="h-4 w-4" />
                Authorized Signatory
                <span className="text-xs text-muted-foreground">(can sign documents for Verso Capital)</span>
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false)
                setEditingMember(null)
              }}
              disabled={isUpdatingMember}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateMember} disabled={isUpdatingMember}>
              {isUpdatingMember ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
