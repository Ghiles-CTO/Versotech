'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  FileUp,
  Image as ImageIcon,
  Loader2,
  PencilLine,
  Plus,
  RefreshCcw,
  Save,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'

import { MarketingAnnouncementsCarousel } from '@/components/dashboard/marketing-announcements-carousel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  MARKETING_BADGE_LABELS,
  type MarketingCard,
  type MarketingCardMediaType,
  type MarketingCardStatus,
  type MarketingCardType,
  type MarketingLead,
} from '@/types/dashboard-marketing'

/* ── Type badge colours for card list ─────────────────────────────── */

const TYPE_DOT_COLORS: Record<string, string> = {
  opportunity: 'bg-amber-500',
  event: 'bg-violet-500',
  news: 'bg-sky-500',
}

const TYPE_BADGE_COLORS: Record<string, string> = {
  opportunity:
    'border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-400',
  event:
    'border-violet-200/80 bg-violet-50 text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-400',
  news: 'border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-400',
}

const TYPE_THUMB_BG: Record<string, string> = {
  opportunity: 'bg-amber-50 dark:bg-amber-950/30',
  event: 'bg-violet-50 dark:bg-violet-950/30',
  news: 'bg-sky-50 dark:bg-sky-950/30',
}

/* ── Form state helpers ───────────────────────────────────────────── */

type MarketingCardFormState = {
  id: string | null
  card_type: MarketingCardType
  status: MarketingCardStatus
  title: string
  summary: string
  media_type: MarketingCardMediaType
  image_url: string
  image_storage_path: string
  video_url: string
  video_storage_path: string
  external_url: string
  link_domain: string
  source_published_at: string
  metadata_json: Record<string, unknown> | null
  cta_enabled: boolean
  cta_label: string
}

function createEmptyFormState(): MarketingCardFormState {
  return {
    id: null,
    card_type: 'opportunity',
    status: 'draft',
    title: '',
    summary: '',
    media_type: 'image',
    image_url: '',
    image_storage_path: '',
    video_url: '',
    video_storage_path: '',
    external_url: '',
    link_domain: '',
    source_published_at: '',
    metadata_json: null,
    cta_enabled: true,
    cta_label: "I'm interested",
  }
}

function createNextFormState(
  current: MarketingCardFormState
): MarketingCardFormState {
  const next = createEmptyFormState()

  if (current.card_type === 'news') {
    return {
      ...next,
      card_type: 'news',
      media_type: 'link',
      cta_enabled: true,
      cta_label: 'Open',
    }
  }

  return {
    ...next,
    card_type: current.card_type,
    media_type: current.media_type === 'link' ? 'image' : current.media_type,
  }
}

function toFormState(card: MarketingCard): MarketingCardFormState {
  const isNewsCard = card.card_type === 'news'

  return {
    id: card.id,
    card_type: card.card_type,
    status: card.status,
    title: card.title,
    summary: card.summary,
    media_type: isNewsCard ? 'link' : card.media_type,
    image_url: card.image_url ?? '',
    image_storage_path: card.image_storage_path ?? '',
    video_url: isNewsCard ? '' : (card.video_url ?? ''),
    video_storage_path: isNewsCard ? '' : (card.video_storage_path ?? ''),
    external_url: card.external_url ?? '',
    link_domain: card.link_domain ?? '',
    source_published_at: card.source_published_at ?? '',
    metadata_json: card.metadata_json ?? null,
    cta_enabled: isNewsCard ? card.cta_enabled : true,
    cta_label: isNewsCard ? (card.cta_label ?? 'Open') : "I'm interested",
  }
}

