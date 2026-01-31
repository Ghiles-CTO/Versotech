'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { Loader2, Plus, Copy, Rocket, Archive, Pencil, Upload, FileCheck, Users, Building2, Briefcase, Eye, Download, X, SendHorizontal } from 'lucide-react'
import FeePlanEditModal from '@/components/fees/FeePlanEditModal'
import { DocumentViewerFullscreen } from '@/components/documents/DocumentViewerFullscreen'
import type { DocumentReference } from '@/types/document-viewer.types'
import { usePersona } from '@/contexts/persona-context'
import { toast } from 'sonner'

type TermSheet = Record<string, any>

type VehicleMeta = {
  name?: string | null
  investment_name?: string | null
  series_number?: string | null
  series_short_title?: string | null
  entity_code?: string | null
}

function deriveIssuerAndVehicle(vehicle?: VehicleMeta | null) {
  const rawName = (vehicle?.name || '').trim()
  const seriesMatch = rawName.match(/\bseries\s+(.+)$/i)
  const seriesToken = seriesMatch?.[1]?.trim()
  const issuer = seriesMatch ? rawName.slice(0, seriesMatch.index).trim() : rawName
  const entitySeries = vehicle?.series_number || vehicle?.entity_code?.match(/\d+/)?.[0] || ''
  const vehicleLabel = seriesToken
    ? `Series ${seriesToken}`
    : (entitySeries ? `Series ${entitySeries}` : (vehicle?.investment_name || rawName))

  return {
    issuer: issuer || rawName,
    vehicle: vehicleLabel || rawName
  }
}

/** Fee plan with entity and term sheet info for display */
interface LinkedFeePlan {
  id: string
  name: string
  status: 'draft' | 'sent' | 'pending_signature' | 'accepted' | 'rejected'
  term_sheet_id: string | null
  accepted_at: string | null
  accepted_by: string | null
  introducer?: { id: string; name: string; company_name?: string } | null
  partner?: { id: string; name: string; company_name?: string } | null
  commercial_partner?: { id: string; name: string; company_name?: string } | null
}

interface DealTermSheetTabProps {
  dealId: string
  termSheets: TermSheet[]
}

type EditorMode = 'create' | 'edit' | 'clone'

const statusClasses: Record<string, string> = {
  draft: 'bg-amber-500/20 text-amber-100',
  published: 'bg-emerald-500/20 text-emerald-100',
  archived: 'bg-muted text-muted-foreground'
}

/** Fee plan status styling */
const feePlanStatusClasses: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground border-border',
  sent: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  pending_signature: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  accepted: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/30'
}

const feePlanStatusLabels: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  pending_signature: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected'
}

const DEFAULT_TERMSHEET_TEXT = {
  to_description: 'Qualified, Professional and Institutional Investors only',
  capital_call_timeline:
    'No later than 3 days prior to confirmed Completion Date by Company with effective funds on Escrow Account (T-3)',
  in_principle_approval_text:
    'The Arranger has obtained approval for the present offering from the Issuer',
  subscription_pack_note:
    'The Issuer shall issue a Subscription Pack to be executed by the Purchaser',
  share_certificates_note:
    'The Issuer shall provide the Purchasers Share Certificates and Statement of Holdings upon Completion',
  subject_to_change_note:
    'The content of the present term sheet remains indicative, subject to change'
}

const emptyForm = {
  term_sheet_date: '',
  to_description: DEFAULT_TERMSHEET_TEXT.to_description,
  transaction_type: '',
  opportunity_summary: '',
  issuer: '',
  vehicle: '',
  exclusive_arranger: '',
  purchaser: '',
  seller: '',
  structure: '',
  allocation_up_to: '',
  price_per_share: '',
  cost_per_share: '',
  minimum_ticket: '',
  subscription_fee_percent: '',
  management_fee_percent: '',
  management_fee_clause: '',
  carried_interest_percent: '',
  performance_fee_clause: '',
  legal_counsel: '',
  interest_confirmation_deadline: '',
  capital_call_timeline: DEFAULT_TERMSHEET_TEXT.capital_call_timeline,
  validity_date: '',
  completion_date: '',
  completion_date_text: '',
  in_principle_approval_text: DEFAULT_TERMSHEET_TEXT.in_principle_approval_text,
  subscription_pack_note: DEFAULT_TERMSHEET_TEXT.subscription_pack_note,
  share_certificates_note: DEFAULT_TERMSHEET_TEXT.share_certificates_note,
  subject_to_change_note: DEFAULT_TERMSHEET_TEXT.subject_to_change_note
}

type FormState = typeof emptyForm

