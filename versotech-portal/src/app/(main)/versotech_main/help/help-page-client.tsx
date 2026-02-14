'use client'

import { useState, useMemo, type ReactNode } from 'react'
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
  BookOpen,
  KeyRound,
  Compass,
  Mail,
  HelpCircle,
  ListChecks,
  ArrowUpRight,
  MessageCircleQuestion,
  Sparkles,
} from 'lucide-react'
import {
  type PersonaType,
  PERSONA_HELP_MAP,
  GETTING_STARTED,
  FAQ_CONTENT,
  HOW_TO_CONTENT,
  filterByPersonas,
  searchHelpItems,
} from '@/lib/help/help-content'

// ---------------------------------------------------------------------------
// Shared card style — matches enhanced-staff-dashboard glassCard pattern
// ---------------------------------------------------------------------------

/** Matches the dashboard KPI card styling exactly for both modes */
function cardStyle(isDark: boolean) {
  return isDark
    ? "bg-zinc-900/40 backdrop-blur-md border border-white/5 shadow-xl hover:shadow-2xl hover:shadow-black/50 hover:border-white/10 transition-all duration-300"
    : "bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg hover:shadow-xl hover:border-gray-300 transition-all duration-300"
}

/** Accordion items — no hover shadow shift, just open state */
function accordionCardStyle(isDark: boolean) {
  return isDark
    ? "bg-zinc-900/40 backdrop-blur-md border border-white/5 shadow-lg transition-all duration-300 data-[state=open]:border-white/10 data-[state=open]:shadow-xl data-[state=open]:shadow-black/30"
    : "bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm transition-all duration-300 data-[state=open]:border-blue-200/60 data-[state=open]:shadow-md"
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GETTING_STARTED_ICONS = [KeyRound, Compass, BookOpen] as const

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
// Category badge colour mapping
// ---------------------------------------------------------------------------

function getCategoryStyle(category: string, isDark: boolean) {
  const map: Record<string, { light: string; dark: string }> = {
    Approvals:        { light: 'bg-amber-50 text-amber-700 border-amber-200/60',    dark: 'bg-amber-900/30 text-amber-400 border-amber-700/40' },
    Compliance:       { light: 'bg-rose-50 text-rose-700 border-rose-200/60',        dark: 'bg-rose-900/30 text-rose-400 border-rose-700/40' },
    Deals:            { light: 'bg-blue-50 text-blue-700 border-blue-200/60',        dark: 'bg-blue-900/30 text-blue-400 border-blue-700/40' },
    Administration:   { light: 'bg-slate-100 text-slate-700 border-slate-200/60',    dark: 'bg-zinc-800/50 text-zinc-300 border-zinc-600/40' },
    Finance:          { light: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dark: 'bg-emerald-900/30 text-emerald-400 border-emerald-700/40' },
    Subscriptions:    { light: 'bg-violet-50 text-violet-700 border-violet-200/60',  dark: 'bg-violet-900/30 text-violet-400 border-violet-700/40' },
    Documents:        { light: 'bg-sky-50 text-sky-700 border-sky-200/60',           dark: 'bg-sky-900/30 text-sky-400 border-sky-700/40' },
    Funding:          { light: 'bg-teal-50 text-teal-700 border-teal-200/60',        dark: 'bg-teal-900/30 text-teal-400 border-teal-700/40' },
    Portfolio:        { light: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',  dark: 'bg-indigo-900/30 text-indigo-400 border-indigo-700/40' },
    Vehicles:         { light: 'bg-cyan-50 text-cyan-700 border-cyan-200/60',        dark: 'bg-cyan-900/30 text-cyan-400 border-cyan-700/40' },
    Fees:             { light: 'bg-orange-50 text-orange-700 border-orange-200/60',  dark: 'bg-orange-900/30 text-orange-400 border-orange-700/40' },
    Distribution:     { light: 'bg-purple-50 text-purple-700 border-purple-200/60',  dark: 'bg-purple-900/30 text-purple-400 border-purple-700/40' },
    Commissions:      { light: 'bg-lime-50 text-lime-700 border-lime-200/60',        dark: 'bg-lime-900/30 text-lime-400 border-lime-700/40' },
    Onboarding:       { light: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/60', dark: 'bg-fuchsia-900/30 text-fuchsia-400 border-fuchsia-700/40' },
    Invoicing:        { light: 'bg-amber-50 text-amber-700 border-amber-200/60',    dark: 'bg-amber-900/30 text-amber-400 border-amber-700/40' },
    Referrals:        { light: 'bg-pink-50 text-pink-700 border-pink-200/60',        dark: 'bg-pink-900/30 text-pink-400 border-pink-700/40' },
    Transactions:     { light: 'bg-blue-50 text-blue-700 border-blue-200/60',        dark: 'bg-blue-900/30 text-blue-400 border-blue-700/40' },
    Agreements:       { light: 'bg-violet-50 text-violet-700 border-violet-200/60',  dark: 'bg-violet-900/30 text-violet-400 border-violet-700/40' },
    Investing:        { light: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dark: 'bg-emerald-900/30 text-emerald-400 border-emerald-700/40' },
    Assignments:      { light: 'bg-slate-100 text-slate-700 border-slate-200/60',    dark: 'bg-zinc-800/50 text-zinc-300 border-zinc-600/40' },
    Certificates:     { light: 'bg-sky-50 text-sky-700 border-sky-200/60',           dark: 'bg-sky-900/30 text-sky-400 border-sky-700/40' },
    'Subscription Packs': { light: 'bg-violet-50 text-violet-700 border-violet-200/60', dark: 'bg-violet-900/30 text-violet-400 border-violet-700/40' },
    'Fee Plans':      { light: 'bg-orange-50 text-orange-700 border-orange-200/60',  dark: 'bg-orange-900/30 text-orange-400 border-orange-700/40' },
    'Data Room':      { light: 'bg-cyan-50 text-cyan-700 border-cyan-200/60',        dark: 'bg-cyan-900/30 text-cyan-400 border-cyan-700/40' },
    'Legal Review':   { light: 'bg-slate-100 text-slate-700 border-slate-200/60',    dark: 'bg-zinc-800/50 text-zinc-300 border-zinc-600/40' },
    Network:          { light: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',  dark: 'bg-indigo-900/30 text-indigo-400 border-indigo-700/40' },
    Clients:          { light: 'bg-blue-50 text-blue-700 border-blue-200/60',        dark: 'bg-blue-900/30 text-blue-400 border-blue-700/40' },
    Introductions:    { light: 'bg-pink-50 text-pink-700 border-pink-200/60',        dark: 'bg-pink-900/30 text-pink-400 border-pink-700/40' },
  }

  const style = map[category]
  if (!style) {
    return isDark
      ? 'bg-zinc-800/50 text-zinc-400 border-zinc-600/40'
      : 'bg-gray-50 text-gray-600 border-gray-200/60'
  }
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
// Main component
// ---------------------------------------------------------------------------

export function HelpPageClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const { activePersona, personas } = usePersona()
  const { theme } = useTheme()

  const isDark = theme === 'staff-dark'

  const allPersonaTypes: PersonaType[] = useMemo(() => {
    const types = personas.map(p => p.persona_type as PersonaType)
    return [...new Set(types)]
  }, [personas])

  const activeType = (activePersona?.persona_type ?? 'investor') as PersonaType
  const helpConfig = PERSONA_HELP_MAP[activeType]

  const filteredFaqs = useMemo(() => {
    const personaFiltered = filterByPersonas(FAQ_CONTENT, allPersonaTypes)
    return searchHelpItems(personaFiltered, searchQuery)
  }, [allPersonaTypes, searchQuery])

  const filteredHowTos = useMemo(() => {
    const personaFiltered = filterByPersonas(HOW_TO_CONTENT, allPersonaTypes)
    return searchHelpItems(personaFiltered, searchQuery)
  }, [allPersonaTypes, searchQuery])

  const filteredGettingStarted = useMemo(() => {
    return searchHelpItems(GETTING_STARTED, searchQuery)
  }, [searchQuery])

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

      {/* -- Header -------------------------------------------------------- */}
      <header className="space-y-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            isDark
              ? "bg-gradient-to-br from-blue-500/20 to-blue-600/5 border border-white/10"
              : "bg-gradient-to-br from-blue-50 to-blue-100/60 border border-blue-200/60"
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

            {/* Persona badges */}
            {allPersonaTypes.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {allPersonaTypes.map(pt => {
                  const isActive = pt === activeType
                  return (
                    <span
                      key={pt}
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border transition-colors",
                        isActive
                          ? isDark
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                          : isDark
                            ? "bg-zinc-800/60 text-zinc-400 border-zinc-700/60"
                            : "bg-gray-50 text-gray-500 border-gray-200/80"
                      )}
                    >
                      {PERSONA_HELP_MAP[pt].displayName}
                    </span>
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
                ? "border-white/10 bg-zinc-900/60 placeholder:text-zinc-600 focus:border-white/20 focus:bg-zinc-900/80"
                : "border-gray-200 bg-white placeholder:text-gray-400 focus:border-blue-200 focus:shadow-sm"
            )}
          />
        </div>
      </header>

      {/* -- Getting Started ----------------------------------------------- */}
      {filteredGettingStarted.length > 0 && !searchQuery && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className={cn(
              "h-4 w-4",
              isDark ? "text-amber-400/70" : "text-amber-500"
            )} />
            <h2 className={cn(
              "text-sm font-semibold uppercase tracking-wider",
              isDark ? "text-zinc-300" : "text-gray-700"
            )}>
              Getting Started
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {filteredGettingStarted.map((item, idx) => {
              const Icon = GETTING_STARTED_ICONS[idx] ?? BookOpen
              return (
                <Card key={item.id} className={cn(
                  "group relative overflow-hidden rounded-2xl hover:-translate-y-0.5",
                  cardStyle(isDark)
                )}>
                  {/* Gradient hover overlay */}
                  <div className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                    isDark
                      ? "from-blue-500/10 via-transparent to-transparent"
                      : "from-blue-50/60 via-transparent to-transparent"
                  )} />
                  {/* Top accent bar */}
                  <div className={cn(
                    "absolute inset-x-0 top-0 h-0.5",
                    isDark ? "bg-blue-500/40" : "bg-blue-500/20"
                  )} />
                  <CardHeader className="relative pb-2 pt-5">
                    <div className={cn(
                      "mb-3 flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300",
                      isDark
                        ? "bg-blue-500/15 group-hover:bg-blue-500/25"
                        : "bg-blue-50 group-hover:bg-blue-100"
                    )}>
                      <Icon className={cn(
                        "h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110",
                        isDark ? "text-blue-400" : "text-blue-600"
                      )} />
                    </div>
                    <CardTitle className={cn(
                      "text-sm font-semibold",
                      isDark ? "text-white" : "text-gray-900"
                    )}>
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative pb-5">
                    <p className={cn(
                      "text-[13px] leading-relaxed",
                      isDark ? "text-zinc-400" : "text-gray-500"
                    )}>
                      {item.content}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* -- Tabs: FAQ + How-To -------------------------------------------- */}
      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className={cn(
          "h-auto gap-1 rounded-xl p-1",
          isDark
            ? "bg-zinc-900/60 backdrop-blur-md border border-white/5"
            : "bg-white/90 backdrop-blur-md border border-gray-200 shadow-sm"
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
                  "group relative overflow-hidden rounded-2xl",
                  cardStyle(isDark)
                )}>
                  {/* Gradient hover overlay */}
                  <div className={cn(
                    "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                    isDark
                      ? "from-blue-500/10 via-transparent to-transparent"
                      : "from-blue-50/60 via-transparent to-transparent"
                  )} />
                  <CardHeader className="relative pb-3">
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
                  <CardContent className="relative pb-5">
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
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums transition-colors duration-300",
                              isDark
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 group-hover:bg-blue-500/30"
                                : "bg-blue-50 text-blue-700 border border-blue-200/60 group-hover:bg-blue-100"
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
          href="mailto:support@versoholdings.com"
          className={cn(
            "group relative flex items-center gap-4 overflow-hidden rounded-2xl p-5",
            isDark
              ? "bg-zinc-900/40 backdrop-blur-md border border-white/5 shadow-xl hover:shadow-2xl hover:shadow-black/50 hover:border-emerald-500/20 transition-all duration-300"
              : "bg-white/80 backdrop-blur-md border border-gray-200 shadow-lg hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
          )}
        >
          {/* Gradient hover overlay */}
          <div className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
            isDark
              ? "from-emerald-500/10 via-transparent to-transparent"
              : "from-emerald-50/60 via-transparent to-transparent"
          )} />
          <div className={cn(
            "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
            isDark
              ? "bg-emerald-500/15 group-hover:bg-emerald-500/25"
              : "bg-emerald-50 group-hover:bg-emerald-100"
          )}>
            <Mail className={cn(
              "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
              isDark ? "text-emerald-400" : "text-emerald-600"
            )} />
          </div>
          <div className="relative min-w-0 flex-1">
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
                isDark ? "text-emerald-400" : "text-emerald-600"
              )}>
                support@versoholdings.com
              </span>
              <span className="mx-1.5">&middot;</span>
              Response within 24 business hours
            </p>
          </div>
          <ArrowUpRight className={cn(
            "relative h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
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
