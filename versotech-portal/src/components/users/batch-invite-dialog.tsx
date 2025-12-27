'use client'

import { useState, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Loader2,
  Mail,
  User,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users
} from 'lucide-react'
import { toast } from 'sonner'

export type EntityType = 'investor' | 'arranger' | 'lawyer' | 'introducer' | 'partner' | 'commercial_partner'

const inviteSchema = z.object({
  email: z.string().email('Invalid email'),
  display_name: z.string().min(2, 'Name required'),
  title: z.string().optional(),
  role: z.string().optional(),
  is_primary: z.boolean().optional().default(false),
})

const batchInviteFormSchema = z.object({
  entity_type: z.enum(['investor', 'arranger', 'lawyer', 'introducer', 'partner', 'commercial_partner']),
  entity_id: z.string().optional(),
  create_entities: z.boolean().optional().default(true),
  invites: z.array(inviteSchema).min(1, 'At least one invite required'),
})

type BatchInviteFormData = {
  entity_type: 'investor' | 'arranger' | 'lawyer' | 'introducer' | 'partner' | 'commercial_partner'
  entity_id?: string
  create_entities: boolean
  invites: {
    email: string
    display_name: string
    title?: string
    role?: string
    is_primary: boolean
  }[]
}

interface InviteResult {
  email: string
  success: boolean
  user_id?: string
  entity_id?: string
  is_new_user?: boolean
  error?: string
}

interface BatchInviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  defaultEntityType?: EntityType
  existingEntityId?: string
  existingEntityName?: string
}

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  investor: 'Investors',
  arranger: 'Arrangers',
  lawyer: 'Law Firms',
  introducer: 'Introducers',
  partner: 'Partners',
  commercial_partner: 'Commercial Partners',
}

const ROLE_OPTIONS_BY_ENTITY: Record<EntityType, { value: string; label: string }[]> = {
  investor: [
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Member' },
  ],
  arranger: [
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Member' },
  ],
  lawyer: [
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Member' },
  ],
  partner: [
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Member' },
  ],
  introducer: [
    { value: 'admin', label: 'Admin' },
    { value: 'contact', label: 'Contact' },
  ],
  commercial_partner: [
    { value: 'admin', label: 'Admin' },
    { value: 'contact', label: 'Contact' },
  ],
}