function mapTermSheetToForm(termSheet?: TermSheet): FormState {
  if (!termSheet) return emptyForm
  const parsedPrice = termSheet.price_per_share_text
    ? Number(String(termSheet.price_per_share_text).replace(/[^\d.]/g, ''))
    : null
  const formattedCompletionDate = termSheet.completion_date
    ? `By ${format(new Date(termSheet.completion_date), 'MMMM d, yyyy')}`
    : ''
  return {
    term_sheet_date: termSheet.term_sheet_date ? termSheet.term_sheet_date.slice(0, 10) : '',
    to_description: termSheet.to_description ?? DEFAULT_TERMSHEET_TEXT.to_description,
    transaction_type: termSheet.transaction_type ?? '',
    opportunity_summary: termSheet.opportunity_summary ?? '',
    issuer: termSheet.issuer ?? '',
    vehicle: termSheet.vehicle ?? '',
    exclusive_arranger: termSheet.exclusive_arranger ?? '',
    purchaser: termSheet.purchaser ?? '',
    seller: termSheet.seller ?? '',
    structure: termSheet.structure ?? '',
    allocation_up_to: termSheet.allocation_up_to ?? '',
    price_per_share: termSheet.price_per_share != null
      ? String(termSheet.price_per_share)
      : (parsedPrice ? String(parsedPrice) : ''),
    cost_per_share: termSheet.cost_per_share != null ? String(termSheet.cost_per_share) : '',
    minimum_ticket: termSheet.minimum_ticket ?? '',
    subscription_fee_percent: termSheet.subscription_fee_percent ?? '',
    management_fee_percent: termSheet.management_fee_percent ?? '',
    management_fee_clause: termSheet.management_fee_clause ?? '',
    carried_interest_percent: termSheet.carried_interest_percent ?? '',
    performance_fee_clause: termSheet.performance_fee_clause ?? '',
    legal_counsel: termSheet.legal_counsel ?? '',
    interest_confirmation_deadline: termSheet.interest_confirmation_deadline
      ? termSheet.interest_confirmation_deadline.slice(0, 16)
      : '',
    capital_call_timeline: termSheet.capital_call_timeline ?? DEFAULT_TERMSHEET_TEXT.capital_call_timeline,
    validity_date: termSheet.validity_date ? termSheet.validity_date.slice(0, 16) : '',
    completion_date: termSheet.completion_date ? termSheet.completion_date.slice(0, 10) : '',
    completion_date_text: termSheet.completion_date_text ?? formattedCompletionDate,
    in_principle_approval_text: termSheet.in_principle_approval_text ?? DEFAULT_TERMSHEET_TEXT.in_principle_approval_text,
    subscription_pack_note: termSheet.subscription_pack_note ?? DEFAULT_TERMSHEET_TEXT.subscription_pack_note,
    share_certificates_note: termSheet.share_certificates_note ?? DEFAULT_TERMSHEET_TEXT.share_certificates_note,
    subject_to_change_note: termSheet.subject_to_change_note ?? DEFAULT_TERMSHEET_TEXT.subject_to_change_note
  }
}

