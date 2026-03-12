'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ExternalLink, Loader2, Play, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { useConfirmationDialog } from '@/hooks/use-confirmation-dialog'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MARKETING_BADGE_LABELS,
  type MarketingCard,
  type MarketingCardsResponse,
} from '@/types/dashboard-marketing'

type MarketingAnnouncementsCarouselProps = {
  investorId?: string
  items?: MarketingCard[]
  previewMode?: boolean
}

function AnnouncementsSkeleton() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-8 w-56 rounded-xl" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-[360px] rounded-3xl" />
        ))}
      </div>
    </section>
  )
}

export function MarketingAnnouncementsCarousel({
  investorId,
  items,
  previewMode = false,
}: MarketingAnnouncementsCarouselProps) {
  const { theme } = useTheme()
  const isDark = theme === 'staff-dark'
  const { confirm, ConfirmationDialog } = useConfirmationDialog()

  const [cards, setCards] = useState<MarketingCard[]>(items ?? [])
  const [loading, setLoading] = useState(!items && !previewMode)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(1)
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (items) {
      setCards(items)
    }
  }, [items])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const applyLayout = () => setItemsPerPage(mediaQuery.matches ? 3 : 1)

    applyLayout()
    mediaQuery.addEventListener('change', applyLayout)
    return () => mediaQuery.removeEventListener('change', applyLayout)
  }, [])

  useEffect(() => {
    if (items || previewMode || !investorId) {
      return
    }

    let isMounted = true

    const loadCards = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/dashboard-marketing?investor_id=${investorId}`, {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to load announcements')
        }

        const payload = (await response.json()) as MarketingCardsResponse
        if (isMounted) {
          setCards(payload.items ?? [])
        }
      } catch (fetchError) {
        console.error('[marketing-carousel] Failed to load cards:', fetchError)
        if (isMounted) {
          setError('Announcements are unavailable right now.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadCards()

    return () => {
      isMounted = false
    }
  }, [investorId, items, previewMode])

  const maxStartIndex = Math.max(0, cards.length - itemsPerPage)

  useEffect(() => {
    if (currentIndex > maxStartIndex) {
      setCurrentIndex(maxStartIndex)
    }
  }, [currentIndex, maxStartIndex])

  const visibleCards = useMemo(
    () => cards.slice(currentIndex, currentIndex + itemsPerPage),
    [cards, currentIndex, itemsPerPage]
  )

  const moveNext = () => setCurrentIndex((value) => Math.min(maxStartIndex, value + 1))
  const movePrevious = () => setCurrentIndex((value) => Math.max(0, value - 1))

  const handleInterestClick = (card: MarketingCard) => {
    if (previewMode || !investorId) return

    confirm(
      {
        title: "I'm interested",
        description: `We’ll register your interest in "${card.title}" and notify the CEO team.`,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
      },
      () => {
        void submitInterest(card.id)
      }
    )
  }

  const submitInterest = async (cardId: string) => {
    if (!investorId) return

    setSubmittingId(cardId)
    try {
      const response = await fetch(`/api/dashboard-marketing/cards/${cardId}/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investorId }),
      })

      if (!response.ok) {
        throw new Error('Failed to capture interest')
      }

      const payload = await response.json()
      setSubmittedIds((current) => new Set(current).add(cardId))
      toast.success(payload.created ? 'Interest registered' : 'Interest already registered')
    } catch (submitError) {
      console.error('[marketing-carousel] Failed to submit interest:', submitError)
      toast.error('Failed to register interest')
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading) {
    return <AnnouncementsSkeleton />
  }

  if (!previewMode && (!cards.length || error)) {
    return null
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Badge
            variant="outline"
            className={cn(
              'rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em]',
              isDark
                ? 'border-white/10 bg-white/5 text-zinc-300'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            )}
          >
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Announcements
          </Badge>
          <div>
            <h2 className={cn('text-2xl font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
              Fresh opportunities, events, and market context
            </h2>
            <p className={cn('mt-1 text-sm', isDark ? 'text-zinc-400' : 'text-slate-600')}>
              Curated updates from the VERSO team, right inside the dashboard.
            </p>
          </div>
        </div>

        {cards.length > itemsPerPage && (
          <div className="flex items-center gap-2">
            <div className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-slate-500')}>
              {currentIndex + 1} / {maxStartIndex + 1}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={movePrevious}
              disabled={currentIndex === 0}
              className="rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={moveNext}
              disabled={currentIndex >= maxStartIndex}
              className="rounded-full"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className={cn('grid gap-4', itemsPerPage === 3 ? 'lg:grid-cols-3' : 'grid-cols-1')}>
        {visibleCards.map((card) => {
          const isInterestCard = card.card_type === 'opportunity' || card.card_type === 'event'
          const isSubmitted = submittedIds.has(card.id)
          const isInlineVideo = card.media_type === 'video' && activeVideoId === card.id
          const isCtaDisabled = previewMode || isSubmitted || submittingId === card.id
          const showOpenButton = card.card_type === 'news' && card.cta_enabled && card.external_url

          return (
            <Card
              key={card.id}
              className={cn(
                'overflow-hidden rounded-3xl border shadow-sm',
                isDark ? 'border-white/10 bg-card' : 'border-slate-200/80 bg-white'
              )}
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {card.media_type === 'video' && card.video_url ? (
                  isInlineVideo ? (
                    <video
                      src={card.video_url}
                      poster={card.image_url ?? undefined}
                      controls
                      autoPlay
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveVideoId(card.id)}
                      className="group relative h-full w-full"
                    >
                      {card.image_url ? (
                        <img
                          src={card.image_url}
                          alt={card.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="h-full w-full bg-slate-200" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg">
                          <Play className="ml-1 h-5 w-5 fill-current" />
                        </span>
                      </div>
                    </button>
                  )
                ) : card.external_url ? (
                  <Link href={card.external_url} target="_blank" rel="noreferrer" className="block h-full">
                    {card.image_url ? (
                      <img src={card.image_url} alt={card.title} className="h-full w-full object-cover" />
                    ) : (
                      <div
                        className={cn(
                          'flex h-full items-end bg-gradient-to-br p-6',
                          isDark
                            ? 'from-zinc-800 via-zinc-900 to-black'
                            : 'from-slate-100 via-white to-stone-100'
                        )}
                      >
                        <div>
                          <p className={cn('text-xs uppercase tracking-[0.24em]', isDark ? 'text-zinc-500' : 'text-slate-500')}>
                            {card.link_domain ?? 'External link'}
                          </p>
                          <p className={cn('mt-2 text-lg font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                            Open article
                          </p>
                        </div>
                      </div>
                    )}
                  </Link>
                ) : card.image_url ? (
                  <img src={card.image_url} alt={card.title} className="h-full w-full object-cover" />
                ) : (
                  <div
                    className={cn(
                      'h-full w-full bg-gradient-to-br',
                      isDark
                        ? 'from-zinc-800 via-zinc-900 to-black'
                        : 'from-slate-100 via-white to-stone-100'
                    )}
                  />
                )}
              </div>

              <CardContent className="space-y-4 p-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'rounded-full',
                        isDark
                          ? 'border-white/10 bg-white/5 text-zinc-300'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      )}
                    >
                      {MARKETING_BADGE_LABELS[card.card_type]}
                    </Badge>
                    {card.link_domain && (
                      <span className={cn('text-xs uppercase tracking-[0.18em]', isDark ? 'text-zinc-500' : 'text-slate-500')}>
                        {card.link_domain}
                      </span>
                    )}
                  </div>

                  {card.external_url ? (
                    <Link href={card.external_url} target="_blank" rel="noreferrer" className="block space-y-2">
                      <h3 className={cn('text-xl font-semibold leading-tight', isDark ? 'text-white' : 'text-slate-900')}>
                        {card.title}
                      </h3>
                      <p className={cn('text-sm leading-6', isDark ? 'text-zinc-400' : 'text-slate-600')}>
                        {card.summary}
                      </p>
                    </Link>
                  ) : (
                    <>
                      <h3 className={cn('text-xl font-semibold leading-tight', isDark ? 'text-white' : 'text-slate-900')}>
                        {card.title}
                      </h3>
                      <p className={cn('text-sm leading-6', isDark ? 'text-zinc-400' : 'text-slate-600')}>
                        {card.summary}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {isInterestCard && (
                    <Button
                      type="button"
                      onClick={() => handleInterestClick(card)}
                      disabled={isCtaDisabled}
                    >
                      {submittingId === card.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving
                        </>
                      ) : isSubmitted ? (
                        'Interest received'
                      ) : (
                        card.cta_label ?? "I'm interested"
                      )}
                    </Button>
                  )}

                  {showOpenButton && card.external_url && (
                    <Button asChild type="button" variant="outline" disabled={previewMode}>
                      <Link href={card.external_url} target="_blank" rel="noreferrer">
                        {card.cta_label ?? 'Open'}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <ConfirmationDialog />
    </section>
  )
}
