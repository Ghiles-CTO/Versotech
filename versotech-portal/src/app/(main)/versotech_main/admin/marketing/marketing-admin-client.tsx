'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  ArrowDown,
  ArrowUp,
  Eye,
  FileUp,
  Loader2,
  PencilLine,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'

import { MarketingAnnouncementsCarousel } from '@/components/dashboard/marketing-announcements-carousel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
    cta_enabled: true,
    cta_label: "I'm interested",
  }
}

function toFormState(card: MarketingCard): MarketingCardFormState {
  return {
    id: card.id,
    card_type: card.card_type,
    status: card.status,
    title: card.title,
    summary: card.summary,
    media_type: card.media_type,
    image_url: card.image_url ?? '',
    image_storage_path: card.image_storage_path ?? '',
    video_url: card.video_url ?? '',
    video_storage_path: card.video_storage_path ?? '',
    external_url: card.external_url ?? '',
    link_domain: card.link_domain ?? '',
    source_published_at: card.source_published_at ?? '',
    cta_enabled: card.cta_enabled,
    cta_label: card.cta_label ?? '',
  }
}

function formToPayload(form: MarketingCardFormState, sortOrder: number) {
  return {
    card_type: form.card_type,
    status: form.status,
    title: form.title,
    summary: form.summary,
    media_type: form.media_type,
    image_url: form.image_url || null,
    image_storage_path: form.image_storage_path || null,
    video_url: form.video_url || null,
    video_storage_path: form.video_storage_path || null,
    external_url: form.external_url || null,
    link_domain: form.link_domain || null,
    source_published_at: form.source_published_at || null,
    cta_enabled: form.card_type === 'news' ? form.cta_enabled : true,
    cta_label: form.card_type === 'news' ? (form.cta_enabled ? form.cta_label || 'Open' : null) : "I'm interested",
    sort_order: sortOrder,
  }
}

