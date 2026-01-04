'use client'

import React, { useState, useTransition } from 'react'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  Users,
  Briefcase,
  Scale,
  Handshake,
  Building2,
  ArrowLeft,
  UserPlus
} from 'lucide-react'
import { toast } from 'sonner'

// Entity type configuration
const ENTITY_TYPES = {
  investor: {
    label: 'Investor',
    description: 'Individual or institutional investor entity',
    icon: Users,
    apiPath: '/api/staff/investors',
    detailPath: '/versotech_main/investors',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  },
  introducer: {
    label: 'Introducer',
    description: 'Commission-based deal referral partner',
    icon: Briefcase,
    apiPath: '/api/staff/introducers',
    detailPath: '/versotech_main/introducers',
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  },
  lawyer: {
    label: 'Law Firm',
    description: 'Legal counsel for deals and documentation',
    icon: Scale,
    apiPath: '/api/admin/lawyers',
    detailPath: '/versotech_main/lawyers',
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  },
  partner: {
    label: 'Partner',
    description: 'Co-investment or syndicate partner',
    icon: Handshake,
    apiPath: '/api/admin/partners',
    detailPath: '/versotech_main/partners',
    color: 'bg-green-500/10 text-green-500 border-green-500/20'
  },
  commercial_partner: {
    label: 'Commercial Partner',
    description: 'Banks, custodians, and service providers',
    icon: Building2,
    apiPath: '/api/admin/commercial-partners',
    detailPath: '/versotech_main/commercial-partners',
    color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
  },
  arranger: {
    label: 'Arranger',
    description: 'Licensed deal arranger entity',
    icon: Building2,
    apiPath: '/api/admin/arrangers',
    detailPath: '/versotech_main/arrangers',
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
  },
} as const

type EntityType = keyof typeof ENTITY_TYPES

// Schemas for each entity type
const investorSchema = z.object({
  legal_name: z.string().min(1, 'Legal name is required'),
  display_name: z.string().optional(),
  type: z.enum(['individual', 'institutional', 'entity', 'family_office', 'fund']),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  country: z.string().optional(),
})

const introducerSchema = z.object({
  legal_name: z.string().min(1, 'Legal name is required'),
  contact_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  default_commission_bps: z.coerce.number().min(0).max(300).optional(),
  payment_terms: z.enum(['net_15', 'net_30', 'net_45', 'net_60']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  notes: z.string().optional(),
})

const lawyerSchema = z.object({
  firm_name: z.string().min(2, 'Firm name is required'),
  display_name: z.string().min(2, 'Display name is required'),
  primary_contact_name: z.string().optional(),
  primary_contact_email: z.string().email().optional().or(z.literal('')),
  primary_contact_phone: z.string().optional(),
  country: z.string().optional(),
})

const partnerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  legal_name: z.string().optional(),
  type: z.enum(['entity', 'individual', 'institutional']),
  partner_type: z.enum(['co_investor', 'syndicate', 'strategic', 'institutional', 'other']),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  country: z.string().optional(),
})

const commercialPartnerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  legal_name: z.string().optional(),
  type: z.enum(['entity', 'individual', 'institutional']),
  cp_type: z.enum(['placement_agent', 'distributor', 'wealth_manager', 'family_office', 'bank', 'other']),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  country: z.string().optional(),
})

const arrangerSchema = z.object({
  legal_name: z.string().min(1, 'Legal name is required'),
  registration_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  regulator: z.string().optional(),
  license_number: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
})

// User invite schema
const userInviteSchema = z.object({
  email: z.string().email('Valid email required'),
  display_name: z.string().min(2, 'Display name required'),
  title: z.string().optional(),
})

