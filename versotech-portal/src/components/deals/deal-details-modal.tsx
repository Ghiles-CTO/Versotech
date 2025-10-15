'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  Download,
  FileText,
  Globe,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { InterestModal } from './interest-modal'
import { NotifySimilarButton } from './notify-similar-button'

interface DealDetailsModalProps {
  deal: DealDetailsData
  investorId: string
  children: React.ReactNode
}

interface DealDetailsData {
  id: string
  name: string
  status: string
  deal_type: string
  currency: string
  offer_unit_price: number | null
  open_at: string | null
  close_at: string | null
  company_name?: string | null
  company_logo_url?: string | null
  company_website?: string | null
  sector?: string | null
  stage?: string | null
  location?: string | null
  vehicles?: {
    id: string
    name: string
    type: string
  }
  fee_plans: Array<{
    id: string
    name: string
    description: string | null
    is_default: boolean
  }>
  fee_structures?: FeeStructure[] | null
  interest?: DealInterest | null
  data_room_access?: DataRoomAccess | null
  subscription?: SubscriptionSubmission | null
}

interface FeeStructure {
  id: string
  deal_id: string
  allocation_up_to: number | null
  price_per_share_text: string | null
  minimum_ticket: number | null
  maximum_ticket: number | null
  term_sheet_date: string | null
  transaction_type: string | null
  opportunity_summary: string | null
  issuer: string | null
  vehicle: string | null
  exclusive_arranger: string | null
  purchaser: string | null
  seller: string | null
  structure: string | null
  subscription_fee_percent: number | null
  management_fee_percent: number | null
  carried_interest_percent: number | null
  legal_counsel: string | null
  interest_confirmation_deadline: string | null
  capital_call_timeline: string | null
  completion_date_text: string | null
  in_principle_approval_text: string | null
  subscription_pack_note: string | null
  share_certificates_note: string | null
  subject_to_change_note: string | null
  validity_date: string | null
  term_sheet_attachment_key: string | null
  effective_at?: string | null
  published_at?: string | null
  created_at?: string | null
}

interface DealInterest {
  id: string
  status: 'pending_review' | 'approved' | 'rejected' | 'withdrawn'
  indicative_amount: number | null
  indicative_currency: string | null
}

interface DataRoomAccess {
  id: string
  granted_at: string
  expires_at: string | null
}

interface SubscriptionSubmission {
  id: string
  status: string
  submitted_at: string
}

const statusBadgeClasses: Record<string, string> = {
  draft: 'bg-slate-200 text-slate-700',
  open: 'bg-emerald-100 text-emerald-700',
  allocation_pending: 'bg-amber-100 text-amber-700',
  closed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-rose-100 text-rose-700'
}

const interestStatusCopy: Record<DealInterest['status'], { label: string; tone: string }> = {
  pending_review: { label: 'Pending team review', tone: 'bg-amber-100 text-amber-700' },
  approved: { label: 'NDA active', tone: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Declined', tone: 'bg-rose-100 text-rose-700' },
  withdrawn: { label: 'Withdrawn', tone: 'bg-slate-100 text-slate-600' }
}

function normalizeCurrency(currency?: string | null) {
  if (!currency) return 'USD'
  return currency.length === 3 ? currency.toUpperCase() : currency.toUpperCase().slice(0, 3)
}

function formatCurrency(value: number | null | undefined, currency?: string | null) {
  if (!value || Number.isNaN(value)) return '—'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizeCurrency(currency),
      maximumFractionDigits: value >= 1000 ? 0 : 2
    }).format(value)
  } catch {
    return `${currency ?? ''} ${value.toLocaleString()}`
  }
}

function formatDate(value: string | null | undefined, fallback = '—') {
  if (!value) return fallback
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return fallback
  return parsed.toLocaleDateString()
}

function pickLatestStructure(structures: FeeStructure[] = []) {
  return structures.reduce<FeeStructure | null>((result, structure) => {
    if (!result) return structure

    const timestamp = new Date(
      structure.effective_at ??
        structure.published_at ??
        structure.validity_date ??
        structure.term_sheet_date ??
        structure.created_at ??
        new Date().toISOString()
    ).getTime()

    const resultTimestamp = new Date(
      result.effective_at ??
        result.published_at ??
        result.validity_date ??
        result.term_sheet_date ??
        result.created_at ??
        new Date().toISOString()
    ).getTime()

    return timestamp > resultTimestamp ? structure : result
  }, null)
}