function formToPayload(form: MarketingCardFormState, sortOrder: number) {
  const isNewsCard = form.card_type === 'news'
  const mediaType = isNewsCard ? 'link' : form.media_type

  return {
    card_type: form.card_type,
    status: form.status,
    title: form.title,
    summary: form.summary,
    media_type: mediaType,
    image_url: form.image_url || null,
    image_storage_path: form.image_storage_path || null,
    video_url: mediaType === 'video' ? form.video_url || null : null,
    video_storage_path:
      mediaType === 'video' ? form.video_storage_path || null : null,
    external_url: form.external_url || null,
    link_domain: form.link_domain || null,
    source_published_at: form.source_published_at || null,
    metadata_json: form.metadata_json,
    cta_enabled: isNewsCard ? form.cta_enabled : true,
    cta_label: isNewsCard
      ? form.cta_enabled
        ? form.cta_label || 'Open'
        : null
      : "I'm interested",
    sort_order: sortOrder,
  }
}

function formToPreviewCard(form: MarketingCardFormState): MarketingCard {
  const isNewsCard = form.card_type === 'news'
  const mediaType = isNewsCard ? 'link' : form.media_type

  return {
    id: form.id ?? 'preview-card',
    card_type: form.card_type,
    status: form.status,
    title: form.title || 'Preview title',
    summary: form.summary || 'Preview summary',
    media_type: mediaType,
    image_url: form.image_url || null,
    image_storage_path: form.image_storage_path || null,
    video_url: mediaType === 'video' ? form.video_url || null : null,
    video_storage_path:
      mediaType === 'video' ? form.video_storage_path || null : null,
    external_url: form.external_url || null,
    link_domain: form.link_domain || null,
    source_published_at: form.source_published_at || null,
    metadata_json: form.metadata_json,
    cta_enabled: isNewsCard ? form.cta_enabled : true,
    cta_label: isNewsCard
      ? form.cta_enabled
        ? form.cta_label || 'Open'
        : null
      : "I'm interested",
    sort_order: 0,
    published_at: null,
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function hasFormContent(form: MarketingCardFormState): boolean {
  return Boolean(
    form.id ||
    form.title.trim() ||
    form.summary.trim() ||
    form.image_url.trim() ||
    form.video_url.trim() ||
    form.external_url.trim()
  )
}

function areFormsEqual(
  left: MarketingCardFormState,
  right: MarketingCardFormState
): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

/* ── Main component ───────────────────────────────────────────────── */

export function MarketingAdminClient() {
  const [cards, setCards] = useState<MarketingCard[]>([])
  const [leads, setLeads] = useState<MarketingLead[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<
    'image' | 'video' | null
  >(null)
  const [fetchingMetadata, setFetchingMetadata] = useState(false)
  const [form, setForm] = useState<MarketingCardFormState>(
    createEmptyFormState()
  )
  const [formBaseline, setFormBaseline] = useState<MarketingCardFormState>(
    createEmptyFormState()
  )
  const isEditing = Boolean(form.id)
  const hasUnsavedChanges = !areFormsEqual(form, formBaseline)
  const isNewsCard = form.card_type === 'news'

  const publishedCards = useMemo(
    () => cards.filter((card) => card.status === 'published'),
    [cards]
  )

  const draftCards = useMemo(
    () => cards.filter((card) => card.status === 'draft'),
    [cards]
  )

  const workingPreviewCards = useMemo(() => {
    if (!hasFormContent(form)) {
      return [...cards].sort(
        (left, right) => left.sort_order - right.sort_order
      )
    }

    const previewCard = formToPreviewCard(form)

    if (form.id) {
      return cards
        .map((card) =>
          card.id === form.id
            ? { ...previewCard, sort_order: card.sort_order }
            : card
        )
        .sort((left, right) => left.sort_order - right.sort_order)
    }

    return [...cards, { ...previewCard, sort_order: cards.length }].sort(
      (left, right) => left.sort_order - right.sort_order
    )
  }, [cards, form])

  const loadData = async () => {
    setLoading(true)
    try {
      const [cardsResponse, leadsResponse] = await Promise.all([
        fetch('/api/admin/marketing/cards', { cache: 'no-store' }),
        fetch('/api/admin/marketing/leads', { cache: 'no-store' }),
      ])

      if (!cardsResponse.ok || !leadsResponse.ok) {
        throw new Error('Failed to load marketing data')
      }

      const cardsPayload = await cardsResponse.json()
      const leadsPayload = await leadsResponse.json()
      setCards(cardsPayload.items ?? [])
      setLeads(leadsPayload.items ?? [])
    } catch (error) {
      console.error('[marketing-admin] Failed to load data:', error)
      toast.error('Failed to load marketing data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const updateForm = (updates: Partial<MarketingCardFormState>) => {
    setForm((current) => ({ ...current, ...updates }))
  }

  const setCardType = (cardType: MarketingCardType) => {
    setForm((current) => ({
      ...current,
      card_type: cardType,
      media_type:
        cardType === 'news'
          ? 'link'
          : current.card_type === 'news' && current.media_type === 'link'
            ? 'image'
            : current.media_type,
      video_url: cardType === 'news' ? '' : current.video_url,
      video_storage_path: cardType === 'news' ? '' : current.video_storage_path,
      external_url: current.external_url,
      cta_enabled: cardType === 'news' ? current.cta_enabled : true,
      cta_label:
        cardType === 'news'
          ? !current.cta_label || current.cta_label === "I'm interested"
            ? 'Open'
            : current.cta_label
          : "I'm interested",
    }))
  }

  const applyFormState = (nextForm: MarketingCardFormState) => {
    setForm(nextForm)
    setFormBaseline(nextForm)
  }

  const confirmDiscardChanges = () => {
    if (!hasUnsavedChanges) return true

    return window.confirm('Discard your unsaved changes?')
  }

  const startNewCard = () => {
    if (!confirmDiscardChanges()) {
      return
    }

    applyFormState(createEmptyFormState())
  }

  const resetForm = () => {
    if (!confirmDiscardChanges()) {
      return
    }

    applyFormState({ ...formBaseline })
  }

  const editCard = (card: MarketingCard) => {
    if (form.id === card.id && !hasUnsavedChanges) {
      return
    }

    if (!confirmDiscardChanges()) {
      return
    }

    applyFormState(toFormState(card))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const sortOrder = form.id
        ? (cards.find((card) => card.id === form.id)?.sort_order ??
          cards.length)
        : cards.length

      const payload = formToPayload(form, sortOrder)
      const url = form.id
        ? `/api/admin/marketing/cards/${form.id}`
        : '/api/admin/marketing/cards'
      const method = form.id ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        throw new Error(
          errorPayload?.error?.formErrors?.[0] ||
            errorPayload?.error ||
            'Failed to save card'
        )
      }

      const savedCard = (await response.json()) as MarketingCard
      const wasEditing = Boolean(form.id)
      toast.success(wasEditing ? 'Card updated' : 'Card created')
      await loadData()
      applyFormState(
        wasEditing ? toFormState(savedCard) : createNextFormState(form)
      )
    } catch (error) {
      console.error('[marketing-admin] Failed to save card:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to save card'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (card: MarketingCard) => {
    if (!window.confirm(`Delete "${card.title}" permanently?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/marketing/cards/${card.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete card')
      }

      toast.success('Card deleted')
      if (form.id === card.id) {
        applyFormState(createEmptyFormState())
      }
      await loadData()
    } catch (error) {
      console.error('[marketing-admin] Failed to delete card:', error)
      toast.error('Failed to delete card')
    }
  }

  const handlePublishToggle = async (card: MarketingCard) => {
    if (form.id === card.id && hasUnsavedChanges) {
      toast.error(
        'Save or reset your current edits before changing publish status'
      )
      return
    }

    const nextStatus: MarketingCardStatus =
      card.status === 'published' ? 'draft' : 'published'

    try {
      const response = await fetch(`/api/admin/marketing/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      const updatedCard = (await response.json()) as MarketingCard
      toast.success(
        nextStatus === 'published' ? 'Card published' : 'Card moved to draft'
      )
      if (form.id === updatedCard.id) {
        applyFormState(toFormState(updatedCard))
      }
      await loadData()
    } catch (error) {
      console.error('[marketing-admin] Failed to update status:', error)
      toast.error('Failed to update card status')
    }
  }

  const handleMove = async (cardId: string, direction: -1 | 1) => {
    const currentIndex = cards.findIndex((card) => card.id === cardId)
    const nextIndex = currentIndex + direction

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= cards.length) {
      return
    }

    const nextOrder = [...cards]
    const [moved] = nextOrder.splice(currentIndex, 1)
    nextOrder.splice(nextIndex, 0, moved)

    try {
      const response = await fetch('/api/admin/marketing/cards/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: nextOrder.map((card) => card.id) }),
      })

      if (!response.ok) {
        throw new Error('Failed to reorder cards')
      }

      setCards(nextOrder.map((card, index) => ({ ...card, sort_order: index })))
      toast.success('Order updated')
      await loadData()
    } catch (error) {
      console.error('[marketing-admin] Failed to reorder cards:', error)
      toast.error('Failed to reorder cards')
    }
  }

  const handleIngestMetadata = async () => {
    if (!form.external_url) {
      toast.error('Enter an article URL first')
      return
    }

    setFetchingMetadata(true)
    try {
      const response = await fetch('/api/admin/marketing/ingest-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: form.external_url }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch article metadata')
      }

      const metadata = await response.json()

      if (metadata.error) {
        throw new Error(
          typeof metadata.error === 'string'
            ? metadata.error
            : 'Server returned an error'
        )
      }

      if (!metadata.title && !metadata.summary && !metadata.imageUrl) {
        toast.warning(
          'No metadata found for this URL — fields were not updated.'
        )
        return
      }

      setForm((current) => ({
        ...current,
        card_type: 'news',
        media_type: 'link',
        title: metadata.title || current.title,
        summary: metadata.summary || current.summary,
        image_url: metadata.imageUrl || current.image_url,
        external_url: metadata.externalUrl || current.external_url,
        link_domain: metadata.linkDomain || current.link_domain,
        source_published_at:
          metadata.sourcePublishedAt || current.source_published_at,
        metadata_json: metadata.metadata ?? current.metadata_json,
        cta_enabled: current.cta_enabled,
        cta_label: current.cta_label || 'Open',
      }))
      toast.success('Article metadata loaded')
    } catch (error) {
      console.error('[marketing-admin] Failed to ingest metadata:', error)
      toast.error('Failed to fetch article metadata')
    } finally {
      setFetchingMetadata(false)
    }
  }

  const uploadAsset = async (file: File, field: 'image' | 'video') => {
    setUploadingField(field)
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('media_kind', field)

      const response = await fetch('/api/admin/marketing/upload', {
        method: 'POST',
        body,
      })

      if (!response.ok) {
        throw new Error('Failed to upload asset')
      }

      const payload = await response.json()
      if (field === 'image') {
        updateForm({
          image_url: payload.url ?? '',
          image_storage_path: payload.path ?? '',
        })
      } else {
        updateForm({
          video_url: payload.url ?? '',
          video_storage_path: payload.path ?? '',
        })
      }
      toast.success(`${field === 'image' ? 'Image' : 'Video'} uploaded`)
    } catch (error) {
      console.error('[marketing-admin] Failed to upload asset:', error)
      toast.error('Failed to upload asset')
    } finally {
      setUploadingField(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Marketing
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Curate the investor dashboard announcement carousel with investment
            opportunities, events, and news.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadData()}
            disabled={loading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button type="button" onClick={startNewCard}>
            <Plus className="mr-2 h-4 w-4" />
            New card
          </Button>
        </div>
      </div>

      {/* ── Stats bar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200/60 bg-white px-3 py-1.5 dark:border-slate-700/60 dark:bg-slate-800">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-foreground">
            {publishedCards.length} published
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200/60 bg-white px-3 py-1.5 dark:border-slate-700/60 dark:bg-slate-800">
          <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="text-xs font-medium text-foreground">
            {draftCards.length} drafts
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200/60 bg-white px-3 py-1.5 dark:border-slate-700/60 dark:bg-slate-800">
          <span className="text-xs font-medium text-muted-foreground">
            {cards.length} total
          </span>
        </div>
        {leads.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-slate-200/60 bg-white px-3 py-1.5 dark:border-slate-700/60 dark:bg-slate-800">
            <span className="text-xs font-medium text-muted-foreground">
              {leads.length} interest leads
            </span>
          </div>
        )}
      </div>

      {/* ── Main grid ────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        {/* ── Card list ──────────────────────────────────────────── */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-700/80">
          <CardHeader>
            <CardTitle>Announcement cards</CardTitle>
            <CardDescription>
              Manual order for the investor carousel. Use Edit to revise a card,
              or New card to add another one.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[600px] space-y-3 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading cards
              </div>
            ) : cards.length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl border border-dashed p-5">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Sparkles className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    No cards yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Create the first announcement using the form.
                  </p>
                </div>
              </div>
            ) : (
              cards.map((card, index) => {
                const typeDot =
                  TYPE_DOT_COLORS[card.card_type] ??
                  'bg-slate-400 dark:bg-slate-500'
                const typeBadge = TYPE_BADGE_COLORS[card.card_type] ?? ''
                const thumbBg =
                  TYPE_THUMB_BG[card.card_type] ??
                  'bg-slate-50 dark:bg-slate-800'

                return (
                  <div
                    key={card.id}
                    className={cn(
                      'overflow-hidden rounded-xl border transition-all',
                      form.id === card.id
                        ? 'border-primary/30 bg-primary/[0.03] ring-1 ring-primary/20'
                        : 'border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                    )}
                  >
                    {/* Top: thumbnail + info */}
                    <div className="flex gap-4 p-4">
                      <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                        {card.image_url ? (
                          <img
                            src={card.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className={cn(
                              'flex h-full w-full items-center justify-center',
                              thumbBg
                            )}
                          >
                            <ImageIcon className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              'rounded-full border-transparent px-2.5 py-0.5 text-[11px] font-semibold',
                              typeBadge
                            )}
                          >
                            {MARKETING_BADGE_LABELS[card.card_type]}
                          </Badge>
                          <div className="flex items-center gap-1.5">
                            <div
                              className={cn(
                                'h-2 w-2 rounded-full',
                                card.status === 'published'
                                  ? 'bg-emerald-500'
                                  : 'bg-slate-300 dark:bg-slate-600'
                              )}
                            />
                            <span className="text-xs text-muted-foreground">
                              {card.status}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            #{index + 1}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {card.title || 'Untitled card'}
                        </p>
                        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {card.summary || 'No summary'}
                        </p>
                      </div>
                    </div>

                    {/* Bottom: actions bar */}
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 dark:border-slate-800">
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 px-3 text-xs"
                          onClick={() => editCard(card)}
                        >
                          <PencilLine className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 px-3 text-xs"
                          onClick={() => void handlePublishToggle(card)}
                        >
                          {card.status === 'published' ? (
                            <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                          ) : (
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          {card.status === 'published'
                            ? 'Unpublish'
                            : 'Publish'}
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => void handleMove(card.id, -1)}
                          disabled={index === 0}
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => void handleMove(card.id, 1)}
                          disabled={index === cards.length - 1}
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive/60 hover:text-destructive"
                          onClick={() => void handleDelete(card)}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* ── Editor form ────────────────────────────────────────── */}
        <Card className="rounded-2xl border-slate-200/80 dark:border-slate-700/80">
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit card' : 'Create card'}</CardTitle>
            <CardDescription>
              {isEditing
                ? 'You are editing an existing card. Start a new card before saving if you want another slide.'
                : 'You are creating a new card. Saving creates a new slide and keeps the editor ready for the next one.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div
              className={cn(
                'rounded-xl border p-4',
                isEditing
                  ? 'border-amber-200 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-950/30'
                  : 'border-emerald-200 bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/30'
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {isEditing
                      ? 'Editing existing card'
                      : 'Creating a new card'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isEditing
                      ? `${form.title || 'Untitled card'} will be updated when you save.`
                      : 'Use this form to add a new announcement without overwriting an existing one.'}
                  </p>
                </div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={startNewCard}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Start new card
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.card_type}
                  onValueChange={(value) =>
                    setCardType(value as MarketingCardType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opportunity">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Investment Opportunity
                      </span>
                    </SelectItem>
                    <SelectItem value="event">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-violet-500" />
                        Event
                      </span>
                    </SelectItem>
                    <SelectItem value="news">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-sky-500" />
                        News
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    updateForm({ status: value as MarketingCardStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                        Draft
                      </span>
                    </SelectItem>
                    <SelectItem value="published">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Published
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Media mode</Label>
                {isNewsCard ? (
                  <div className="rounded-md border border-sky-200/60 bg-sky-50/40 px-3 py-2 text-sm text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/20 dark:text-sky-300">
                    Link preview
                  </div>
                ) : (
                  <Select
                    value={form.media_type}
                    onValueChange={(value) =>
                      updateForm({
                        media_type: value as MarketingCardMediaType,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Uploaded video</SelectItem>
                      <SelectItem value="link">
                        External link preview
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {form.card_type === 'news' && (
              <div className="rounded-xl border border-sky-200/60 bg-sky-50/30 p-4 dark:border-sky-800/60 dark:bg-sky-950/20">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Label className="text-sky-700 dark:text-sky-400">
                      Article URL
                    </Label>
                    <Input
                      value={form.external_url}
                      onChange={(event) =>
                        updateForm({ external_url: event.target.value })
                      }
                      placeholder="https://"
                      className="border-sky-200/60 bg-white dark:border-sky-800/60 dark:bg-slate-900"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleIngestMetadata()}
                    disabled={fetchingMetadata}
                    className="border-sky-200/60 text-sky-700 hover:bg-sky-50 dark:border-sky-800/60 dark:text-sky-400 dark:hover:bg-sky-950/30"
                  >
                    {fetchingMetadata ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading
                      </>
                    ) : (
                      <>
                        <FileUp className="mr-2 h-4 w-4" />
                        Fetch metadata
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(event) => updateForm({ title: event.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea
                rows={4}
                value={form.summary}
                onChange={(event) =>
                  updateForm({ summary: event.target.value })
                }
                placeholder="Short, punchy explanatory copy."
              />
            </div>

            {(form.media_type === 'image' ||
              form.media_type === 'video' ||
              form.card_type === 'news') && (
              <div className="space-y-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4">
                <div className="space-y-2">
                  <Label>
                    {form.media_type === 'video'
                      ? 'Preview image URL'
                      : 'Image URL'}
                  </Label>
                  <Input
                    value={form.image_url}
                    onChange={(event) =>
                      updateForm({ image_url: event.target.value })
                    }
                    placeholder="https://"
                  />
                </div>
                {form.image_url && (
                  <div className="overflow-hidden rounded-lg border">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="h-28 w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <Label
                    htmlFor="marketing-image-upload"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {uploadingField === 'image' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload image
                  </Label>
                  <input
                    id="marketing-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        void uploadAsset(file, 'image')
                      }
                      event.currentTarget.value = ''
                    }}
                  />
                </div>
              </div>
            )}

            {form.media_type === 'video' && (
              <div className="space-y-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4">
                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input
                    value={form.video_url}
                    onChange={(event) =>
                      updateForm({ video_url: event.target.value })
                    }
                    placeholder="https://"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Label
                    htmlFor="marketing-video-upload"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {uploadingField === 'video' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload video
                  </Label>
                  <input
                    id="marketing-video-upload"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        void uploadAsset(file, 'video')
                      }
                      event.currentTarget.value = ''
                    }}
                  />
                </div>
              </div>
            )}

            {(form.media_type === 'link' || form.card_type === 'news') && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>External URL</Label>
                  <Input
                    value={form.external_url}
                    onChange={(event) =>
                      updateForm({ external_url: event.target.value })
                    }
                    placeholder="https://"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Domain label</Label>
                  <Input
                    value={form.link_domain}
                    onChange={(event) =>
                      updateForm({ link_domain: event.target.value })
                    }
                    placeholder="bloomberg.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Published at</Label>
                  <Input
                    type="datetime-local"
                    value={
                      form.source_published_at
                        ? form.source_published_at.slice(0, 16)
                        : ''
                    }
                    onChange={(event) =>
                      updateForm({ source_published_at: event.target.value })
                    }
                  />
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-4">
              {form.card_type === 'news' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label>Show CTA button</Label>
                      <p className="text-xs text-muted-foreground">
                        Without a button, the media/title still opens the link.
                      </p>
                    </div>
                    <Switch
                      checked={form.cta_enabled}
                      onCheckedChange={(checked) =>
                        updateForm({
                          cta_enabled: checked,
                          cta_label: checked ? form.cta_label || 'Open' : '',
                        })
                      }
                    />
                  </div>
                  {form.cta_enabled && (
                    <div className="space-y-2">
                      <Label>CTA label</Label>
                      <Input
                        value={form.cta_label}
                        onChange={(event) =>
                          updateForm({ cta_label: event.target.value })
                        }
                        placeholder="Open"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Label>CTA</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Opportunity and event cards always use the investor CTA:{' '}
                    <span className="font-medium text-foreground">
                      I&apos;m interested
                    </span>
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Save changes' : 'Create card'}
                  </>
                )}
              </Button>
              {isEditing && (
                <Button type="button" variant="outline" onClick={startNewCard}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create another
                </Button>
              )}
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset form
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Preview (full width) ──────────────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-slate-700/80">
        <CardHeader className="pb-3">
          <Tabs defaultValue="working" className="space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Preview</CardTitle>
              <TabsList className="h-8">
                <TabsTrigger value="working" className="px-3 text-xs">
                  Working
                </TabsTrigger>
                <TabsTrigger value="live" className="px-3 text-xs">
                  Live
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="working" className="mt-0">
              {workingPreviewCards.length > 0 ? (
                <MarketingAnnouncementsCarousel
                  items={workingPreviewCards}
                  previewMode
                />
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                  Select or create a card to preview.
                </div>
              )}
            </TabsContent>
            <TabsContent value="live" className="mt-0">
              {publishedCards.length > 0 ? (
                <MarketingAnnouncementsCarousel
                  items={publishedCards}
                  previewMode
                />
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                  No published cards yet.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      {/* ── Interest log (full width) ─────────────────────────────── */}
      <Card className="rounded-2xl border-slate-200/80 dark:border-slate-700/80">
        <CardHeader>
          <CardTitle>Interest log</CardTitle>
          <CardDescription>
            Read-only list of investors who clicked the interest CTA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl border border-dashed p-5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <Eye className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                No interest has been captured yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investor</TableHead>
                    <TableHead>Card</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          {lead.investor_name ?? 'Unknown investor'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {lead.card_title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {MARKETING_BADGE_LABELS[lead.card_type]}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm text-foreground">
                            {lead.user_name ?? 'Unknown user'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {lead.user_email ?? 'No email'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(lead.created_at), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
