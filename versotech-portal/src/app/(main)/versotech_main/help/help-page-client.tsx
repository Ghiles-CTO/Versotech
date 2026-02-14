'use client'

import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { usePersona } from '@/contexts/persona-context'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import {
  Search,
  Mail,
  HelpCircle,
  ListChecks,
  ArrowUpRight,
  MessageCircleQuestion,
} from 'lucide-react'
import {
  type PersonaType,
  PERSONA_HELP_MAP,
  FAQ_CONTENT,
  HOW_TO_CONTENT,
  filterByPersonas,
  searchHelpItems,
} from '@/lib/help/help-content'

// ---------------------------------------------------------------------------
// Shared card style — clean, professional
// ---------------------------------------------------------------------------

function cardStyle(isDark: boolean) {
  return isDark
    ? "bg-zinc-900 border border-zinc-800 shadow-sm"
    : "bg-white border border-gray-200 shadow-sm"
}

function accordionCardStyle(isDark: boolean) {
  return isDark
    ? "bg-zinc-900 border border-zinc-800 data-[state=open]:border-zinc-700"
    : "bg-white border border-gray-200 data-[state=open]:border-blue-200"
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


function renderBoldText(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const regex = /\*\*([^*]+)\*\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(
      <strong key={match.index} className="font-semibold">
        {match[1]}
      </strong>
    )
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

// ---------------------------------------------------------------------------
// Category badge colour mapping — 6 color families
// ---------------------------------------------------------------------------

function getCategoryStyle(category: string, isDark: boolean) {
  const blue   = { light: 'bg-blue-50 text-blue-700 border-blue-200/60',       dark: 'bg-blue-950 text-blue-400 border-blue-800/40' }
  const violet = { light: 'bg-violet-50 text-violet-700 border-violet-200/60', dark: 'bg-violet-950 text-violet-400 border-violet-800/40' }
  const green  = { light: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dark: 'bg-emerald-950 text-emerald-400 border-emerald-800/40' }
  const rose   = { light: 'bg-rose-50 text-rose-700 border-rose-200/60',       dark: 'bg-rose-950 text-rose-400 border-rose-800/40' }
  const amber  = { light: 'bg-amber-50 text-amber-700 border-amber-200/60',   dark: 'bg-amber-950 text-amber-400 border-amber-800/40' }
  const slate  = { light: 'bg-gray-50 text-gray-600 border-gray-200/60',       dark: 'bg-zinc-800 text-zinc-400 border-zinc-700/40' }

  const map: Record<string, { light: string; dark: string }> = {
    Deals: blue, Distribution: blue, Investing: blue, 'Data Room': blue, Transactions: blue, Clients: blue,
    Subscriptions: violet, 'Subscription Packs': violet, Documents: violet, Certificates: violet, Agreements: violet,
    Finance: green, Funding: green, Commissions: green, Invoicing: green, 'Fee Plans': green, Fees: green, Portfolio: green,
    Compliance: rose, Onboarding: rose,
    Approvals: amber, Administration: amber, Assignments: amber,
    Network: slate, Referrals: slate, 'Legal Review': slate, Introductions: slate,
  }

  const style = map[category] ?? slate
  return isDark ? style.dark : style.light
}

// ---------------------------------------------------------------------------
// Persona badge rendering helpers
// ---------------------------------------------------------------------------

function PersonaIndicators({ itemPersonas, allPersonaTypes, isDark }: {
  itemPersonas: PersonaType[]
  allPersonaTypes: PersonaType[]
  isDark: boolean
}) {
  const relevant = allPersonaTypes.filter(p => itemPersonas.includes(p))
  if (relevant.length === 0 || relevant.length === allPersonaTypes.length) return null

  return (
    <div className="flex flex-wrap gap-1">
      {relevant.map(p => (
        <span
          key={p}
          className={cn(
            "inline-flex rounded px-1.5 py-px text-[9px] font-medium uppercase tracking-wide",
            isDark
              ? "bg-zinc-800 text-zinc-400 border border-zinc-700/60"
              : "bg-slate-100 text-slate-500 border border-slate-200/80"
          )}
        >
          {PERSONA_HELP_MAP[p].displayName}
        </span>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex-1 space-y-2">
            <div className="h-7 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
        <div className="h-10 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
      <div className="space-y-2">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function HelpPageClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPersona, setFilterPersona] = useState<PersonaType | null>(null)
  const { activePersona, personas, isLoading } = usePersona()
  const { theme } = useTheme()

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const isDark = mounted && theme === 'staff-dark'

  const allPersonaTypes: PersonaType[] = useMemo(() => {
    const types = personas.map(p => p.persona_type as PersonaType)
    return [...new Set(types)]
  }, [personas])

  const activeType = filterPersona ?? (activePersona?.persona_type ?? allPersonaTypes[0] ?? 'investor') as PersonaType
  const helpConfig = PERSONA_HELP_MAP[activeType]

  const visiblePersonas: PersonaType[] = useMemo(() => {
    return filterPersona ? [filterPersona] : allPersonaTypes
  }, [filterPersona, allPersonaTypes])

  const filteredFaqs = useMemo(() => {
    const personaFiltered = filterByPersonas(FAQ_CONTENT, visiblePersonas)
    return searchHelpItems(personaFiltered, searchQuery)
  }, [visiblePersonas, searchQuery])

  const filteredHowTos = useMemo(() => {
    const personaFiltered = filterByPersonas(HOW_TO_CONTENT, visiblePersonas)
    return searchHelpItems(personaFiltered, searchQuery)
  }, [visiblePersonas, searchQuery])


  if (isLoading || !mounted) {
    return <LoadingSkeleton />
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

      {/* -- Header -------------------------------------------------------- */}
      <header className="space-y-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
            isDark
              ? "bg-zinc-800 border-zinc-700"
              : "bg-blue-50 border-blue-200"
          )}>
            <HelpCircle className={cn(
              "h-5 w-5",
              isDark ? "text-blue-400" : "text-blue-600"
            )} />
          </div>
          <div className="space-y-2">
            <h1 className={cn(
              "text-2xl font-bold tracking-tight",
              isDark ? "text-white" : "text-gray-900"
            )}>
              Help & Support
            </h1>
            <p className={cn(
              "text-sm",
              isDark ? "text-zinc-400" : "text-gray-500"
            )}>
              Guides for{' '}
              <span className={cn(
                "font-medium",
                isDark ? "text-zinc-200" : "text-gray-700"
              )}>{helpConfig.displayName}</span>
              {' '}&middot; {helpConfig.subtitle}
            </p>

            {/* Persona badges — clickable filter */}
            {allPersonaTypes.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {allPersonaTypes.map(pt => {
                  const isActive = pt === activeType
                  return (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setFilterPersona(prev => prev === pt ? null : pt)}
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border transition-colors cursor-pointer",
                        isActive
                          ? isDark
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                          : isDark
                            ? "bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:bg-zinc-800 hover:text-zinc-300"
                            : "bg-gray-50 text-gray-500 border-gray-200/80 hover:bg-gray-100 hover:text-gray-700"
                      )}
                    >
                      {PERSONA_HELP_MAP[pt].displayName}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={cn(
            "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
            isDark ? "text-zinc-500" : "text-gray-400"
          )} />
          <Input
            placeholder="Search articles, guides, and FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "pl-10 rounded-xl transition-all duration-200",
              isDark
                ? "border-zinc-800 bg-zinc-900 placeholder:text-zinc-600 focus:border-zinc-700"
                : "border-gray-200 bg-white placeholder:text-gray-400 focus:border-blue-200 focus:shadow-sm"
            )}
          />
        </div>
      </header>

      {/* -- Tabs: FAQ + How-To -------------------------------------------- */}
      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className={cn(
          "h-auto gap-1 rounded-xl p-1",
          isDark
            ? "bg-zinc-900 border border-zinc-800"
            : "bg-gray-50 border border-gray-200"
        )}>
          <TabsTrigger value="faq" className="gap-1.5 px-3 sm:px-4">
            <MessageCircleQuestion className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Frequently Asked Questions</span>
            <span className="sm:hidden">FAQs</span>
            {filteredFaqs.length > 0 && (
              <Badge variant="secondary" className={cn(
                "ml-1 px-1.5 py-0 text-[10px]",
                isDark ? "bg-zinc-800 text-zinc-300 border border-zinc-700/60" : ""
              )}>
                {filteredFaqs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="howto" className="gap-1.5 px-3 sm:px-4">
            <ListChecks className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">How-To Guides</span>
            <span className="sm:hidden">Guides</span>
            {filteredHowTos.length > 0 && (
              <Badge variant="secondary" className={cn(
                "ml-1 px-1.5 py-0 text-[10px]",
                isDark ? "bg-zinc-800 text-zinc-300 border border-zinc-700/60" : ""
              )}>
                {filteredHowTos.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* -- FAQ Tab ------------------------------------------------------ */}
        <TabsContent value="faq" className="space-y-2">
          {filteredFaqs.length === 0 ? (
            <EmptyState query={searchQuery} isDark={isDark} />
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {filteredFaqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className={cn(
                    "rounded-xl px-5",
                    accordionCardStyle(isDark)
                  )}
                >
                  <AccordionTrigger className={cn(
                    "py-4 text-sm font-medium hover:no-underline [&[data-state=open]]:pb-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    <div className="flex items-center gap-3 text-left">
                      <span className="flex-1">{faq.title}</span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <PersonaIndicators
                          itemPersonas={faq.personas}
                          allPersonaTypes={allPersonaTypes}
                          isDark={isDark}
                        />
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium",
                            getCategoryStyle(faq.category, isDark)
                          )}
                        >
                          {faq.category}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className={cn(
                      "text-sm leading-relaxed",
                      isDark ? "text-zinc-400" : "text-gray-600"
                    )}>
                      {faq.content}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>

        {/* -- How-To Tab --------------------------------------------------- */}
        <TabsContent value="howto" className="space-y-4">
          {filteredHowTos.length === 0 ? (
            <EmptyState query={searchQuery} isDark={isDark} />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredHowTos.map((howto) => (
                <Card key={howto.id} className={cn(
                  "group relative overflow-hidden rounded-2xl transition-colors",
                  cardStyle(isDark)
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className={cn(
                        "text-sm font-semibold",
                        isDark ? "text-white" : "text-gray-900"
                      )}>
                        {howto.title}
                      </CardTitle>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <PersonaIndicators
                          itemPersonas={howto.personas}
                          allPersonaTypes={allPersonaTypes}
                          isDark={isDark}
                        />
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium",
                            getCategoryStyle(howto.category, isDark)
                          )}
                        >
                          {howto.category}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="sr-only">
                      {howto.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-5">
                    <ol className="space-y-2.5">
                      {howto.content.split('\n').map((line, i) => {
                        const stepMatch = line.match(/^(\d+)\.\s+(.*)$/)
                        if (!stepMatch) {
                          return line.trim() ? (
                            <li key={i} className={cn(
                              "text-sm",
                              isDark ? "text-zinc-400" : "text-gray-600"
                            )}>
                              {renderBoldText(line)}
                            </li>
                          ) : null
                        }

                        const [, num, text] = stepMatch
                        return (
                          <li key={i} className="flex items-start gap-3">
                            <span className={cn(
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums",
                              isDark
                                ? "bg-blue-950 text-blue-400 border border-blue-800/40"
                                : "bg-blue-50 text-blue-700 border border-blue-200/60"
                            )}>
                              {num}
                            </span>
                            <span className={cn(
                              "flex-1 text-sm leading-relaxed",
                              isDark ? "text-zinc-400" : "text-gray-600"
                            )}>
                              {renderBoldText(text!)}
                            </span>
                          </li>
                        )
                      })}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* -- Contact CTA --------------------------------------------------- */}
      {!searchQuery && (
        <a
          href="mailto:contact@versotech.com"
          className={cn(
            "group flex items-center gap-4 rounded-2xl p-5 transition-colors",
            isDark
              ? "bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
              : "bg-white border border-gray-200 shadow-sm hover:border-blue-200"
          )}
        >
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            isDark ? "bg-blue-950" : "bg-blue-50"
          )}>
            <Mail className={cn(
              "h-5 w-5",
              isDark ? "text-blue-400" : "text-blue-600"
            )} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn(
              "text-sm font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}>
              Still need help?
            </p>
            <p className={cn(
              "text-[13px]",
              isDark ? "text-zinc-400" : "text-gray-500"
            )}>
              Reach us at{' '}
              <span className={cn(
                "font-medium",
                isDark ? "text-blue-400" : "text-blue-600"
              )}>
                contact@versotech.com
              </span>
              <span className="mx-1.5">&middot;</span>
              Response within 24 business hours
            </p>
          </div>
          <ArrowUpRight className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
            isDark ? "text-zinc-600 group-hover:text-zinc-400" : "text-gray-300 group-hover:text-gray-500"
          )} />
        </a>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ query, isDark }: { query: string; isDark: boolean }) {
  return (
    <div className={cn(
      "rounded-xl border border-dashed px-6 py-16 text-center",
      isDark
        ? "border-zinc-700/60 bg-zinc-900/30"
        : "border-gray-200 bg-gray-50/50"
    )}>
      <Search className={cn(
        "mx-auto mb-4 h-8 w-8",
        isDark ? "text-zinc-600" : "text-gray-300"
      )} />
      <p className={cn(
        "text-sm font-medium",
        isDark ? "text-zinc-400" : "text-gray-600"
      )}>
        {query
          ? <>No results for &ldquo;{query}&rdquo;</>
          : 'No articles available for your current role'}
      </p>
      <p className={cn(
        "mt-1 text-[13px]",
        isDark ? "text-zinc-500" : "text-gray-400"
      )}>
        {query
          ? 'Try a different search term or browse another section'
          : 'Switch personas to see role-specific guides'}
      </p>
    </div>
  )
}