export function DealDetailsModal({ deal, investorId, children }: DealDetailsModalProps) {
  const [open, setOpen] = useState(false)
  const [termSheet, setTermSheet] = useState<FeeStructure | null>(
    pickLatestStructure(deal.fee_structures ?? [])
  )
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const supabase = createClient()

  const ensureTermSheet = useCallback(async () => {
    if (termSheet) return

    const { data, error } = await supabase
      .from('deal_fee_structures')
      .select('*')
      .eq('deal_id', deal.id)
      .eq('status', 'published')
      .order('effective_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Failed to fetch term sheet', error)
      return
    }

    if (data && data.length > 0) {
      setTermSheet(data[0] as FeeStructure)
    }
  }, [deal.id, supabase, termSheet])

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
  }

  useEffect(() => {
    if (open) {
      ensureTermSheet()
    }
  }, [ensureTermSheet, open])

  const handleDownload = useCallback(async () => {
    if (!termSheet?.term_sheet_attachment_key) return

    setDownloading(true)
    setDownloadError(null)

    try {
      const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET_NAME || 'documents'
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(termSheet.term_sheet_attachment_key, 60)

      if (error || !data?.signedUrl) {
        throw error || new Error('Unable to generate download link')
      }

      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Failed to download term sheet', error)
      setDownloadError('Unable to download the term sheet right now.')
    } finally {
      setDownloading(false)
    }
  }, [supabase, termSheet])

  const dealStatusBadge = statusBadgeClasses[deal.status] ?? statusBadgeClasses.draft

  const termSheetRows = useMemo(() => {
    if (!termSheet) return []

    return [
      { label: 'Date', value: formatDate(termSheet.term_sheet_date) },
      { label: 'Transaction Type', value: termSheet.transaction_type ?? '—' },
      { label: 'Opportunity', value: termSheet.opportunity_summary ?? '—' },
      { label: 'Issuer', value: termSheet.issuer ?? deal.company_name ?? '—' },
      { label: 'Vehicle', value: termSheet.vehicle ?? deal.vehicles?.name ?? '—' },
      { label: 'Exclusive Arranger', value: termSheet.exclusive_arranger ?? '—' },
      { label: 'Seller', value: termSheet.seller ?? '—' },
      { label: 'Structure', value: termSheet.structure ?? '—' },
      {
        label: 'Allocation “Up to”',
        value: formatCurrency(termSheet.allocation_up_to, deal.currency)
      },
      {
        label: 'Price per Share',
        value:
          termSheet.price_per_share_text ??
          (deal.offer_unit_price ? `${formatCurrency(deal.offer_unit_price, deal.currency)} per unit` : '—')
      },
      {
        label: 'Minimum Ticket',
        value: formatCurrency(termSheet.minimum_ticket, deal.currency)
      },
      {
        label: 'Maximum Ticket',
        value: formatCurrency(termSheet.maximum_ticket, deal.currency)
      },
      {
        label: 'Subscription Fee %',
        value: termSheet.subscription_fee_percent !== null
          ? `${(termSheet.subscription_fee_percent * 100).toFixed(2)}%`
          : '—'
      },
      {
        label: 'Management Fee %',
        value: termSheet.management_fee_percent !== null
          ? `${(termSheet.management_fee_percent * 100).toFixed(2)}%`
          : '—'
      },
      {
        label: 'Carried Interest %',
        value: termSheet.carried_interest_percent !== null
          ? `${(termSheet.carried_interest_percent * 100).toFixed(2)}%`
          : '—'
      },
      { label: 'Legal Counsel', value: termSheet.legal_counsel ?? '—' },
      {
        label: 'Interest Confirmation Deadline',
        value: formatDate(termSheet.interest_confirmation_deadline)
      },
      { label: 'Capital Call Timeline', value: termSheet.capital_call_timeline ?? '—' },
      { label: 'Completion Date', value: termSheet.completion_date_text ?? '—' },
      {
        label: 'In-Principle Approval',
        value: termSheet.in_principle_approval_text ?? '—'
      },
      {
        label: 'Subscription Pack',
        value: termSheet.subscription_pack_note ?? 'Available on approval'
      },
      {
        label: 'Share Certificates',
        value: termSheet.share_certificates_note ?? 'Issued post-completion'
      },
      {
        label: 'Subject to Change',
        value: termSheet.subject_to_change_note ?? 'Terms subject to final approvals'
      },
      { label: 'Validity', value: formatDate(termSheet.validity_date, 'Valid until notice') }
    ]
  }, [deal.company_name, deal.currency, deal.offer_unit_price, deal.vehicles?.name, termSheet])

  const hasInterest = Boolean(deal.interest)
  const interestMeta = deal.interest ? interestStatusCopy[deal.interest.status] : null
  const ndaActive = Boolean(deal.data_room_access)
  const subscriptionStatus = deal.subscription?.status ?? null
  const isClosed = deal.status === 'closed'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {deal.company_logo_url ? (
                <Image
                  src={deal.company_logo_url}
                  alt={`${deal.company_name ?? deal.name} logo`}
                  width={48}
                  height={48}
                  className="rounded-lg object-contain bg-white border border-gray-200 p-2"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-semibold">
                  {deal.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-semibold text-gray-900">{deal.name}</span>
                  <Badge className={dealStatusBadge}>
                    {deal.status.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  {deal.company_name ?? 'Issuer pending'} • {deal.deal_type.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
            {deal.company_website && (
              <Link
                href={deal.company_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                Visit company site
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </DialogTitle>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              {deal.stage && (
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Stage: {deal.stage}
                </span>
              )}
              {deal.sector && (
                <span className="inline-flex items-center gap-1">
                  <Globe className="h-4 w-4 text-sky-500" />
                  Sector: {deal.sector}
                </span>
              )}
              {deal.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-rose-500" />
                  {deal.location}
                </span>
              )}
              {deal.vehicles?.name && (
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Vehicle: {deal.vehicles.name} ({deal.vehicles.type})
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              {deal.open_at && (
                <span>
                  Opens {formatDate(deal.open_at)}
                </span>
              )}
              {deal.close_at && (
                <span>
                  Closes {formatDate(deal.close_at)}
                </span>
              )}
              {termSheet?.completion_date_text && (
                <span>Completion {termSheet.completion_date_text}</span>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Your pipeline</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">Interest</p>
                {hasInterest && interestMeta ? (
                  <Badge className={interestMeta.tone}>{interestMeta.label}</Badge>
                ) : (
                  <span className="text-sm text-gray-600">No signal submitted yet</span>
                )}
                {deal.interest?.indicative_amount && (
                  <p className="text-xs text-gray-500">
                    Indicative amount:{' '}
                    <span className="font-medium">
                      {formatCurrency(
                        deal.interest.indicative_amount,
                        deal.interest.indicative_currency ?? deal.currency
                      )}
                    </span>
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">NDA</p>
                {ndaActive ? (
                  <>
                    <Badge className="bg-emerald-100 text-emerald-700">Data room access granted</Badge>
                    {deal.data_room_access?.expires_at && (
                      <p className="text-xs text-gray-500">
                        Expires {formatDate(deal.data_room_access.expires_at)}
                      </p>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-gray-600">Pending NDA approval</span>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">Subscription</p>
                {subscriptionStatus ? (
                  <Badge className="bg-indigo-100 text-indigo-700 capitalize">
                    {subscriptionStatus.replace(/_/g, ' ')}
                  </Badge>
                ) : (
                  <span className="text-sm text-gray-600">Not submitted yet</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    Term sheet overview
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Key economics and milestones maintained by the VERSO team.
                  </p>
                </div>
                {termSheet?.term_sheet_attachment_key && (
                  <Button onClick={handleDownload} disabled={downloading} variant="outline" className="gap-2">
                    {downloading ? (
                      <>
                        <Download className="h-4 w-4 animate-spin" />
                        Generating link…
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {termSheet ? (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <dl className="grid grid-cols-1 md:grid-cols-2">
                    {termSheetRows.map(({ label, value }) => (
                      <div
                        key={label}
                        className="px-4 py-3 border-b border-gray-200 md:border-r last:border-r-0 md:last:border-b-0"
                      >
                        <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
                        <dd className="text-sm font-medium text-gray-900 mt-1">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Term sheet details will appear here once published.
                </div>
              )}
              {downloadError && (
                <p className="text-xs text-rose-600 mt-3">{downloadError}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Next steps</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-gray-600 space-y-1">
                <p>Have a question for the team or want to confirm details?</p>
                <p>Use the shortcuts below to continue the workflow.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/versoholdings/messages?deal=${deal.id}`}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <MessageSquare className="h-4 w-4" />
                  Ask a question
                </Link>
                {isClosed ? (
                  <NotifySimilarButton dealId={deal.id} investorId={investorId} />
                ) : (
                  <InterestModal
                    dealId={deal.id}
                    dealName={deal.name}
                    currency={deal.currency}
                    investorId={investorId}
                    defaultAmount={deal.interest?.indicative_amount ?? null}
                  >
                    <Button className="gap-2">
                      I&apos;m interested
                      <BadgeCheck className="h-4 w-4" />
                    </Button>
                  </InterestModal>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="border border-gray-200 rounded-lg p-4 text-xs text-gray-500 space-y-2">
            <p className="font-medium text-gray-600">Notes</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Indicative terms remain subject to final approvals and due diligence.</li>
              <li>
                Data room access is time-bound; request an extension if additional review time is required.
              </li>
              <li>
                Subscription packs will be shared once NDA compliance and KYC requirements are satisfied.
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="text-xs text-gray-400">
          Need help? Email{' '}
          <a href="mailto:investors@versotech.com" className="underline">
            investors@versotech.com
          </a>{' '}
          and reference deal ID {deal.id}.
        </div>
      </DialogContent>
    </Dialog>
  )
}
