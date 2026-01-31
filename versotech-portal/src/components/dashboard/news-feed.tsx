'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, Newspaper, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface NewsItem {
  id: string
  title: string
  source: string
  publishedAt: string
  category: 'markets' | 'tech' | 'crypto' | 'deals'
  sentiment: 'positive' | 'negative' | 'neutral'
  url?: string
}

// Mock data - replace with actual Bloomberg/Yahoo Finance API
const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Fed Signals Potential Rate Cuts in Q2 2025',
    source: 'Bloomberg',
    publishedAt: '2h ago',
    category: 'markets',
    sentiment: 'positive'
  },
  {
    id: '2',
    title: 'Tech IPO Market Shows Signs of Revival',
    source: 'Reuters',
    publishedAt: '4h ago',
    category: 'tech',
    sentiment: 'positive'
  },
  {
    id: '3',
    title: 'Private Equity Deal Flow Down 15% YoY',
    source: 'PitchBook',
    publishedAt: '6h ago',
    category: 'deals',
    sentiment: 'negative'
  },
  {
    id: '4',
    title: 'European VC Funding Reaches $12B in Q4',
    source: 'TechCrunch',
    publishedAt: '8h ago',
    category: 'tech',
    sentiment: 'positive'
  },
  {
    id: '5',
    title: 'Bitcoin ETFs See Record Inflows',
    source: 'Yahoo Finance',
    publishedAt: '12h ago',
    category: 'crypto',
    sentiment: 'positive'
  }
]

const categoryStyles = {
  markets: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  tech: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  crypto: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  deals: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
}

const sentimentIcons = {
  positive: TrendingUp,
  negative: TrendingDown,
  neutral: Minus
}

const sentimentStyles = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-rose-600 dark:text-rose-400',
  neutral: 'text-slate-400 dark:text-slate-500'
}

export function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>(mockNews)
  const [isLoading, setIsLoading] = useState(false)

  // TODO: Replace with actual API call
  // useEffect(() => {
  //   fetch('/api/news')
  //     .then(res => res.json())
  //     .then(data => setNews(data))
  // }, [])

  return (
    <Card className="h-full border-0 bg-gradient-to-br from-slate-50/50 to-white dark:from-zinc-900/50 dark:to-zinc-900">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-slate-500" />
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-zinc-300">
              Market Intelligence
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] font-normal">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {news.map((item, index) => {
          const SentimentIcon = sentimentIcons[item.sentiment]
          return (
            <div
              key={item.id}
              className={cn(
                "group cursor-pointer space-y-2 rounded-lg p-3 transition-all",
                "hover:bg-slate-100/50 dark:hover:bg-zinc-800/50",
                index !== news.length - 1 && "border-b border-slate-100 dark:border-zinc-800"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="line-clamp-2 text-sm font-medium leading-snug text-slate-800 transition-colors group-hover:text-slate-900 dark:text-zinc-200 dark:group-hover:text-white">
                  {item.title}
                </h4>
                <SentimentIcon className={cn("h-4 w-4 shrink-0", sentimentStyles[item.sentiment])} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={cn("text-[10px] font-medium", categoryStyles[item.category])}
                  >
                    {item.category}
                  </Badge>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                    {item.source}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                  {item.publishedAt}
                </span>
              </div>
            </div>
          )
        })}
        <button className="flex w-full items-center justify-center gap-1 pt-2 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200">
          View all news
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </CardContent>
    </Card>
  )
}
