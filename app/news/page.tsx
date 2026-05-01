'use client'

import { useState, useMemo } from 'react'
import { NewsCard } from '@/components/NewsCard'
import { mockNews } from '@/lib/mock-data'
import { NewsItem } from '@/lib/types'

const categories = [
  { id: 'all', label: 'Tout' },
  { id: 'research', label: 'Recherche' },
  { id: 'release', label: 'Sortie' },
  { id: 'benchmark', label: 'Benchmark' },
  { id: 'industry', label: 'Industrie' },
]

function formatTimeAgo(date: string): string {
  const now = new Date()
  const then = new Date(date)
  const minutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60))
  
  if (minutes < 5) return 'maintenant'
  if (minutes < 60) return `il y a ${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours}h`
  return `il y a ${Math.floor(hours / 24)}j`
}

function isNew(date: string): boolean {
  const now = new Date()
  const then = new Date(date)
  return (now.getTime() - then.getTime()) < 30 * 60 * 1000
}

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [displayCount, setDisplayCount] = useState(12)

  const filteredNews = useMemo(() => {
    if (activeCategory === 'all') return mockNews
    return mockNews.filter(n => n.category === activeCategory)
  }, [activeCategory])

  const featuredNews = filteredNews[0]
  const regularNews = filteredNews.slice(1, displayCount)

  const loadMore = () => {
    setDisplayCount(prev => prev + 12)
  }

  return (
    <div className="relative p-6">
      <span className="mesh-orb right-[12%] top-[4%] h-56 w-56 bg-primary/20"></span>
      <div className="max-w-7xl mx-auto">
        <div className="intel-card relative overflow-hidden rounded-[28px] p-6 mb-5">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="signal-ring rounded-full bg-white/[0.04] px-3 py-1 text-2xs font-mono uppercase tracking-[0.24em] text-primary">AI Newsroom</span>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-2xs font-mono text-text-muted">Flux éditorial</span>
              </div>
              <h1 className="text-[38px] font-semibold leading-none tracking-[-0.055em] md:text-[54px]">
                Radar mondial de l&apos;IA.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
                Les annonces, benchmarks et signaux faibles filtrés pour comprendre ce qui change vraiment.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-right">
              <div className="text-2xs uppercase tracking-[0.2em] text-text-faint">Articles indexés</div>
              <div className="mt-1 text-3xl font-semibold text-primary">{filteredNews.length}</div>
            </div>
          </div>
        </div>

        <div className="sticky top-[32px] z-40 mb-6 flex gap-2 rounded-2xl border border-white/10 bg-[#070711]/78 p-2 backdrop-blur-xl">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id)
                setDisplayCount(12)
              }}
              className={`rounded-xl px-3 py-2 text-sm transition-colors ${
                activeCategory === cat.id
                  ? 'bg-white/[0.09] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'text-text-muted hover:text-text hover:bg-white/[0.045]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {featuredNews && (
              <a href={featuredNews.url} target="_blank" rel="noopener noreferrer" className="intel-card intel-card-hover relative block overflow-hidden rounded-[28px] p-6 cursor-pointer group">
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber/10 blur-3xl"></div>
                <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full bg-white/[0.045] px-2.5 py-1 text-2xs font-mono text-text-faint uppercase tracking-[0.16em]">
                    {featuredNews.source}
                  </span>
                  <span className="text-2xs font-mono text-primary">
                    {formatTimeAgo(featuredNews.published_at)}
                  </span>
                  {featuredNews.is_breaking && (
                    <span className="px-2 py-0.5 bg-amber/10 text-amber text-2xs font-medium rounded-full border border-amber/20">
                      FLASH
                    </span>
                  )}
                  {isNew(featuredNews.published_at) && (
                    <span className="px-2 py-0.5 bg-primary/15 text-primary text-2xs font-medium rounded-full animate-pulse">
                      NOUV.
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-semibold mb-3 group-hover:text-primary transition-colors tracking-[-0.045em] leading-tight">
                  {featuredNews.title}
                </h2>
                <p className="text-sm text-text-muted leading-relaxed">
                  {featuredNews.summary}
                </p>
                <div className="flex items-center gap-4 mt-5">
                  <div className="flex flex-wrap gap-2">
                    {featuredNews.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-white/[0.05] text-2xs text-text-muted rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  {featuredNews.hype_score > 70 && (
                    <span className="ml-auto rounded-full bg-amber/10 px-2.5 py-1 text-2xs text-amber">🔥 {featuredNews.hype_score}</span>
                  )}
                </div>
                </div>
              </a>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regularNews.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>

            {displayCount < filteredNews.length && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={loadMore}
                  className="rounded-full border border-white/10 bg-white/[0.045] px-6 py-2.5 text-sm text-text-muted hover:text-text hover:bg-white/[0.075] transition-colors"
                >
                  Charger plus ({filteredNews.length - displayCount} restants)
                </button>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="intel-card rounded-[24px] p-5">
              <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-[0.2em]">
                Tendances
              </h3>
              <div className="flex flex-wrap gap-2">
                {['GPT-5', 'Claude', 'open-source', 'multimodal', 'reasoning', 'coding', 'benchmark', 'enterprise'].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-white/[0.045] text-xs text-text-muted hover:bg-white/[0.075] hover:text-text cursor-pointer transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="intel-card rounded-[24px] p-5">
              <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-[0.2em]">
                Sources
              </h3>
              <div className="space-y-2">
                {['OpenAI', 'Anthropic', 'Google', 'Meta', 'HuggingFace', 'ArXiv'].map((source) => (
                  <div key={source} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2 text-sm">
                    <span className="text-text-muted">{source}</span>
                    <span className="text-2xs font-mono text-text-faint">
                      {mockNews.filter(n => n.source === source).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
