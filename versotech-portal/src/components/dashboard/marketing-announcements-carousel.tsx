'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Play,
  Sparkles,
} from 'lucide-react'
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

/* ── Type-specific badge colours ──────────────────────────────────── */

const BADGE_COLORS: Record<string, { light: string; dark: string }> = {
  opportunity: {
    light: 'border-amber-200/80 bg-amber-50 text-amber-700',
    dark: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  },
  event: {
    light: 'border-violet-200/80 bg-violet-50 text-violet-700',
    dark: 'border-violet-400/20 bg-violet-400/10 text-violet-300',
  },
  news: {
    light: 'border-sky-200/80 bg-sky-50 text-sky-700',
    dark: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
  },
}

/* ── Props ────────────────────────────────────────────────────────── */

type MarketingAnnouncementsCarouselProps = {
  investorId?: string
  items?: MarketingCard[]
  previewMode?: boolean
}

/* ── Skeleton ─────────────────────────────────────────────────────── */

function AnnouncementsSkeleton() {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-8 w-56 rounded-xl" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-[380px] rounded-2xl" />
        ))}
      </div>
    </section>
  )
}

/* ── Main component ───────────────────────────────────────────────── */

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
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(1)
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (items) {
      setCards(items)
      setSubmittedIds(new Set())
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
        const response = await fetch(
          `/api/dashboard-marketing?investor_id=${investorId}`,
          {
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error('Failed to load announcements')
        }

        const payload = (await response.json()) as MarketingCardsResponse
        if (isMounted) {
          setCards(payload.items ?? [])
          setSubmittedIds(new Set(payload.submittedCardIds ?? []))
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

  const totalPages = Math.max(1, Math.ceil(cards.length / itemsPerPage))

  useEffect(() => {
    if (currentPage > totalPages - 1) {
      setCurrentPage(totalPages - 1)
    }
  }, [currentPage, totalPages])

  const pageStartIndex = currentPage * itemsPerPage

  const visibleCards = useMemo(
    () => cards.slice(pageStartIndex, pageStartIndex + itemsPerPage),
    [cards, pageStartIndex, itemsPerPage]
  )

  const moveNext = () =>
    setCurrentPage((value) => Math.min(totalPages - 1, value + 1))
  const movePrevious = () => setCurrentPage((value) => Math.max(0, value - 1))

  const handleInterestClick = (card: MarketingCard) => {
    if (previewMode || !investorId) return

    confirm(
      {
        title: "I'm interested",
        description: `We'll register your interest in "${card.title}" and notify the CEO team.`,
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
      const response = await fetch(
        `/api/dashboard-marketing/cards/${cardId}/interest`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ investorId }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to capture interest')
      }

      const payload = await response.json()
      setSubmittedIds((current) => new Set(current).add(cardId))
      toast.success(
        payload.created ? 'Interest registered' : 'Interest already registered'
      )
    } catch (submitError) {
      console.error(
        '[marketing-carousel] Failed to submit interest:',
        submitError
      )
      toast.error('Failed to register interest')
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading) {
    return <AnnouncementsSkeleton />
  }

  if (!previewMode && !cards.length && !error) {
    return null
  }

  return (
    <section className="space-y-5">
      {/* ── Section header ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded',
                isDark ? 'bg-amber-400/10' : 'bg-amber-50'
              )}
            >
              <Sparkles
                className={cn(
                  'h-3 w-3',
                  isDark ? 'text-amber-400' : 'text-amber-600'
                )}
              />
            </div>
            <span
              className={cn(
                'text-[11px] font-semibold uppercase tracking-[0.2em]',
                isDark ? 'text-zinc-400' : 'text-slate-500'
              )}
            >
              Announcements
            </span>
          </div>
          <div>
            <h2
              className={cn(
                'text-2xl font-semibold tracking-tight',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              Upcoming opportunities, events, and market context
              <span
                className={cn(
                  'mt-1.5 block h-[2px] w-12 rounded-full',
                  isDark ? 'bg-amber-400/40' : 'bg-amber-500/30'
                )}
              />
            </h2>
            <p
              className={cn(
                'mt-1 text-sm',
                isDark ? 'text-zinc-400' : 'text-slate-500'
              )}
            >
              Curated updates from the VERSO team.
            </p>
          </div>
        </div>

        {/* Dot pagination + arrows */}
        {cards.length > itemsPerPage && (
          <div className="flex items-center gap-2">
            <div className="mr-1 flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentPage(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === currentPage
                      ? cn('w-5', isDark ? 'bg-white' : 'bg-slate-900')
                      : cn(
                          'w-1.5',
                          isDark
                            ? 'bg-zinc-600 hover:bg-zinc-500'
                            : 'bg-slate-300 hover:bg-slate-400'
                        )
                  )}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={movePrevious}
              disabled={currentPage === 0}
              className={cn(
                'h-8 w-8 rounded-full',
                isDark
                  ? 'text-zinc-400 hover:bg-white/10 hover:text-white'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={moveNext}
              disabled={currentPage >= totalPages - 1}
              className={cn(
                'h-8 w-8 rounded-full',
                isDark
                  ? 'text-zinc-400 hover:bg-white/10 hover:text-white'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {error ? (
        <Card
          className={cn(
            'rounded-2xl border',
            isDark
              ? 'border-white/[0.06] bg-card'
              : 'border-slate-200/60 bg-white'
          )}
        >
          <CardContent className="flex flex-col gap-2 p-5">
            <p
              className={cn(
                'text-sm font-medium',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              Announcements are unavailable right now
            </p>
            <p
              className={cn(
                'text-sm',
                isDark ? 'text-zinc-400' : 'text-slate-500'
              )}
            >
              The dashboard content could not be loaded for the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div
          className={cn(
            'grid gap-5',
            itemsPerPage === 3 ? 'lg:grid-cols-3' : 'grid-cols-1'
          )}
        >
          {visibleCards.map((card) => {
            const isInterestCard =
              card.card_type === 'opportunity' || card.card_type === 'event'
            const isSubmitted = submittedIds.has(card.id)
            const isInlineVideo =
              card.media_type === 'video' && activeVideoId === card.id
            const isCtaDisabled =
              previewMode || isSubmitted || submittingId === card.id
            const showOpenButton =
              card.card_type === 'news' && card.cta_enabled && card.external_url
            const badgeColor = BADGE_COLORS[card.card_type] ?? BADGE_COLORS.news
            const sourceDate = card.source_published_at
              ? format(new Date(card.source_published_at), 'MMM d, yyyy')
              : null

            return (
              <Card
                key={card.id}
                className={cn(
                  'group gap-0 overflow-hidden rounded-2xl border py-0 transition-all duration-300',
                  isDark
                    ? 'border-white/[0.06] bg-card hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20'
                    : 'border-slate-200/60 bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50'
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
                        className="relative h-full w-full"
                      >
                        {card.image_url ? (
                          <img
                            src={card.image_url}
                            alt={card.title}
                            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div
                            className={cn(
                              'h-full w-full',
                              isDark ? 'bg-zinc-800' : 'bg-slate-200'
                            )}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                            <Play className="ml-0.5 h-5 w-5 fill-current" />
                          </span>
                        </div>
                      </button>
                    )
                  ) : (
                    (() => {
                      const mediaContent = card.image_url ? (
                        <>
                          <img
                            src={card.image_url}
                            alt={card.title}
                            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                          <div
                            className={cn(
                              'absolute inset-0 bg-gradient-to-t',
                              isDark
                                ? 'from-black/50 via-black/5 to-transparent'
                                : 'from-black/20 via-transparent to-transparent'
                            )}
                          />
                        </>
                      ) : (
                        <div
                          className={cn(
                            'flex h-full flex-col justify-between bg-gradient-to-br p-6',
                            isDark
                              ? 'from-zinc-800 via-zinc-900 to-black'
                              : 'from-slate-50 via-slate-100 to-slate-200'
                          )}
                        >
                          <div
                            className={cn(
                              'h-8 w-8 rounded-lg',
                              isDark ? 'bg-white/[0.04]' : 'bg-black/[0.03]'
                            )}
                          />
                          {card.link_domain && (
                            <p
                              className={cn(
                                'text-xs font-medium uppercase tracking-[0.24em]',
                                isDark ? 'text-zinc-500' : 'text-slate-400'
                              )}
                            >
                              {card.link_domain}
                            </p>
                          )}
                        </div>
                      )

                      if (card.external_url && !previewMode) {
                        return (
                          <Link
                            href={card.external_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block h-full"
                            aria-label={`Open ${card.title}`}
                          >
                            {mediaContent}
                          </Link>
                        )
                      }

                      return mediaContent
                    })()
                  )}

                  {/* Floating type badge */}
                  <div className="absolute left-3 top-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] backdrop-blur-sm',
                        isDark ? badgeColor.dark : badgeColor.light
                      )}
                    >
                      {MARKETING_BADGE_LABELS[card.card_type]}
                    </Badge>
                  </div>
                </div>

                <CardContent className="flex flex-1 flex-col gap-3 p-5 pt-4">
                  {/* Source attribution */}
                  {(card.link_domain || sourceDate) && (
                    <div
                      className={cn(
                        'flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.1em]',
                        isDark ? 'text-zinc-500' : 'text-slate-400'
                      )}
                    >
                      {card.link_domain && <span>{card.link_domain}</span>}
                      {card.link_domain && sourceDate && (
                        <span
                          className={
                            isDark ? 'text-zinc-700' : 'text-slate-300'
                          }
                        >
                          ·
                        </span>
                      )}
                      {sourceDate && <span>{sourceDate}</span>}
                    </div>
                  )}

                  {/* Title + summary */}
                  <div className="space-y-2">
                    {card.external_url ? (
                      <>
                        <Link
                          href={card.external_url}
                          target="_blank"
                          rel="noreferrer"
                          className="block"
                        >
                          <h3
                            className={cn(
                              'text-lg font-semibold leading-snug tracking-tight transition-colors',
                              isDark
                                ? 'text-white hover:text-white/80'
                                : 'text-slate-900 hover:text-slate-600'
                            )}
                          >
                            {card.title}
                          </h3>
                        </Link>
                        <p
                          className={cn(
                            'text-sm leading-relaxed',
                            isDark ? 'text-zinc-400' : 'text-slate-500'
                          )}
                        >
                          {card.summary}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3
                          className={cn(
                            'text-lg font-semibold leading-snug tracking-tight',
                            isDark ? 'text-white' : 'text-slate-900'
                          )}
                        >
                          {card.title}
                        </h3>
                        <p
                          className={cn(
                            'text-sm leading-relaxed',
                            isDark ? 'text-zinc-400' : 'text-slate-500'
                          )}
                        >
                          {card.summary}
                        </p>
                      </>
                    )}
                  </div>

                  {/* CTA buttons — pill-shaped */}
                  <div className="mt-auto flex flex-wrap items-center justify-center gap-3 pt-1">
                    {isInterestCard && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleInterestClick(card)}
                        disabled={isCtaDisabled}
                        className={cn(
                          'min-w-[160px] rounded-full px-5 text-xs font-medium',
                          isSubmitted && 'bg-emerald-600 hover:bg-emerald-600'
                        )}
                      >
                        {submittingId === card.id ? (
                          <>
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            Saving
                          </>
                        ) : isSubmitted ? (
                          'Interest received'
                        ) : (
                          (card.cta_label ?? "I'm interested")
                        )}
                      </Button>
                    )}

                    {showOpenButton && card.external_url && (
                      <Button
                        asChild
                        type="button"
                        size="sm"
                        disabled={previewMode}
                        className="min-w-[160px] rounded-full px-5 text-xs font-medium"
                      >
                        <Link
                          href={card.external_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {card.cta_label ?? 'Open'}
                          <ExternalLink className="ml-2 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <ConfirmationDialog />
    </section>
  )
}