function toNumber(value: string) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function formatPrice(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return ''
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

function getPricePerShareDisplay(termSheet: TermSheet) {
  if (termSheet?.price_per_share != null && termSheet.price_per_share !== '') {
    return formatPrice(Number(termSheet.price_per_share))
  }
  if (termSheet?.price_per_share_text) {
    const parsed = Number(String(termSheet.price_per_share_text).replace(/[^\d.]/g, ''))
    return parsed ? formatPrice(parsed) : termSheet.price_per_share_text
  }
  return ''
}

function buildPayload(values: FormState) {
  const pricePerShare = toNumber(values.price_per_share)
  const pricePerShareText = pricePerShare != null ? pricePerShare.toFixed(2) : null
  return {
    term_sheet_date: values.term_sheet_date || null,
    to_description: values.to_description || null,
    transaction_type: values.transaction_type || null,
    opportunity_summary: values.opportunity_summary || null,
    issuer: values.issuer || null,
    vehicle: values.vehicle || null,
    exclusive_arranger: values.exclusive_arranger || null,
    purchaser: values.purchaser || null,
    seller: values.seller || null,
    structure: values.structure || null,
    allocation_up_to: toNumber(values.allocation_up_to),
    price_per_share_text: pricePerShareText,
    price_per_share: pricePerShare,
    cost_per_share: toNumber(values.cost_per_share),
    minimum_ticket: toNumber(values.minimum_ticket),
    subscription_fee_percent: toNumber(values.subscription_fee_percent),
    management_fee_percent: toNumber(values.management_fee_percent),
    management_fee_clause: values.management_fee_clause || null,
    carried_interest_percent: toNumber(values.carried_interest_percent),
    performance_fee_clause: values.performance_fee_clause || null,
    legal_counsel: values.legal_counsel || null,
    interest_confirmation_deadline: values.interest_confirmation_deadline || null,
    capital_call_timeline: values.capital_call_timeline || null,
    validity_date: values.validity_date || null,
    completion_date: values.completion_date || null,
    completion_date_text: values.completion_date_text || null,
    in_principle_approval_text: values.in_principle_approval_text || null,
    subscription_pack_note: values.subscription_pack_note || null,
    share_certificates_note: values.share_certificates_note || null,
    subject_to_change_note: values.subject_to_change_note || null
  }
}

export function DealTermSheetTab({ dealId, termSheets }: DealTermSheetTabProps) {
  const [items, setItems] = useState<TermSheet[]>(termSheets ?? [])
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<EditorMode>('create')
  const [targetId, setTargetId] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<FormState>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)
  const [uploadingAttachmentId, setUploadingAttachmentId] = useState<string | null>(null)
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({})
  const [dealVehicle, setDealVehicle] = useState<VehicleMeta | null>(null)

  // Fee plan state
  const [feePlans, setFeePlans] = useState<LinkedFeePlan[]>([])
  const [feePlansLoading, setFeePlansLoading] = useState(false)
  const [feePlanModalOpen, setFeePlanModalOpen] = useState(false)
  const [selectedTermSheetIdForFeePlan, setSelectedTermSheetIdForFeePlan] = useState<string | undefined>()

  const vehicleDefaults = useMemo(() => deriveIssuerAndVehicle(dealVehicle), [dealVehicle])

  const applyVehicleDefaults = useCallback((values: FormState) => ({
    ...values,
    issuer: values.issuer || vehicleDefaults.issuer || '',
    vehicle: values.vehicle || vehicleDefaults.vehicle || ''
  }), [vehicleDefaults])

  useEffect(() => {
    let cancelled = false

    const loadDeal = async () => {
      try {
        const response = await fetch(`/api/deals/${dealId}`)
        if (!response.ok) return
        const data = await response.json()
        if (cancelled) return
        setDealVehicle(data?.deal?.vehicles ?? null)
      } catch (error) {
        console.error('Failed to load deal vehicle data', error)
      }
    }

    loadDeal()
    return () => {
      cancelled = true
    }
  }, [dealId])

  // Document preview state (fullscreen viewer)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewTermSheetId, setPreviewTermSheetId] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [previewDocument, setPreviewDocument] = useState<DocumentReference | null>(null)

  // PDF generation state
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [requestingCloseId, setRequestingCloseId] = useState<string | null>(null)

  // Persona for CEO/staff visibility of cost fields
  const { isCEO, isStaff } = usePersona()
  const canViewCost = isCEO || isStaff

  useEffect(() => {
    setItems(termSheets ?? [])
  }, [termSheets])

  // Fetch fee plans for this deal
  const fetchFeePlans = useCallback(async () => {
    setFeePlansLoading(true)
    try {
      const response = await fetch(`/api/deals/${dealId}/fee-plans`)
      if (!response.ok) {
        console.error('Failed to fetch fee plans')
        return
      }
      const data = await response.json()
      setFeePlans(data.feePlans || [])
    } catch (error) {
      console.error('Error fetching fee plans:', error)
    } finally {
      setFeePlansLoading(false)
    }
  }, [dealId])

  useEffect(() => {
    fetchFeePlans()
  }, [fetchFeePlans])

  // Group fee plans by term sheet ID
  const feePlansByTermSheet = useMemo(() => {
    const grouped: Record<string, LinkedFeePlan[]> = {}
    for (const fp of feePlans) {
      const tsId = fp.term_sheet_id || 'unlinked'
      if (!grouped[tsId]) {
        grouped[tsId] = []
      }
      grouped[tsId].push(fp)
    }
    return grouped
  }, [feePlans])

  // Get entity display info from a fee plan
  const getEntityInfo = (fp: LinkedFeePlan) => {
    if (fp.introducer) {
      return {
        type: 'Introducer',
        name: fp.introducer.company_name || fp.introducer.name,
        icon: Users
      }
    }
    if (fp.partner) {
      return {
        type: 'Partner',
        name: fp.partner.company_name || fp.partner.name,
        icon: Building2
      }
    }
    if (fp.commercial_partner) {
      return {
        type: 'Commercial Partner',
        name: fp.commercial_partner.company_name || fp.commercial_partner.name,
        icon: Briefcase
      }
    }
    return null
  }

  // Handle opening the fee plan modal with a pre-selected term sheet
  const openFeePlanModal = (termSheetId: string) => {
    setSelectedTermSheetIdForFeePlan(termSheetId)
    setFeePlanModalOpen(true)
  }

  const closeFeePlanModal = () => {
    setFeePlanModalOpen(false)
    setSelectedTermSheetIdForFeePlan(undefined)
  }

  const handleFeePlanSuccess = () => {
    closeFeePlanModal()
    fetchFeePlans()
  }

  // Document preview handlers (fullscreen viewer)
  const openPreview = async (termSheetId: string) => {
    // Find the term sheet to get filename info
    const termSheet = items.find(ts => ts.id === termSheetId)
    const fileName = termSheet?.term_sheet_attachment_key?.split('/').pop() || 'Term Sheet.pdf'

    setPreviewTermSheetId(termSheetId)
    setPreviewDocument({
      id: termSheetId,
      file_name: fileName,
      name: fileName,
      mime_type: 'application/pdf',
      type: 'term_sheet'
    })
    setPreviewOpen(true)
    setPreviewLoading(true)
    setPreviewError(null)
    setPreviewUrl(null)

    try {
      const response = await fetch(`/api/deals/${dealId}/fee-structures/${termSheetId}/attachment`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to load document')
      }
      const data = await response.json()
      setPreviewUrl(data.url)
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : 'Failed to load document')
    } finally {
      setPreviewLoading(false)
    }
  }

  const closePreview = () => {
    setPreviewOpen(false)
    setPreviewUrl(null)
    setPreviewTermSheetId(null)
    setPreviewError(null)
    setPreviewDocument(null)
  }

  const handleDownload = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    }
  }

  // Generate PDF handler - triggers n8n workflow
  const handleGenerateTermsheet = async (structureId: string) => {
    setGeneratingId(structureId)
    setErrorMessage(null)
    try {
      const response = await fetch(
        `/api/deals/${dealId}/fee-structures/${structureId}/generate`,
        { method: 'POST' }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate term sheet')
      }
      // Refresh to show updated attachment (user can preview manually)
      await refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate term sheet')
    } finally {
      setGeneratingId(null)
    }
  }

  // Request close approval handler - triggers CEO approval creation
  const handleRequestClose = async (structureId: string) => {
    setRequestingCloseId(structureId)
    setErrorMessage(null)
    try {
      const response = await fetch(
        `/api/deals/${dealId}/fee-structures/${structureId}/request-close`,
        { method: 'POST' }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to request close approval')
      }
      // Show success message
      toast.success('Close approval created', {
        description: 'The CEO will review this request in the Approvals queue.'
      })
      await refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to request close approval'
      setErrorMessage(message)
      toast.error('Request failed', { description: message })
    } finally {
      setRequestingCloseId(null)
    }
  }

  const ordered = useMemo(
    () => [...items].sort((a, b) => (b.version ?? 0) - (a.version ?? 0)),
    [items]
  )

  // Get ALL published term sheets (multiple allowed for different investor classes)
  const publishedTermSheets = useMemo(
    () => ordered.filter(item => item.status === 'published'),
    [ordered]
  )

  // For backwards compat - first published
  const published = publishedTermSheets[0]

  const handleAttachmentUpload = async (structureId: string, file: File) => {
    setAttachmentError(null)
    setUploadingAttachmentId(structureId)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(
        `/api/deals/${dealId}/fee-structures/${structureId}/attachment`,
        {
          method: 'POST',
          body: formData
        }
      )

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to upload attachment')
      }

      const nextItems = items.map(item =>
        item.id === structureId
          ? { ...item, term_sheet_attachment_key: payload.term_sheet_attachment_key }
          : item
      )
      setItems(nextItems)

      if (targetId === structureId) {
        setFormValues(prev => ({
          ...prev,
          term_sheet_attachment_key: payload.term_sheet_attachment_key ?? ''
        }))
      }
    } catch (error) {
      console.error('Term sheet attachment upload failed', error)
      setAttachmentError(
        error instanceof Error ? error.message : 'Failed to upload attachment'
      )
    } finally {
      const input = fileInputsRef.current[structureId]
      if (input) {
        input.value = ''
      }
      setUploadingAttachmentId(null)
    }
  }

  const openEditor = (mode: EditorMode, termSheet?: TermSheet) => {
    setEditorMode(mode)
    setTargetId(mode === 'edit' ? termSheet?.id ?? null : null)
    const baseValues = mapTermSheetToForm(mode === 'create' ? undefined : termSheet)
    setFormValues(applyVehicleDefaults(baseValues))
    setErrorMessage(null)
    setEditorOpen(true)
  }

  const closeEditor = () => {
    setEditorOpen(false)
    setTargetId(null)
    setFormValues(emptyForm)
  }

  useEffect(() => {
    if (!editorOpen || editorMode !== 'create') return
    if (!vehicleDefaults.issuer && !vehicleDefaults.vehicle) return
    setFormValues(prev => ({
      ...prev,
      issuer: prev.issuer || vehicleDefaults.issuer || '',
      vehicle: prev.vehicle || vehicleDefaults.vehicle || ''
    }))
  }, [editorOpen, editorMode, vehicleDefaults])

  const refresh = async () => {
    const response = await fetch(`/api/deals/${dealId}/fee-structures`)
    if (!response.ok) {
      setErrorMessage('Failed to refresh term sheets. Please reload the page.')
      return
    }
    const data = await response.json()
    setItems(data.term_sheets ?? [])
  }

  const submitForm = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const payload = buildPayload(formValues)
      let response: Response
      if (editorMode === 'create' || editorMode === 'clone') {
        response = await fetch(`/api/deals/${dealId}/fee-structures`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        if (!targetId) throw new Error('Missing term sheet ID')
        response = await fetch(`/api/deals/${dealId}/fee-structures`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            structure_id: targetId,
            updates: payload
          })
        })
      }

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Failed to save term sheet')
      }

      await refresh()
      closeEditor()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error saving term sheet')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateStatus = async (termSheet: TermSheet, status: 'draft' | 'published' | 'archived') => {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const response = await fetch(`/api/deals/${dealId}/fee-structures`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structure_id: termSheet.id,
          updates: { status }
        })
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Failed to update status')
      }
      await refresh()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error updating status')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Term Sheet Versions</h3>
          <p className="text-sm text-muted-foreground">
            Draft, publish, and archive the structured economics that power the investor experience.
          </p>
        </div>
      <Button
        onClick={() => openEditor('create')}
        disabled={isSubmitting}
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        New Term Sheet
      </Button>
    </div>

    {errorMessage && (
      <Card className="border border-destructive/30 bg-destructive/10">
        <CardContent className="text-sm text-destructive p-3">
          {errorMessage}
        </CardContent>
      </Card>
    )}
    {attachmentError && (
      <Card className="border border-amber-400/30 bg-amber-500/10">
        <CardContent className="text-sm text-amber-800 p-3">
          {attachmentError}
        </CardContent>
      </Card>
    )}

      {/* Published Term Sheets Section */}
      {publishedTermSheets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
            Published Term Sheets ({publishedTermSheets.length})
          </h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {publishedTermSheets.map((published) => (
              <Card key={published.id} className="border border-emerald-400/30 bg-emerald-500/10">
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-foreground">Version {published.version}</CardTitle>
                    <CardDescription>
                      Published{' '}
                      {published.published_at ? format(new Date(published.published_at), 'dd MMM yyyy') : '—'}
                      {published.term_sheet_date && <span className="ml-2">• Dated: {format(new Date(published.term_sheet_date), 'dd MMM yyyy')}</span>}
                      {published.vehicle && <span className="ml-2">• {published.vehicle}</span>}
                    </CardDescription>
                  </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => openEditor('edit', published)}
                disabled={isSubmitting}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => openEditor('clone', published)}
                disabled={isSubmitting}
              >
                <Copy className="h-4 w-4" />
                Clone
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fileInputsRef.current[published.id]?.click()}
                disabled={uploadingAttachmentId === published.id}
              >
                {uploadingAttachmentId === published.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Attachment
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-blue-500/30 hover:bg-blue-500/10"
                onClick={() => handleGenerateTermsheet(published.id)}
                disabled={generatingId === published.id}
              >
                {generatingId === published.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4" />
                    Generate PDF
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-amber-500/30 hover:bg-amber-500/10"
                onClick={() => handleRequestClose(published.id)}
                disabled={requestingCloseId === published.id || !!published.closed_processed_at}
                title={published.closed_processed_at ? 'Already processed' : 'Request CEO approval to close this termsheet'}
              >
                {requestingCloseId === published.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <SendHorizontal className="h-4 w-4" />
                    Request Close
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-emerald-200">
                {published.term_sheet_attachment_key
                  ? 'Attachment available for investors to download.'
                  : 'No attachment uploaded yet.'}
              </div>
              {published.term_sheet_attachment_key && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-emerald-500/30 hover:bg-emerald-500/10"
                  onClick={() => openPreview(published.id)}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              )}
            </div>

            {/* Transaction Details */}
            <div>
              <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wide mb-3">Transaction Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Transaction Type</span>
                  <span className="text-foreground font-medium">{published.transaction_type || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Structure</span>
                  <span className="text-foreground font-medium">{published.structure || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Issuer</span>
                  <span className="text-foreground font-medium">{published.issuer || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Vehicle</span>
                  <span className="text-foreground font-medium">{published.vehicle || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Exclusive Arranger</span>
                  <span className="text-foreground font-medium">{published.exclusive_arranger || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Purchaser</span>
                  <span className="text-foreground font-medium">{published.purchaser || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Seller</span>
                  <span className="text-foreground font-medium">{published.seller || '—'}</span>
                </div>
              </div>
            </div>

            <Separator className="bg-emerald-400/20" />

            {/* Investment Terms */}
            <div>
              <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wide mb-3">Investment Terms</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Allocation Up To</span>
                  <span className="text-foreground font-medium">
                    {published.allocation_up_to ? published.allocation_up_to.toLocaleString() : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Price Per Share</span>
                  <span className="text-foreground font-medium">{getPricePerShareDisplay(published) || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Minimum Ticket</span>
                  <span className="text-foreground font-medium">
                    {published.minimum_ticket ? published.minimum_ticket.toLocaleString() : '—'}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="bg-emerald-400/20" />

            {/* Fee Structure */}
            <div>
              <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wide mb-3">Fee Structure</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Subscription Fee</span>
                  <span className="text-foreground font-medium">
                    {published.subscription_fee_percent != null
                      ? `${published.subscription_fee_percent}%`
                      : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Management Fee</span>
                  <span className="text-foreground font-medium">
                    {published.management_fee_percent != null
                      ? `${published.management_fee_percent}% p.a.`
                      : '—'}
                  </span>
                  {published.management_fee_clause && (
                    <span className="text-muted-foreground block text-xs mt-1 italic">{published.management_fee_clause}</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Carried Interest</span>
                  <span className="text-foreground font-medium">
                    {published.carried_interest_percent != null
                      ? `${published.carried_interest_percent}%`
                      : '—'}
                  </span>
                  {published.performance_fee_clause && (
                    <span className="text-muted-foreground block text-xs mt-1 italic">{published.performance_fee_clause}</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Legal Counsel</span>
                  <span className="text-foreground font-medium">{published.legal_counsel || '—'}</span>
                </div>
              </div>
            </div>

            <Separator className="bg-emerald-400/20" />

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wide mb-3">Timeline & Deadlines</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs">Interest Deadline</span>
                  <span className="text-foreground font-medium">
                    {published.interest_confirmation_deadline
                      ? format(new Date(published.interest_confirmation_deadline), 'dd MMM yyyy HH:mm')
                      : '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Completion Date</span>
                  <span className="text-foreground font-medium">
                    {published.completion_date
                      ? format(new Date(published.completion_date), 'dd MMM yyyy')
                      : published.completion_date_text || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Validity Date</span>
                  <span className="text-foreground font-medium">
                    {published.validity_date ? format(new Date(published.validity_date), 'dd MMM yyyy HH:mm') : '—'}
                  </span>
                </div>
              </div>
            </div>

            {published.term_sheet_html && (
              <>
                <Separator className="bg-emerald-400/20" />
                <div>
                  <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wide mb-3">Opportunity Summary</h4>
                  <div
                    className="space-y-2 text-sm text-emerald-50/90 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: published.term_sheet_html }}
                  />
                </div>
              </>
            )}

            <Separator className="bg-emerald-400/20" />

            {/* Linked Fee Plans Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wide flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Linked Fee Plans
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs h-7 border-emerald-500/30 hover:bg-emerald-500/10"
                  onClick={() => openFeePlanModal(published.id)}
                >
                  <Plus className="h-3 w-3" />
                  Create Fee Plan
                </Button>
              </div>

              {feePlansLoading ? (
                <div className="flex items-center gap-2 text-emerald-200/60 text-sm py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading fee plans...
                </div>
              ) : (feePlansByTermSheet[published.id] || []).length === 0 ? (
                <div className="text-sm text-emerald-200/60 py-2">
                  No fee plans linked to this term sheet yet. Create one to define commission terms for introducers or partners.
                </div>
              ) : (
                <div className="space-y-2">
                  {(feePlansByTermSheet[published.id] || []).map(fp => {
                    const entity = getEntityInfo(fp)
                    return (
                      <div
                        key={fp.id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50 border border-emerald-500/10"
                      >
                        <div className="flex items-center gap-3">
                          {entity && (
                            <div className="flex items-center gap-1 text-xs text-emerald-300/80">
                              <entity.icon className="h-3.5 w-3.5" />
                              <span>{entity.type}:</span>
                              <span className="font-medium text-emerald-100">{entity.name}</span>
                            </div>
                          )}
                          <span className="text-sm text-emerald-100 font-medium">{fp.name}</span>
                        </div>
                        <Badge className={`text-xs ${feePlanStatusClasses[fp.status] || feePlanStatusClasses.draft}`}>
                          {feePlanStatusLabels[fp.status] || fp.status}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
            ))}
          </div>
        </div>
      )}

      {/* Draft & Archived Versions */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Other Versions ({ordered.filter(t => t.status !== 'published').length})
        </h3>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {ordered.filter(termSheet => termSheet.status !== 'published').map(termSheet => (
          <Card key={termSheet.id} className="border-border bg-muted/50">
            <CardHeader className="flex items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-foreground text-lg">
                  Version {termSheet.version}
                </CardTitle>
                <CardDescription>
                  Created {format(new Date(termSheet.created_at), 'dd MMM yyyy')}
                  {termSheet.term_sheet_date && ` • Term Sheet Date: ${format(new Date(termSheet.term_sheet_date), 'dd MMM yyyy')}`}
                </CardDescription>
              </div>
              <Badge className={statusClasses[termSheet.status] ?? statusClasses.draft}>
                {termSheet.status.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {termSheet.term_sheet_attachment_key
                    ? 'Attachment uploaded.'
                    : 'No attachment uploaded yet.'}
                </div>
                {termSheet.term_sheet_attachment_key && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 h-7 text-xs"
                    onClick={() => openPreview(termSheet.id)}
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                )}
              </div>
              {/* Transaction Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Transaction Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-muted-foreground block text-xs">Transaction Type</span>
                    <span className="text-foreground font-medium">{termSheet.transaction_type || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Structure</span>
                    <span className="text-foreground font-medium">{termSheet.structure || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Issuer</span>
                    <span className="text-foreground font-medium">{termSheet.issuer || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Vehicle</span>
                    <span className="text-foreground font-medium">{termSheet.vehicle || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Arranger</span>
                    <span className="text-foreground font-medium">{termSheet.exclusive_arranger || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Purchaser</span>
                    <span className="text-foreground font-medium">{termSheet.purchaser || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Seller</span>
                    <span className="text-foreground font-medium">{termSheet.seller || '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Legal Counsel</span>
                    <span className="text-foreground font-medium">{termSheet.legal_counsel || '—'}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Investment Terms */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Investment Terms</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-muted-foreground block text-xs">Allocation</span>
                    <span className="text-foreground font-medium">
                      {termSheet.allocation_up_to ? termSheet.allocation_up_to.toLocaleString() : '—'}
                    </span>
                  </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Price Per Share</span>
                  <span className="text-foreground font-medium">{getPricePerShareDisplay(termSheet) || '—'}</span>
                </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Min Ticket</span>
                    <span className="text-foreground font-medium">
                      {termSheet.minimum_ticket ? termSheet.minimum_ticket.toLocaleString() : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Fee Structure */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fee Structure</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-muted-foreground block text-xs">Subscription Fee</span>
                    <span className="text-foreground font-medium">
                      {termSheet.subscription_fee_percent != null
                        ? `${termSheet.subscription_fee_percent}%`
                        : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Management Fee</span>
                    <span className="text-foreground font-medium">
                      {termSheet.management_fee_percent != null
                        ? `${termSheet.management_fee_percent}% p.a.`
                        : '—'}
                    </span>
                    {termSheet.management_fee_clause && (
                      <span className="text-muted-foreground block text-xs italic mt-1">{termSheet.management_fee_clause}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Carried Interest</span>
                    <span className="text-foreground font-medium">
                      {termSheet.carried_interest_percent != null
                        ? `${termSheet.carried_interest_percent}%`
                        : '—'}
                    </span>
                    {termSheet.performance_fee_clause && (
                      <span className="text-muted-foreground block text-xs italic mt-1">{termSheet.performance_fee_clause}</span>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Timeline */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Timeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-muted-foreground block text-xs">Interest Deadline</span>
                    <span className="text-foreground font-medium">
                      {termSheet.interest_confirmation_deadline
                        ? format(new Date(termSheet.interest_confirmation_deadline), 'dd MMM yyyy HH:mm')
                        : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Validity</span>
                    <span className="text-foreground font-medium">
                      {termSheet.validity_date ? format(new Date(termSheet.validity_date), 'dd MMM yyyy HH:mm') : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Completion Date</span>
                    <span className="text-foreground font-medium">
                      {termSheet.completion_date
                        ? format(new Date(termSheet.completion_date), 'dd MMM yyyy')
                        : termSheet.completion_date_text || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {termSheet.term_sheet_html && (
                <>
                  <div className="space-y-2 text-sm">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Opportunity Summary
                    </h4>
                  <div
                    className="space-y-2 text-sm text-foreground/90 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: termSheet.term_sheet_html }}
                  />
                  </div>
                  <Separator />
                </>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  ref={element => {
                    fileInputsRef.current[termSheet.id] = element
                  }}
                  onChange={event => {
                    const file = event.target.files?.[0]
                    if (file) {
                      handleAttachmentUpload(termSheet.id, file)
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => openEditor('clone', termSheet)}
                  disabled={isSubmitting}
                >
                  <Copy className="h-4 w-4" />
                  Clone
                </Button>
                {termSheet.status === 'draft' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => openEditor('edit', termSheet)}
                    disabled={isSubmitting}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                )}
                {termSheet.status !== 'published' && (
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => updateStatus(termSheet, 'published')}
                    disabled={isSubmitting}
                  >
                    <Rocket className="h-4 w-4" />
                    Publish
                  </Button>
                )}
                {termSheet.status !== 'archived' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-rose-300"
                    onClick={() => updateStatus(termSheet, 'archived')}
                    disabled={isSubmitting}
                  >
                    <Archive className="h-4 w-4" />
                    Archive
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => fileInputsRef.current[termSheet.id]?.click()}
                  disabled={uploadingAttachmentId === termSheet.id}
                >
                  {uploadingAttachmentId === termSheet.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Attachment
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleGenerateTermsheet(termSheet.id)}
                  disabled={generatingId === termSheet.id}
                >
                  {generatingId === termSheet.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-4 w-4" />
                      Generate PDF
                    </>
                  )}
                </Button>
              </div>

              {/* Linked Fee Plans - Only show for published term sheets */}
              {termSheet.status === 'published' && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                        <FileCheck className="h-3.5 w-3.5" />
                        Linked Fee Plans
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs h-6 px-2"
                        onClick={() => openFeePlanModal(termSheet.id)}
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </Button>
                    </div>

                    {feePlansLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground text-xs py-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading...
                      </div>
                    ) : (feePlansByTermSheet[termSheet.id] || []).length === 0 ? (
                      <div className="text-xs text-muted-foreground py-1">
                        No fee plans linked yet.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {(feePlansByTermSheet[termSheet.id] || []).map(fp => {
                          const entity = getEntityInfo(fp)
                          return (
                            <div
                              key={fp.id}
                              className="flex items-center justify-between py-1 px-2 rounded bg-muted/50 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {entity && (
                                  <span className="flex items-center gap-1 text-muted-foreground shrink-0">
                                    <entity.icon className="h-3 w-3" />
                                    {entity.name}
                                  </span>
                                )}
                                <span className="text-foreground truncate">{fp.name}</span>
                              </div>
                              <Badge className={`text-[10px] h-5 shrink-0 ${feePlanStatusClasses[fp.status] || feePlanStatusClasses.draft}`}>
                                {feePlanStatusLabels[fp.status] || fp.status}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
        {ordered.length === 0 && (
          <Card className="border border-dashed border-border bg-muted/50">
            <CardContent className="py-16 text-center space-y-3">
              <h4 className="text-lg font-semibold text-foreground">No term sheets yet</h4>
              <p className="text-sm text-muted-foreground">
                Create your first version to begin capturing structured economics and publishing investor-ready content.
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => openEditor('create')}
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4" />
                Create Term Sheet
              </Button>
            </CardContent>
          </Card>
        )}
        </div>
      </div>

      <Dialog open={editorOpen} onOpenChange={open => !open && closeEditor()}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editorMode === 'create' && 'Create Term Sheet'}
              {editorMode === 'edit' && 'Edit Term Sheet'}
              {editorMode === 'clone' && 'Clone Term Sheet'}
            </DialogTitle>
            <CardDescription>
              Populate the structured fields that sync with investor-facing term sheets.
            </CardDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="term_sheet_date">Term Sheet Date</Label>
                <Input
                  id="term_sheet_date"
                  type="date"
                  value={formValues.term_sheet_date}
                  onChange={event => setFormValues(prev => ({ ...prev, term_sheet_date: event.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="to_description">To</Label>
                <Input
                  id="to_description"
                  value={formValues.to_description}
                  onChange={event => setFormValues(prev => ({ ...prev, to_description: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction_type">Transaction Type</Label>
                <Input
                  id="transaction_type"
                  value={formValues.transaction_type}
                  onChange={event => setFormValues(prev => ({ ...prev, transaction_type: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="structure">Structure</Label>
                <Input
                  id="structure"
                  value={formValues.structure}
                  onChange={event => setFormValues(prev => ({ ...prev, structure: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allocation_up_to">Allocation “Up to”</Label>
                <Input
                  id="allocation_up_to"
                  type="number"
                  value={formValues.allocation_up_to}
                  onChange={event => setFormValues(prev => ({ ...prev, allocation_up_to: event.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="opportunity_summary">Opportunity Summary</Label>
              <p className="text-xs text-muted-foreground">
                Supports basic Markdown for emphasis, lists, and headings. The rendered HTML is stored for the investor view.
              </p>
              <Textarea
                id="opportunity_summary"
                rows={3}
                value={formValues.opportunity_summary}
                onChange={event => setFormValues(prev => ({ ...prev, opportunity_summary: event.target.value }))}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issuer">Issuer</Label>
                <Input
                  id="issuer"
                  placeholder="e.g., VERSO Capital"
                  value={formValues.issuer}
                  onChange={event => setFormValues(prev => ({ ...prev, issuer: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle</Label>
                <Input
                  id="vehicle"
                  placeholder="e.g., VERSO SPV 2025-01"
                  value={formValues.vehicle}
                  onChange={event => setFormValues(prev => ({ ...prev, vehicle: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exclusive_arranger">Exclusive Arranger</Label>
                <Input
                  id="exclusive_arranger"
                  placeholder="e.g., VERSO Management Limited"
                  value={formValues.exclusive_arranger}
                  onChange={event => setFormValues(prev => ({ ...prev, exclusive_arranger: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaser">Purchaser</Label>
                <Input
                  id="purchaser"
                  placeholder="e.g., Qualified Limited Partners"
                  value={formValues.purchaser}
                  onChange={event => setFormValues(prev => ({ ...prev, purchaser: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seller">Seller</Label>
                <Input
                  id="seller"
                  placeholder="e.g., GP of Transform Capital"
                  value={formValues.seller}
                  onChange={event => setFormValues(prev => ({ ...prev, seller: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legal_counsel">Legal Counsel</Label>
                <Input
                  id="legal_counsel"
                  placeholder="e.g., Dupont & Partners Law Firm"
                  value={formValues.legal_counsel}
                  onChange={event => setFormValues(prev => ({ ...prev, legal_counsel: event.target.value }))}
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_per_share">Price per Share</Label>
                <Input
                  id="price_per_share"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 10.00"
                  value={formValues.price_per_share}
                  onChange={event => setFormValues(prev => ({ ...prev, price_per_share: event.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Numeric price used for calculations and display
                </p>
              </div>
            </div>

            {/* Cost & Spread - CEO/Staff only */}
            {canViewCost && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="space-y-2">
                  <Label htmlFor="cost_per_share" className="text-amber-200">Cost per Share (Internal)</Label>
                  <Input
                    id="cost_per_share"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 8.00"
                    value={formValues.cost_per_share}
                    onChange={event => setFormValues(prev => ({ ...prev, cost_per_share: event.target.value }))}
                    className="border-amber-500/30"
                  />
                  <p className="text-xs text-amber-200/70">
                    VERSO's acquisition cost (not shown to investors)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-amber-200">Spread per Share</Label>
                  <div className="h-10 px-3 rounded-md bg-background/50 border border-amber-500/30 flex items-center text-sm font-medium">
                    {(() => {
                      const price = parseFloat(formValues.price_per_share) || 0
                      const cost = parseFloat(formValues.cost_per_share) || 0
                      if (price > 0 && cost > 0) {
                        const spread = price - cost
                        return `${spread.toFixed(2)}`
                      }
                      return '—'
                    })()}
                  </div>
                  <p className="text-xs text-amber-200/70">
                    Calculated: price − cost
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-amber-200">Margin %</Label>
                  <div className="h-10 px-3 rounded-md bg-background/50 border border-amber-500/30 flex items-center text-sm font-medium">
                    {(() => {
                      const price = parseFloat(formValues.price_per_share) || 0
                      const cost = parseFloat(formValues.cost_per_share) || 0
                      if (price > 0 && cost > 0) {
                        const margin = ((price - cost) / cost) * 100
                        return `${margin.toFixed(1)}%`
                      }
                      return '—'
                    })()}
                  </div>
                  <p className="text-xs text-amber-200/70">
                    Margin on cost
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimum_ticket">Minimum Ticket</Label>
                <Input
                  id="minimum_ticket"
                  type="number"
                  value={formValues.minimum_ticket}
                  onChange={event => setFormValues(prev => ({ ...prev, minimum_ticket: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subscription_fee_percent">Subscription Fee %</Label>
                <Input
                  id="subscription_fee_percent"
                  type="number"
                  step="0.01"
                  value={formValues.subscription_fee_percent}
                  onChange={event => setFormValues(prev => ({ ...prev, subscription_fee_percent: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="management_fee_percent">Management Fee %</Label>
                <Input
                  id="management_fee_percent"
                  type="number"
                  step="0.01"
                  value={formValues.management_fee_percent}
                  onChange={event => setFormValues(prev => ({ ...prev, management_fee_percent: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carried_interest_percent">Carried Interest %</Label>
                <Input
                  id="carried_interest_percent"
                  type="number"
                  step="0.01"
                  value={formValues.carried_interest_percent}
                  onChange={event => setFormValues(prev => ({ ...prev, carried_interest_percent: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="management_fee_clause">Management Fee Clause</Label>
                <p className="text-xs text-muted-foreground">
                  Optional descriptive text (e.g., "Waived instead of 2.00% per annum")
                </p>
                <Input
                  id="management_fee_clause"
                  placeholder="e.g., Waived (instead of 2.00% per annum)"
                  value={formValues.management_fee_clause}
                  onChange={event => setFormValues(prev => ({ ...prev, management_fee_clause: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="performance_fee_clause">Performance Fee Clause</Label>
                <p className="text-xs text-muted-foreground">
                  Optional descriptive text (e.g., "Waived instead of 20% no hurdle")
                </p>
                <Input
                  id="performance_fee_clause"
                  placeholder="e.g., Waived (instead of 20.00% no hurdle rate)"
                  value={formValues.performance_fee_clause}
                  onChange={event => setFormValues(prev => ({ ...prev, performance_fee_clause: event.target.value }))}
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interest_confirmation_deadline">Interest Confirmation Deadline</Label>
                <Input
                  id="interest_confirmation_deadline"
                  type="datetime-local"
                  value={formValues.interest_confirmation_deadline}
                  onChange={event => setFormValues(prev => ({ ...prev, interest_confirmation_deadline: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validity_date">Validity Date</Label>
                <Input
                  id="validity_date"
                  type="datetime-local"
                  value={formValues.validity_date}
                  onChange={event => setFormValues(prev => ({ ...prev, validity_date: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="completion_date">Completion Date</Label>
                <Input
                  id="completion_date"
                  type="date"
                  value={formValues.completion_date}
                  onChange={event => setFormValues(prev => ({ ...prev, completion_date: event.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  When set, enables automatic CEO approval for deal closing.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capital_call_timeline">Capital Call Timeline</Label>
              <Textarea
                id="capital_call_timeline"
                rows={2}
                value={formValues.capital_call_timeline}
                onChange={event => setFormValues(prev => ({ ...prev, capital_call_timeline: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="completion_date_text">Completion Date Text</Label>
              <Textarea
                id="completion_date_text"
                rows={2}
                value={formValues.completion_date_text}
                onChange={event => setFormValues(prev => ({ ...prev, completion_date_text: event.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Optional override shown in the term sheet. Defaults to "By [Completion Date]".
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="in_principle_approval_text">In-Principle Approval Text</Label>
                <Textarea
                  id="in_principle_approval_text"
                  rows={2}
                  value={formValues.in_principle_approval_text}
                  onChange={event => setFormValues(prev => ({ ...prev, in_principle_approval_text: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subscription_pack_note">Subscription Pack Note</Label>
                <Textarea
                  id="subscription_pack_note"
                  rows={2}
                  value={formValues.subscription_pack_note}
                  onChange={event => setFormValues(prev => ({ ...prev, subscription_pack_note: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="share_certificates_note">Share Certificates Note</Label>
                <Textarea
                  id="share_certificates_note"
                  rows={2}
                  value={formValues.share_certificates_note}
                  onChange={event => setFormValues(prev => ({ ...prev, share_certificates_note: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject_to_change_note">Subject to Change Note</Label>
                <Textarea
                  id="subject_to_change_note"
                  rows={2}
                  value={formValues.subject_to_change_note}
                  onChange={event => setFormValues(prev => ({ ...prev, subject_to_change_note: event.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={closeEditor}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={submitForm} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Term Sheet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fee Plan Creation Modal */}
      <FeePlanEditModal
        open={feePlanModalOpen}
        onClose={closeFeePlanModal}
        onSuccess={handleFeePlanSuccess}
        dealId={dealId}
        initialTermSheetId={selectedTermSheetIdForFeePlan}
      />

      {/* Document Preview - Fullscreen Viewer */}
      <DocumentViewerFullscreen
        isOpen={previewOpen}
        document={previewDocument}
        previewUrl={previewUrl}
        isLoading={previewLoading}
        error={previewError}
        onClose={closePreview}
        onDownload={handleDownload}
      />
    </div>
  )
}