interface AddAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddAccountModal({
  open,
  onOpenChange,
  onSuccess,
}: AddAccountModalProps) {
  const [step, setStep] = useState<'type' | 'details'>('type')
  const [entityType, setEntityType] = useState<EntityType | null>(null)
  const [isPending, startTransition] = useTransition()
  const [inviteUser, setInviteUser] = useState(false)

  // Form state for each entity type
  const [formData, setFormData] = useState<Record<string, string | number | boolean | null | undefined>>({})
  const [inviteData, setInviteData] = useState({
    email: '',
    display_name: '',
    title: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setStep('type')
    setEntityType(null)
    setFormData({})
    setInviteData({ email: '', display_name: '', title: '' })
    setInviteUser(false)
    setErrors({})
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  const selectEntityType = (type: EntityType) => {
    setEntityType(type)
    setStep('details')
    // Initialize form data with defaults based on type
    const defaults: Record<EntityType, Record<string, string | number | boolean | null | undefined>> = {
      investor: { type: 'individual', legal_name: '' },
      introducer: { status: 'active', payment_terms: 'net_30', legal_name: '' },
      lawyer: { firm_name: '', display_name: '' },
      partner: { type: 'entity', partner_type: 'co_investor', status: 'active', name: '' },
      commercial_partner: { type: 'entity', cp_type: 'bank', status: 'active', name: '' },
      arranger: { status: 'active', legal_name: '' },
    }
    setFormData(defaults[type] || {})
  }

  const handleCreate = () => {
    if (!entityType) return

    startTransition(async () => {
      try {
        // Validate form data based on entity type
        const schemas: Record<EntityType, z.ZodSchema> = {
          investor: investorSchema,
          introducer: introducerSchema,
          lawyer: lawyerSchema,
          partner: partnerSchema,
          commercial_partner: commercialPartnerSchema,
          arranger: arrangerSchema,
        }

        const schema = schemas[entityType]
        const validationResult = schema.safeParse(formData)

        if (!validationResult.success) {
          const fieldErrors: Record<string, string> = {}
          validationResult.error.issues.forEach(err => {
            const path = err.path.join('.')
            fieldErrors[path] = err.message
          })
          setErrors(fieldErrors)
          toast.error('Please fix the form errors')
          return
        }

        // Validate invite data if enabled
        if (inviteUser) {
          const inviteValidation = userInviteSchema.safeParse(inviteData)
          if (!inviteValidation.success) {
            const fieldErrors: Record<string, string> = {}
            inviteValidation.error.issues.forEach(err => {
              const path = `invite_${err.path.join('.')}`
              fieldErrors[path] = err.message
            })
            setErrors(prev => ({ ...prev, ...fieldErrors }))
            toast.error('Please fix the user invite errors')
            return
          }
        }

        setErrors({})

        // Create entity
        const config = ENTITY_TYPES[entityType]
        const response = await fetch(config.apiPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validationResult.data),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to create ${config.label.toLowerCase()}`)
        }

        const entityResult = await response.json()
        // Handle various API response shapes:
        // - Direct id: { id: "..." }
        // - Nested object: { investor: { id: "..." } }
        // - Data object: { data: { id: "..." } }
        // - Data array (introducers, etc.): { data: [{ id: "..." }] }
        const createdEntityId = entityResult.id
          || entityResult.investor?.id
          || entityResult.introducer?.id
          || entityResult.arranger?.id
          || (Array.isArray(entityResult.data) ? entityResult.data[0]?.id : entityResult.data?.id)

        // If invite user is enabled, send invitation
        if (inviteUser && createdEntityId) {
          const entityTypeMapping: Record<EntityType, string> = {
            investor: 'investor',
            introducer: 'introducer',
            lawyer: 'lawyer',
            partner: 'partner',
            commercial_partner: 'commercial_partner',
            arranger: 'arranger',
          }

          const inviteResponse = await fetch('/api/admin/entity-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entity_type: entityTypeMapping[entityType],
              entity_id: createdEntityId,
              email: inviteData.email,
              display_name: inviteData.display_name,
              title: inviteData.title || null,
              is_primary: true,
            }),
          })

          if (!inviteResponse.ok) {
            console.warn('Failed to send invitation, but entity was created')
            toast.warning(`${config.label} created, but invitation failed to send`)
          } else {
            toast.success(`${config.label} created and invitation sent!`)
          }
        } else {
          toast.success(`${config.label} created successfully!`)
        }

        handleOpenChange(false)
        onSuccess?.()

        // Navigate to detail page
        if (createdEntityId) {
          window.location.href = `${config.detailPath}/${createdEntityId}`
        }

      } catch (error) {
        console.error('Create entity error:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to create account')
      }
    })
  }

  const updateFormData = (key: string, value: string | number | boolean | null | undefined) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const renderEntityTypeSelection = () => (
    <div className="grid grid-cols-2 gap-3">
      {(Object.entries(ENTITY_TYPES) as [EntityType, typeof ENTITY_TYPES[EntityType]][]).map(([type, config]) => {
        const Icon = config.icon
        return (
          <Card
            key={type}
            className={`cursor-pointer transition-all hover:border-primary/50 hover:shadow-md ${
              entityType === type ? 'border-primary ring-2 ring-primary/20' : ''
            }`}
            onClick={() => selectEntityType(type)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{config.label}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {config.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  const renderFormField = (
    key: string,
    label: string,
    type: 'text' | 'email' | 'number' | 'select' | 'textarea' = 'text',
    options?: { value: string; label: string }[],
    placeholder?: string
  ) => (
    <div key={key} className="space-y-1.5">
      <Label htmlFor={key} className="text-sm">
        {label}
        {errors[key] && <span className="text-destructive ml-1">*</span>}
      </Label>
      {type === 'select' && options ? (
        <Select
          value={typeof formData[key] === 'string' ? formData[key] : ''}
          onValueChange={(value) => updateFormData(key, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === 'textarea' ? (
        <Textarea
          id={key}
          value={typeof formData[key] === 'string' ? formData[key] : ''}
          onChange={(e) => updateFormData(key, e.target.value)}
          placeholder={placeholder}
          className="resize-none"
          rows={3}
        />
      ) : (
        <Input
          id={key}
          type={type}
          value={typeof formData[key] === 'string' || typeof formData[key] === 'number' ? formData[key] : ''}
          onChange={(e) => updateFormData(key, type === 'number' ? parseFloat(e.target.value) || '' : e.target.value)}
          placeholder={placeholder}
        />
      )}
      {errors[key] && (
        <p className="text-xs text-destructive">{errors[key]}</p>
      )}
    </div>
  )

  const renderEntityForm = () => {
    if (!entityType) return null

    const forms: Record<EntityType, React.ReactNode> = {
      investor: (
        <div className="space-y-4">
          {renderFormField('legal_name', 'Legal Name', 'text', undefined, 'John Smith / Acme Fund LP')}
          {renderFormField('display_name', 'Display Name', 'text', undefined, 'Optional short name')}
          {renderFormField('type', 'Investor Type', 'select', [
            { value: 'individual', label: 'Individual' },
            { value: 'institutional', label: 'Institutional' },
            { value: 'entity', label: 'Entity' },
            { value: 'family_office', label: 'Family Office' },
            { value: 'fund', label: 'Fund' },
          ])}
          <div className="grid grid-cols-2 gap-4">
            {renderFormField('email', 'Email', 'email', undefined, 'investor@example.com')}
            {renderFormField('phone', 'Phone', 'text', undefined, '+1 (555) 123-4567')}
          </div>
          {renderFormField('country', 'Country', 'text', undefined, 'United States')}
        </div>
      ),
      introducer: (
        <div className="space-y-4">
          {renderFormField('legal_name', 'Legal Name', 'text', undefined, 'ABC Advisors Ltd')}
          {renderFormField('contact_name', 'Contact Name', 'text', undefined, 'John Smith')}
          {renderFormField('email', 'Email', 'email', undefined, 'contact@company.com')}
          <div className="grid grid-cols-2 gap-4">
            {renderFormField('default_commission_bps', 'Commission (bps)', 'number', undefined, '0-300')}
            {renderFormField('payment_terms', 'Payment Terms', 'select', [
              { value: 'net_15', label: 'Net 15' },
              { value: 'net_30', label: 'Net 30' },
              { value: 'net_45', label: 'Net 45' },
              { value: 'net_60', label: 'Net 60' },
            ])}
          </div>
          {renderFormField('status', 'Status', 'select', [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'suspended', label: 'Suspended' },
          ])}
          {renderFormField('notes', 'Notes', 'textarea', undefined, 'Additional notes...')}
        </div>
      ),
      lawyer: (
        <div className="space-y-4">
          {renderFormField('firm_name', 'Firm Name', 'text', undefined, 'Smith & Associates LLP')}
          {renderFormField('display_name', 'Display Name', 'text', undefined, 'Smith & Associates')}
          {renderFormField('primary_contact_name', 'Primary Contact', 'text', undefined, 'Jane Smith')}
          <div className="grid grid-cols-2 gap-4">
            {renderFormField('primary_contact_email', 'Contact Email', 'email', undefined, 'jane@firm.com')}
            {renderFormField('primary_contact_phone', 'Contact Phone', 'text', undefined, '+1 (555) 123-4567')}
          </div>
          {renderFormField('country', 'Country', 'text', undefined, 'United States')}
        </div>
      ),
      partner: (
        <div className="space-y-4">
          {renderFormField('name', 'Partner Name', 'text', undefined, 'Partner Capital LLC')}
          {renderFormField('legal_name', 'Legal Name', 'text', undefined, 'Optional full legal name')}
          <div className="grid grid-cols-2 gap-4">
            {renderFormField('type', 'Type', 'select', [
              { value: 'entity', label: 'Entity' },
              { value: 'individual', label: 'Individual' },
              { value: 'institutional', label: 'Institutional' },
            ])}
            {renderFormField('partner_type', 'Partner Type', 'select', [
              { value: 'co_investor', label: 'Co-Investor' },
              { value: 'syndicate', label: 'Syndicate' },
              { value: 'strategic', label: 'Strategic' },
              { value: 'institutional', label: 'Institutional' },
              { value: 'other', label: 'Other' },
            ])}
          </div>
          {renderFormField('contact_name', 'Contact Name', 'text', undefined, 'John Smith')}
          <div className="grid grid-cols-2 gap-4">
            {renderFormField('contact_email', 'Contact Email', 'email', undefined, 'john@partner.com')}
            {renderFormField('country', 'Country', 'text', undefined, 'United States')}
          </div>
        </div>
      ),
      commercial_partner: (
        <div className="space-y-4">
          {renderFormField('name', 'Partner Name', 'text', undefined, 'First National Bank')}
          {renderFormField('legal_name', 'Legal Name', 'text', undefined, 'Optional full legal name')}
          <div className="grid grid-cols-2 gap-4">
            {renderFormField('type', 'Type', 'select', [
              { value: 'entity', label: 'Entity' },
              { value: 'individual', label: 'Individual' },
              { value: 'institutional', label: 'Institutional' },
            ])}
            {renderFormField('cp_type', 'Service Type', 'select', [
              { value: 'placement_agent', label: 'Placement Agent' },
              { value: 'distributor', label: 'Distributor' },
              { value: 'wealth_manager', label: 'Wealth Manager' },
              { value: 'family_office', label: 'Family Office' },
              { value: 'bank', label: 'Bank' },
              { value: 'other', label: 'Other' },
            ])}
          </div>
          {renderFormField('contact_name', 'Contact Name', 'text', undefined, 'Jane Smith')}
          <div className="grid grid-cols-2 gap-4">
            {renderFormField('contact_email', 'Contact Email', 'email', undefined, 'jane@bank.com')}
            {renderFormField('country', 'Country', 'text', undefined, 'United States')}
          </div>
        </div>
      ),
      arranger: (
        <div className="space-y-4">
          {renderFormField('legal_name', 'Legal Name', 'text', undefined, 'VERSO Arranger Ltd')}
          <div className="grid grid-cols-2 gap-4">
            {renderFormField('registration_number', 'Registration Number', 'text', undefined, 'Company reg #')}
            {renderFormField('license_number', 'License Number', 'text', undefined, 'License #')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {renderFormField('email', 'Email', 'email', undefined, 'contact@arranger.com')}
            {renderFormField('phone', 'Phone', 'text', undefined, '+1 (555) 123-4567')}
          </div>
          {renderFormField('regulator', 'Regulator', 'text', undefined, 'BVI FSC')}
          {renderFormField('status', 'Status', 'select', [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ])}
        </div>
      ),
    }

    return forms[entityType]
  }

  const renderUserInviteSection = () => (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Invite User</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Send a magic link invitation to create an account
          </p>
        </div>
        <Switch
          checked={inviteUser}
          onCheckedChange={setInviteUser}
        />
      </div>

      {inviteUser && (
        <div className="space-y-3 pl-6 border-l-2 border-muted">
          <div className="space-y-1.5">
            <Label htmlFor="invite_email" className="text-sm">
              Email Address
              {errors['invite_email'] && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id="invite_email"
              type="email"
              value={inviteData.email}
              onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
            />
            {errors['invite_email'] && (
              <p className="text-xs text-destructive">{errors['invite_email']}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite_display_name" className="text-sm">
              Display Name
              {errors['invite_display_name'] && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id="invite_display_name"
              value={inviteData.display_name}
              onChange={(e) => setInviteData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="John Smith"
            />
            {errors['invite_display_name'] && (
              <p className="text-xs text-destructive">{errors['invite_display_name']}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite_title" className="text-sm">Title (Optional)</Label>
            <Input
              id="invite_title"
              value={inviteData.title}
              onChange={(e) => setInviteData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Director, Partner, etc."
            />
          </div>
        </div>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {step === 'details' && entityType && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setStep('type')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <DialogTitle>
                {step === 'type' ? 'Add Account' : `New ${entityType ? ENTITY_TYPES[entityType].label : ''}`}
              </DialogTitle>
              <DialogDescription>
                {step === 'type'
                  ? 'Select the type of account you want to create'
                  : `Enter the details for the new ${entityType ? ENTITY_TYPES[entityType].label.toLowerCase() : 'account'}`}
              </DialogDescription>
            </div>
          </div>
          {step === 'details' && entityType && (
            <Badge variant="outline" className={`w-fit ${ENTITY_TYPES[entityType].color}`}>
              {ENTITY_TYPES[entityType].label}
            </Badge>
          )}
        </DialogHeader>

        {step === 'type' ? (
          renderEntityTypeSelection()
        ) : (
          <div className="space-y-4">
            {renderEntityForm()}
            {renderUserInviteSection()}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          {step === 'details' && (
            <Button
              type="button"
              onClick={handleCreate}
              disabled={isPending}
            >
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {inviteUser ? 'Create & Invite' : 'Create Account'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