export function BatchInviteDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultEntityType = 'investor',
  existingEntityId,
  existingEntityName,
}: BatchInviteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<InviteResult[] | null>(null)
  const [csvInput, setCsvInput] = useState('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BatchInviteFormData>({
    resolver: zodResolver(batchInviteFormSchema) as any,
    defaultValues: {
      entity_type: defaultEntityType,
      entity_id: existingEntityId,
      create_entities: !existingEntityId,
      invites: [{ email: '', display_name: '', title: '', is_primary: true }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'invites',
  })

  const entityType = watch('entity_type') as EntityType
  const createEntities = watch('create_entities')

  const parseCsvInput = useCallback(() => {
    const lines = csvInput.trim().split('\n').filter(line => line.trim())
    const newInvites: { email: string; display_name: string; title?: string; is_primary: boolean }[] = []

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim())
      if (parts.length >= 2) {
        const email = parts[0]
        const display_name = parts[1]
        const title = parts[2] || undefined

        // Basic email validation
        if (email.includes('@') && display_name.length >= 2) {
          newInvites.push({
            email,
            display_name,
            title,
            is_primary: newInvites.length === 0,
          })
        }
      }
    }

    if (newInvites.length > 0) {
      setValue('invites', newInvites)
      toast.success(`Parsed ${newInvites.length} invites from CSV`)
    } else {
      toast.error('No valid invites found. Format: email, name, title (optional)')
    }
  }, [csvInput, setValue])

  const onSubmit = async (data: BatchInviteFormData) => {
    setIsSubmitting(true)
    setResults(null)

    try {
      const response = await fetch('/api/admin/batch-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Batch invite failed')
      }

      setResults(result.results)

      if (result.failed === 0) {
        toast.success(`Successfully invited ${result.successful} users`)
      } else {
        toast.warning(`Invited ${result.successful} users, ${result.failed} failed`)
      }

      onSuccess?.()
    } catch (error) {
      console.error('Batch invite error:', error)
      toast.error(error instanceof Error ? error.message : 'Batch invite failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    setResults(null)
    setCsvInput('')
    onOpenChange(false)
  }

  const addInvite = () => {
    append({ email: '', display_name: '', title: '', is_primary: false })
  }

  // Show results view if we have results
  if (results) {
    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Batch Invite Results
            </DialogTitle>
            <DialogDescription>
              {successCount} successful, {failCount} failed
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-green-700 dark:text-green-400">Successful</div>
              </div>
              <div className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                <XCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
                <div className="text-2xl font-bold text-red-600">{failCount}</div>
                <div className="text-sm text-red-700 dark:text-red-400">Failed</div>
              </div>
            </div>

            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="p-4 space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      result.success
                        ? 'bg-green-50 dark:bg-green-900/10'
                        : 'bg-red-50 dark:bg-red-900/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium">{result.email}</div>
                        {result.error && (
                          <div className="text-sm text-red-600">{result.error}</div>
                        )}
                      </div>
                    </div>
                    {result.success && (
                      <Badge variant={result.is_new_user ? 'default' : 'secondary'}>
                        {result.is_new_user ? 'New User' : 'Linked'}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Batch Invite Users
          </DialogTitle>
          <DialogDescription>
            {existingEntityName
              ? `Invite multiple users to ${existingEntityName}`
              : 'Invite multiple users and create new entities for each'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="csv">CSV Import</TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Paste CSV Data</Label>
              <Textarea
                placeholder="email@example.com, John Smith, Managing Director&#10;another@example.com, Jane Doe, Partner&#10;..."
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Format: email, display_name, title (optional) - one per line
              </p>
            </div>
            <Button type="button" onClick={parseCsvInput} variant="secondary">
              <Upload className="mr-2 h-4 w-4" />
              Parse CSV
            </Button>
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Entity Type Selection */}
              {!existingEntityId && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Entity Type</Label>
                    <Select
                      value={entityType}
                      onValueChange={(value) => setValue('entity_type', value as EntityType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Create New Entities</Label>
                      <p className="text-xs text-muted-foreground">
                        Create a new {entityType} for each invite
                      </p>
                    </div>
                    <Switch
                      checked={createEntities}
                      onCheckedChange={(checked) => setValue('create_entities', checked)}
                    />
                  </div>
                </div>
              )}

              {/* Invites List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Invites ({fields.length})</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInvite}
                    disabled={fields.length >= 100}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add
                  </Button>
                </div>

                <ScrollArea className="h-[300px] border rounded-lg p-4">
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-[1fr,1fr,auto,auto] gap-2 items-start"
                        role="group"
                        aria-label={`Invite ${index + 1}`}
                      >
                        <div>
                          <label htmlFor={`invite-email-${index}`} className="sr-only">
                            Email address for invite {index + 1}
                          </label>
                          <Input
                            id={`invite-email-${index}`}
                            placeholder="email@example.com"
                            {...register(`invites.${index}.email`)}
                            className={errors.invites?.[index]?.email ? 'border-red-500' : ''}
                            aria-invalid={!!errors.invites?.[index]?.email}
                            aria-describedby={errors.invites?.[index]?.email ? `email-error-${index}` : undefined}
                          />
                          {errors.invites?.[index]?.email && (
                            <p id={`email-error-${index}`} className="text-xs text-red-500 mt-1" role="alert">
                              {errors.invites[index]?.email?.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label htmlFor={`invite-name-${index}`} className="sr-only">
                            Display name for invite {index + 1}
                          </label>
                          <Input
                            id={`invite-name-${index}`}
                            placeholder="Display Name"
                            {...register(`invites.${index}.display_name`)}
                            className={errors.invites?.[index]?.display_name ? 'border-red-500' : ''}
                            aria-invalid={!!errors.invites?.[index]?.display_name}
                          />
                        </div>
                        <Select
                          value={watch(`invites.${index}.role`) || 'member'}
                          onValueChange={(value) => setValue(`invites.${index}.role`, value)}
                        >
                          <SelectTrigger className="w-[100px]" aria-label={`Role for invite ${index + 1}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS_BY_ENTITY[entityType].map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          aria-label={`Remove invite ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending {fields.length} Invites...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send {fields.length} Invites
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>

        {/* Show parsed invites even when on CSV tab */}
        {fields.length > 1 && (
          <div className="mt-4 p-3 bg-muted rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {fields.length} invites ready to send
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