function formToPreviewCard(form: MarketingCardFormState): MarketingCard {
  return {
    id: form.id ?? 'preview-card',
    card_type: form.card_type,
    status: form.status,
    title: form.title || 'Preview title',
    summary: form.summary || 'Preview summary',
    media_type: form.media_type,
    image_url: form.image_url || null,
    image_storage_path: form.image_storage_path || null,
    video_url: form.video_url || null,
    video_storage_path: form.video_storage_path || null,
    external_url: form.external_url || null,
    link_domain: form.link_domain || null,
    source_published_at: form.source_published_at || null,
    metadata_json: null,
    cta_enabled: form.card_type === 'news' ? form.cta_enabled : true,
    cta_label: form.card_type === 'news' ? form.cta_label || 'Open' : "I'm interested",
    sort_order: 0,
    published_at: null,
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export function MarketingAdminClient() {
  const [cards, setCards] = useState<MarketingCard[]>([])
  const [leads, setLeads] = useState<MarketingLead[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<'image' | 'video' | null>(null)
  const [fetchingMetadata, setFetchingMetadata] = useState(false)
  const [form, setForm] = useState<MarketingCardFormState>(createEmptyFormState())

  const publishedCards = useMemo(
    () => cards.filter((card) => card.status === 'published'),
    [cards]
  )

  const previewCards = useMemo(() => {
    if (publishedCards.length > 0) {
      return publishedCards.map((card) => (card.id === form.id ? formToPreviewCard(form) : card))
    }

    return form.title.trim() ? [formToPreviewCard(form)] : []
  }, [form, publishedCards])

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
      media_type: cardType === 'news' ? 'link' : current.media_type,
      external_url: cardType === 'news' ? current.external_url : current.external_url,
      cta_enabled: cardType === 'news' ? current.cta_enabled : true,
      cta_label: cardType === 'news' ? current.cta_label || 'Open' : "I'm interested",
    }))
  }

  const resetForm = () => setForm(createEmptyFormState())

  const handleSave = async () => {
    setSaving(true)
    try {
      const sortOrder = form.id
        ? cards.find((card) => card.id === form.id)?.sort_order ?? cards.length
        : cards.length

      const payload = formToPayload(form, sortOrder)
      const url = form.id ? `/api/admin/marketing/cards/${form.id}` : '/api/admin/marketing/cards'
      const method = form.id ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        throw new Error(errorPayload?.error?.formErrors?.[0] || errorPayload?.error || 'Failed to save card')
      }

      const savedCard = (await response.json()) as MarketingCard
      toast.success(form.id ? 'Card updated' : 'Card created')
      await loadData()
      setForm(toFormState(savedCard))
    } catch (error) {
      console.error('[marketing-admin] Failed to save card:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save card')
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
        resetForm()
      }
      await loadData()
    } catch (error) {
      console.error('[marketing-admin] Failed to delete card:', error)
      toast.error('Failed to delete card')
    }
  }

  const handlePublishToggle = async (card: MarketingCard) => {
    const nextStatus: MarketingCardStatus = card.status === 'published' ? 'draft' : 'published'

    try {
      const response = await fetch(`/api/admin/marketing/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast.success(nextStatus === 'published' ? 'Card published' : 'Card moved to draft')
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
      setForm((current) => ({
        ...current,
        card_type: 'news',
        media_type: 'link',
        title: metadata.title ?? current.title,
        summary: metadata.summary ?? current.summary,
        image_url: metadata.imageUrl ?? current.image_url,
        external_url: metadata.externalUrl ?? current.external_url,
        link_domain: metadata.linkDomain ?? current.link_domain,
        source_published_at: metadata.sourcePublishedAt ?? current.source_published_at,
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Marketing</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Curate the investor dashboard announcement carousel with investment opportunities, events,
            and news.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => void loadData()} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button type="button" onClick={resetForm}>
            <Plus className="mr-2 h-4 w-4" />
            New card
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="rounded-3xl border-slate-200/80">
          <CardHeader>
            <CardTitle>Announcement cards</CardTitle>
            <CardDescription>Mixed investor feed shown in manual order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading cards
              </div>
            ) : cards.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">
                No cards yet. Create the first announcement on the right.
              </div>
            ) : (
              cards.map((card, index) => (
                <div
                  key={card.id}
                  className={cn(
                    'rounded-2xl border p-4 transition-colors',
                    form.id === card.id ? 'border-primary bg-primary/5' : 'border-slate-200/80'
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{MARKETING_BADGE_LABELS[card.card_type]}</Badge>
                        <Badge variant={card.status === 'published' ? 'default' : 'outline'}>
                          {card.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{card.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{card.summary}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => setForm(toFormState(card))}>
                        <PencilLine className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => void handlePublishToggle(card)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {card.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => void handleMove(card.id, -1)} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void handleMove(card.id, 1)}
                        disabled={index === cards.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => void handleDelete(card)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200/80">
          <CardHeader>
            <CardTitle>{form.id ? 'Edit card' : 'Create card'}</CardTitle>
            <CardDescription>Keep copy tight and use one media mode per card.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.card_type} onValueChange={(value) => setCardType(value as MarketingCardType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opportunity">Investment Opportunity</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => updateForm({ status: value as MarketingCardStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Media mode</Label>
                <Select value={form.media_type} onValueChange={(value) => updateForm({ media_type: value as MarketingCardMediaType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Uploaded video</SelectItem>
                    <SelectItem value="link">External link preview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.card_type === 'news' && (
              <div className="rounded-2xl border border-slate-200/80 p-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Label>Article URL</Label>
                    <Input
                      value={form.external_url}
                      onChange={(event) => updateForm({ external_url: event.target.value })}
                      placeholder="https://"
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={() => void handleIngestMetadata()} disabled={fetchingMetadata}>
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
              <Input value={form.title} onChange={(event) => updateForm({ title: event.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea
                rows={4}
                value={form.summary}
                onChange={(event) => updateForm({ summary: event.target.value })}
                placeholder="Short, punchy explanatory copy."
              />
            </div>

            {(form.media_type === 'image' || form.media_type === 'video' || form.card_type === 'news') && (
              <div className="space-y-3 rounded-2xl border border-slate-200/80 p-4">
                <div className="space-y-2">
                  <Label>{form.media_type === 'video' ? 'Preview image URL' : 'Image URL'}</Label>
                  <Input
                    value={form.image_url}
                    onChange={(event) => updateForm({ image_url: event.target.value })}
                    placeholder="https://"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Label
                    htmlFor="marketing-image-upload"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
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
              <div className="space-y-3 rounded-2xl border border-slate-200/80 p-4">
                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input
                    value={form.video_url}
                    onChange={(event) => updateForm({ video_url: event.target.value })}
                    placeholder="https://"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Label
                    htmlFor="marketing-video-upload"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
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
                    onChange={(event) => updateForm({ external_url: event.target.value })}
                    placeholder="https://"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Domain label</Label>
                  <Input
                    value={form.link_domain}
                    onChange={(event) => updateForm({ link_domain: event.target.value })}
                    placeholder="bloomberg.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Published at</Label>
                  <Input
                    type="datetime-local"
                    value={form.source_published_at ? form.source_published_at.slice(0, 16) : ''}
                    onChange={(event) => updateForm({ source_published_at: event.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200/80 p-4">
              {form.card_type === 'news' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label>Show CTA button</Label>
                      <p className="text-xs text-muted-foreground">Without a button, the media/title still opens the link.</p>
                    </div>
                    <Switch
                      checked={form.cta_enabled}
                      onCheckedChange={(checked) => updateForm({ cta_enabled: checked, cta_label: checked ? form.cta_label || 'Open' : '' })}
                    />
                  </div>
                  {form.cta_enabled && (
                    <div className="space-y-2">
                      <Label>CTA label</Label>
                      <Input
                        value={form.cta_label}
                        onChange={(event) => updateForm({ cta_label: event.target.value })}
                        placeholder="Open"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Label>CTA</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Opportunity and event cards always use the investor CTA: <span className="font-medium text-foreground">I&apos;m interested</span>
                  </p>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => void handleSave()} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save card
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="hidden rounded-3xl border-slate-200/80 xl:block">
          <CardHeader>
            <CardTitle>Desktop preview</CardTitle>
            <CardDescription>Preview of the investor announcement rail with published cards.</CardDescription>
          </CardHeader>
          <CardContent>
            {previewCards.length > 0 ? (
              <MarketingAnnouncementsCarousel items={previewCards} previewMode />
            ) : (
              <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">
                Publish a card or fill the form to generate a preview.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200/80">
          <CardHeader>
            <CardTitle>Interest log</CardTitle>
            <CardDescription>Read-only list of investors who clicked the interest CTA.</CardDescription>
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">
                No interest has been captured yet.
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
                          <div className="font-medium text-foreground">{lead.investor_name ?? 'Unknown investor'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">{lead.card_title}</div>
                            <div className="text-xs text-muted-foreground">{MARKETING_BADGE_LABELS[lead.card_type]}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm text-foreground">{lead.user_name ?? 'Unknown user'}</div>
                            <div className="text-xs text-muted-foreground">{lead.user_email ?? 'No email'}</div>
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
    </div>
  )
}
